from django.db import migrations


def create_default_roles(apps, schema_editor):
    Role = apps.get_model('authentication', 'Role')
    default_roles = [
        {
            'name': 'Admin',
            'description': 'Manages products, categories, inventory, customers, and the admin dashboard.',
        },
        {
            'name': 'Customer',
            'description': 'Browses products, manages their account, and places orders.',
        },
    ]
    for role_data in default_roles:
        Role.objects.get_or_create(
            name=role_data['name'],
            defaults={'description': role_data['description']}
        )


def remove_default_roles(apps, schema_editor):
    Role = apps.get_model('authentication', 'Role')
    Role.objects.filter(name__in=['Admin', 'Customer']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_role_userprofile'),
    ]

    operations = [
        migrations.RunPython(create_default_roles, remove_default_roles),
    ]
