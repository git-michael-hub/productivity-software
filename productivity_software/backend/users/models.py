from django.db import models
from django.contrib.auth.models import AbstractUser, Permission, Group
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
import uuid
from organizations.models import Organization

class Role(models.Model):
    """
    Role model for role-based access control.
    @requirement 7_Security_Requirements.md:Authorization:RoleBasedAccess
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    Extended User model with additional fields.
    @requirement 7_Security_Requirements.md:User_Authentication:UserModel
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    roles = models.ManyToManyField(Role, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    def has_perm(self, perm, obj=None):
        """
        Check if user has specific permission from roles or Django permissions.
        @requirement 7_Security_Requirements.md:Authorization:PermissionChecking
        """
        if self.is_superuser:
            return True
        
        # Check Django's built-in permissions
        has_django_perm = super().has_perm(perm, obj)
        if has_django_perm:
            return True
        
        # Check role-based permissions
        if '.' in perm:
            app_label, codename = perm.split('.')
            try:
                # Find permissions with this codename across all content types in the app
                permissions = Permission.objects.filter(
                    content_type__app_label=app_label,
                    codename=codename
                )
                # Check if the user has any role with these permissions
                for permission in permissions:
                    if self.roles.filter(permissions=permission).exists():
                        return True
                return False
            except Permission.DoesNotExist:
                return False
        return False

class UserProfile(models.Model):
    """
    User Profile model with extended user information.
    @requirement 7_Security_Requirements.md:User_Authentication:ProfileSecurity
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True)
    bio = models.TextField(blank=True)
    profile_image = models.URLField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language_preference = models.CharField(max_length=10, default='en')
    preferences = models.JSONField(default=dict)
    two_factor_enabled = models.BooleanField(default=False)
    security_question = models.CharField(max_length=255, blank=True)
    security_answer_hash = models.CharField(max_length=255, blank=True)
    
    def set_security_question(self, question, answer):
        """
        Store security question and hashed answer.
        @requirement 7_Security_Requirements.md:User_Authentication:SecurityQuestions
        """
        from django.contrib.auth.hashers import make_password
        self.security_question = question
        self.security_answer_hash = make_password(answer.lower().strip())
        self.save()
    
    def verify_security_answer(self, answer):
        """
        Verify user's security answer.
        @requirement 7_Security_Requirements.md:User_Authentication:SecurityQuestions
        """
        from django.contrib.auth.hashers import check_password
        return check_password(answer.lower().strip(), self.security_answer_hash) 