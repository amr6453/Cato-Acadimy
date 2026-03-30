import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from courses.models import Course, Enrollment
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    """
    Creates a Stripe Checkout Session for course purchase.
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'payment'

    def post(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        course = get_object_or_404(Course, id=course_id)

        # Check if already enrolled
        if Enrollment.objects.filter(user=request.user, course=course, is_active=True).exists():
            return Response({"error": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': course.title,
                        },
                        'unit_amount': int(course.price * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=settings.CLIENT_URL + '/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=settings.CLIENT_URL + '/cancel',
                client_reference_id=str(request.user.id),
                metadata={
                    'course_id': course.id,
                }
            )

            # Create payment record
            Payment.objects.create(
                user=request.user,
                course=course,
                amount=course.price,
                stripe_checkout_id=checkout_session.id,
                status=Payment.PENDING
            )

            return Response({'checkout_url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Handles Stripe webhooks.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self.handle_checkout_session(session)

        return Response(status=status.HTTP_200_OK)

    def handle_checkout_session(self, session):
        checkout_id = session.get('id')
        payment_intent_id = session.get('payment_intent')
        user_id = session.get('client_reference_id')
        course_id = session.get('metadata', {}).get('course_id')

        try:
            payment = Payment.objects.get(stripe_checkout_id=checkout_id)
            payment.stripe_payment_intent_id = payment_intent_id
            payment.status = Payment.COMPLETED
            payment.save()

            # Create Enrollment
            from courses.models import Enrollment
            from users.models import CustomUser
            user = CustomUser.objects.get(id=user_id)
            course = Course.objects.get(id=course_id)
            
            Enrollment.objects.get_or_create(user=user, course=course)
        except Exception as e:
            # Log error
            print(f"Error handling checkout session: {e}")
