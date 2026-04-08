import ssl
from django.core.mail.backends.smtp import EmailBackend

class SSLErrorIgnoringEmailBackend(EmailBackend):
    def open(self):
        if self.connection:
            return False
        try:
            # بنقوله متدققش في شهادة الـ SSL
            self.connection = self.connection_class(
                self.host, self.port, timeout=self.timeout)
            
            # تعطيل التحقق من الشهادة (زي ما كنت عامل في مشروعك القديم)
            self.connection.set_debuglevel(0)
            self.connection.ehlo()
            self.connection.starttls(context=ssl._create_unverified_context())
            self.connection.ehlo()
            self.connection.login(self.username, self.password)
            return True
        except:
            if not self.fail_silently:
                raise
            return False
