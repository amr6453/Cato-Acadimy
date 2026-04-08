from djoser import email

class ActivationEmail(email.ActivationEmail):
    template_name = 'email/activation.html'

    def get_context_data(self):
        context = super().get_context_data()
        context['site_name'] = 'موقعي الجديد'
        context['url'] = context['url'].replace(':8000', ':5173') # تحويل الرابط للـ Frontend
        return context

    def send(self, to, *args, **kwargs):
        self.render()
        self.subject = f"تفعيل حسابك في {self.get_context_data()['site_name']}"
        context = self.get_context_data()
        self.body = f"مرحباً بك!\n\nيرجى الضغط على الرابط التالي لتفعيل حسابك:\nhttp://localhost:5173/{context['url']}"
        return super().send(to, *args, **kwargs)

# ونفس الكلام لـ PasswordResetEmail بنفس الطريقة اللي كانت عندك
