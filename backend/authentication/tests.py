from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse
from authentication.models import Role, UserProfile
from authentication.permissions import (
    assign_role,
    get_user_role,
    get_user_role_name,
    has_role,
    is_admin_user,
    role_required,
    admin_role_required,
)

User = get_user_model()


class RoleModelTests(TestCase):
    def setUp(self):
        self.creator = User.objects.create_user(username='creator', password='password123')

    def test_default_roles_exist(self):
        admin_role = Role.objects.filter(name='Admin').first()
        customer_role = Role.objects.filter(name='Customer').first()
        self.assertIsNotNone(admin_role)
        self.assertIsNotNone(customer_role)
        self.assertIn('manages products', admin_role.description.lower())
        self.assertIn('browses products', customer_role.description.lower())

    def test_create_custom_role(self):
        role = Role.objects.create(
            name='Vendor',
            description='Sells products on the platform',
            created_by=self.creator,
            updated_by=self.creator,
        )
        self.assertEqual(str(role), 'Vendor')
        self.assertEqual(role.created_by, self.creator)
        self.assertEqual(role.updated_by, self.creator)
        self.assertIsNotNone(role.created_at)
        self.assertIsNotNone(role.updated_at)

    def test_role_name_unique(self):
        with self.assertRaises(IntegrityError):
            Role.objects.create(name='Admin', description='Duplicate admin role')

    def test_role_reverse_relations(self):
        role = Role.objects.create(
            name='Manager',
            created_by=self.creator,
            updated_by=self.creator,
        )
        self.assertIn(role, self.creator.created_roles.all())
        self.assertIn(role, self.creator.updated_roles.all())


class UserRoleAssignmentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='john', password='password123')
        self.admin_user = User.objects.create_user(username='admin_user', password='password123')
        self.superuser = User.objects.create_superuser(username='superadmin', password='password123')

    def test_user_profile_auto_created_by_signal(self):
        self.assertTrue(hasattr(self.user, 'profile'))
        self.assertIsNone(self.user.profile.role)

    def test_assign_role_by_string(self):
        assign_role(self.user, 'Customer')
        self.assertEqual(get_user_role_name(self.user), 'Customer')
        self.assertTrue(has_role(self.user, 'Customer'))
        self.assertFalse(has_role(self.user, 'Admin'))
        self.assertFalse(is_admin_user(self.user))

    def test_assign_role_by_instance(self):
        admin_role = Role.objects.get(name='Admin')
        assign_role(self.admin_user, admin_role)
        self.assertEqual(get_user_role(self.admin_user), admin_role)
        self.assertTrue(has_role(self.admin_user, 'Admin'))
        self.assertTrue(is_admin_user(self.admin_user))

    def test_superuser_has_admin_privileges(self):
        self.assertTrue(has_role(self.superuser, 'Admin'))
        self.assertTrue(is_admin_user(self.superuser))


class RoleProtectionDecoratorTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.customer_user = User.objects.create_user(username='cust', password='password123')
        assign_role(self.customer_user, 'Customer')

        self.admin_user = User.objects.create_user(username='adm', password='password123')
        assign_role(self.admin_user, 'Admin')

    def test_admin_role_required_allows_admin(self):
        @admin_role_required
        def dummy_view(request):
            return HttpResponse("Success")

        request = self.factory.get('/admin-dashboard/')
        request.user = self.admin_user
        response = dummy_view(request)
        self.assertEqual(response.status_code, 200)

    def test_admin_role_required_blocks_customer(self):
        @admin_role_required
        def dummy_view(request):
            return HttpResponse("Success")

        request = self.factory.get('/admin-dashboard/')
        request.user = self.customer_user
        with self.assertRaises(PermissionDenied):
            dummy_view(request)

    def test_admin_role_required_api_json_response(self):
        @admin_role_required(return_json=True)
        def dummy_api_view(request):
            return JsonResponse({"data": "secret"})

        request = self.factory.get('/api/admin-data/')
        request.user = self.customer_user
        response = dummy_api_view(request)
        self.assertEqual(response.status_code, 403)


class AdminSiteRegistrationTests(TestCase):
    def test_role_registered_in_admin(self):
        self.assertIn(Role, admin.site._registry)
