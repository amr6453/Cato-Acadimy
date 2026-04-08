from django.core.management.base import BaseCommand
from users.models import CustomUser

class Command(BaseCommand):
    help = 'Resets all users passwords to Password@123 for testing/demo purposes'

    def handle(self, *args, **options):
        users = CustomUser.objects.all()
        count = users.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No users found to reset passwords.'))
            return

        password = 'Password@123'
        for user in users:
            user.set_password(password)
            user.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully reset passwords for {count} users to "{password}"'))
