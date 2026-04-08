from celery import shared_task
import logging
from django.core.mail import get_connection, EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

@shared_task(name='api.tasks.send_email_task')
def send_email_task(subject, message, from_email, recipient_list, **kwargs):
    try:
        # بنستخدم الـ backend الحقيقي اللي بيبعت
        backend = getattr(settings, 'CELERY_EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
        connection = get_connection(backend=backend)
        
        mail = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=from_email,
            to=recipient_list,
            connection=connection
        )
        
        html_message = kwargs.get('html_message')
        if html_message:
            mail.attach_alternative(html_message, "text/html")
             
        sent = mail.send()
        return sent
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False
