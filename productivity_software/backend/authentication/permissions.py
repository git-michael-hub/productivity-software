from rest_framework import permissions

class RoleBasedPermission(permissions.BasePermission):
    """
    Role-based permission class.
    @requirement 7_Security_Requirements.md:Authorization:RoleBasedAccess
    """
    
    def __init__(self, required_roles=None):
        self.required_roles = required_roles or []
        self.allow_safe_methods = True
    
    def has_permission(self, request, view):
        # Allow safe methods if specified
        if self.allow_safe_methods and request.method in permissions.SAFE_METHODS:
            return True
            
        # Require authentication
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Superusers have all permissions
        if request.user.is_superuser:
            return True
            
        # Check if user has any of the required roles
        if self.required_roles:
            user_roles = [role.name for role in request.user.roles.all()]
            return any(role in user_roles for role in self.required_roles)
            
        # If no roles specified, allow authenticated users
        return True

class IsAdminRole(RoleBasedPermission):
    """
    Permission class for admin-only access.
    @requirement 7_Security_Requirements.md:Authorization:AdminAccess
    """
    required_roles = ['Admin']
    allow_safe_methods = False

class IsManagerOrAdmin(RoleBasedPermission):
    """
    Permission class for manager or admin access.
    @requirement 7_Security_Requirements.md:Authorization:ManagerAccess
    """
    required_roles = ['Manager', 'Admin']
    allow_safe_methods = False

class ReadOnly(permissions.BasePermission):
    """
    Permission class for read-only access.
    @requirement 7_Security_Requirements.md:Authorization:ReadOnlyAccess
    """
    
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission for owner-based editing.
    @requirement 7_Security_Requirements.md:Authorization:ResourceOwnership
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if the user is the owner of the object
        return obj.owner == request.user

class SameOrganizationPermission(permissions.BasePermission):
    """
    Permission to restrict access to users in the same organization.
    @requirement 20_Multi_Tenancy_Requirements.md:Data_Isolation
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if user and object are in the same organization
        if hasattr(obj, 'organization'):
            user_org = request.user.profile.organization
            return obj.organization == user_org
            
        # If object has an owner, check if owner is in same organization
        elif hasattr(obj, 'owner') and hasattr(obj.owner, 'profile'):
            user_org = request.user.profile.organization
            owner_org = obj.owner.profile.organization
            return user_org == owner_org
            
        return False 