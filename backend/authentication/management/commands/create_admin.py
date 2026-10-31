import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import Role, UserProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create or update an authorized administrator account'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@itmu-ehaat.in', help='Admin email address')
        parser.add_argument('--username', type=str, default='admin', help='Admin username')
        parser.add_argument('--password', type=str, default='AdminPassword123!', help='Admin password')
        parser.add_argument('--first-name', type=str, default='System', help='Admin first name')
        parser.add_argument('--last-name', type=str, default='Admin', help='Admin last name')

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        username = options['username'].strip()
        password = options['password']
        first_name = options['first_name'].strip()
        last_name = options['last_name'].strip()

        admin_role, _ = Role.objects.get_or_create(
            name='Admin',
            defaults={'description': 'Manages products, categories, inventory, customers, and the admin dashboard.'}
        )

        user = User.objects.filter(email__iexact=email).first() or User.objects.filter(username__iexact=username).first()

        if user:
            user.username = username
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
            created = False
        else:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_staff=True,
                is_superuser=True
            )
            created = True

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = admin_role
        profile.save()

        action = "Created new" if created else "Updated existing"
        self.stdout.write(self.style.SUCCESS(
            f"Successfully {action} administrator:\n"
            f"  - Username : {user.username}\n"
            f"  - Email    : {user.email}\n"
            f"  - Role     : {profile.role.name}\n"
            f"  - Staff    : {user.is_staff}\n"
            f"  - Superuser: {user.is_superuser}\n"
        ))
