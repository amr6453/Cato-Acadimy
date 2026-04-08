from django.core.mail.backends.base import BaseEmailBackend
from celery import current_app

class CeleryEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        for message in email_messages:
            html_message = None
            if hasattr(message, 'alternatives') and message.alternatives:
                for alt, mimetype in message.alternatives:
                    if mimetype == "text/html":
                        html_message = alt
                        break

            current_app.send_task(
                'api.tasks.send_email_task',
                args=[message.subject, message.body, message.from_email, message.to],
                kwargs={'html_message': html_message}
            )
        return len(email_messages)
