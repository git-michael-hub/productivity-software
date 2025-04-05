from django.db import models
import uuid

class Organization(models.Model):
    """
    Organization model for multi-tenant functionality.
    @requirement 20_Multi_Tenancy_Requirements.md:Tenant_Structure
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Custom branding options
    primary_color = models.CharField(max_length=7, default="#007bff")  # Hex color code
    secondary_color = models.CharField(max_length=7, default="#6c757d")
    custom_domain = models.CharField(max_length=255, blank=True)
    
    # Resource limitations
    max_users = models.IntegerField(default=10)
    max_storage_gb = models.IntegerField(default=5)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
        
    @property
    def member_count(self):
        """
        Get the number of users in this organization.
        """
        return self.userprofile_set.count()
        
class OrganizationInvite(models.Model):
    """
    Invitation model for adding users to organizations.
    @requirement 20_Multi_Tenancy_Requirements.md:User_Management
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='invites')
    email = models.EmailField()
    invited_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_invites')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['organization', 'email']
        
    def __str__(self):
        return f"Invite for {self.email} to {self.organization.name}" 