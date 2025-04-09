from django.core.management.base import BaseCommand
from django.utils.text import slugify
from organizations.models import Organization

class Command(BaseCommand):
    help = 'Creates a global organization if it does not exist'

    def handle(self, *args, **options):
        org_name = "Global"
        org_slug = slugify(org_name)
        
        if not Organization.objects.filter(slug=org_slug).exists():
            org = Organization.objects.create(
                name=org_name,
                slug=org_slug,
                description="Global organization for system-wide resources",
                is_active=True,
                contact_email="admin@example.com",
                max_users=1000,
                max_storage_gb=1000
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created global organization "{org.name}"')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Global organization already exists')
            ) 