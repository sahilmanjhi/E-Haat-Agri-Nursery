"""
Management command: seed_orders
Note: Synthetic and fake demo orders have been disabled per project requirements.
All metrics and order management are driven strictly by authentic database entries.
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Synthetic demo orders are disabled. Live database models are used.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Synthetic demo orders are disabled. All data is real.'))
