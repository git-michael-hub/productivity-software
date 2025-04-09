from django.contrib import admin
from .models import Organization, OrganizationInvite

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """Admin configuration for Organization model."""
    list_display = ('name', 'slug', 'contact_email', 'is_active', 'member_count')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug', 'contact_email')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {'fields': ('name', 'slug', 'description', 'is_active')}),
        ('Contact Information', {'fields': ('contact_email', 'contact_phone', 'website', 'address')}),
        ('Branding', {'fields': ('logo_url', 'primary_color', 'secondary_color', 'custom_domain')}),
        ('Resource Limits', {'fields': ('max_users', 'max_storage_gb')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(OrganizationInvite)
class OrganizationInviteAdmin(admin.ModelAdmin):
    """Admin configuration for OrganizationInvite model."""
    list_display = ('email', 'organization', 'invited_by', 'created_at', 'expires_at', 'accepted')
    list_filter = ('accepted', 'organization', 'created_at')
    search_fields = ('email', 'organization__name', 'invited_by__username')
    readonly_fields = ('token', 'created_at', 'accepted_at') 