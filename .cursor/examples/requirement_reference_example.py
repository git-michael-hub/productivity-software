"""
Example class demonstrating proper requirements traceability in code
"""

# @requirement 3_Technical_Requirements.md:API_Design
# @requirement-version 1.2
class UserAuthController:
    """
    Controller for user authentication operations.
    
    This controller implements the authentication requirements specified in 
    7_Security_Requirements.md, section Authentication & Authorization.
    """
    
    # @requirement 7_Security_Requirements.md:Authentication
    # @requirement 3_Technical_Requirements.md:JWT_Authentication
    def authenticate_user(self, username, password):
        """
        Authenticate a user with username and password
        
        Implements the JWT authentication flow as specified in the technical requirements.
        - Validates credentials against database
        - Issues short-lived JWT access token (15 min)
        - Issues longer-lived refresh token
        - Logs authentication attempts
        
        @requirement 7_Security_Requirements.md:Authentication:JWT
        """
        # Implementation details...
        pass
    
    # @requirement 7_Security_Requirements.md:Authentication:OAuth
    # @requirement-deviation The social login providers are limited to Google and Microsoft
    # for MVP, with Apple planned for a future release.
    def social_login(self, provider, token):
        """
        Authenticate user via OAuth social login
        
        @requirement 7_Security_Requirements.md:Authentication:OAuth
        """
        # Implementation details...
        pass
    
    # @requirement 7_Security_Requirements.md:Authorization:RBAC
    def check_permission(self, user_id, resource, action):
        """
        Check if a user has permission to perform an action on a resource
        
        @requirement 7_Security_Requirements.md:Authorization:RBAC
        """
        # Implementation details...
        pass


# Example test case with proper requirements traceability
import unittest

# @requirement 7_Security_Requirements.md:Authentication:JWT
# @requirement 5_QA_Testing_Requirements.md:Unit_Testing
class TestUserAuthController_REQ_JWT_Auth(unittest.TestCase):
    """
    Test cases verifying the JWT authentication implementation meets requirements.
    
    Verifies requirements from:
    - 7_Security_Requirements.md (Authentication section)
    - 3_Technical_Requirements.md (JWT Authentication section)
    """
    
    def setUp(self):
        self.controller = UserAuthController()
    
    def test_REQ_JWT_ValidCredentials(self):
        """Test that valid credentials successfully authenticate the user"""
        # Test implementation...
        pass
    
    def test_REQ_JWT_TokenExpiry(self):
        """Test that access tokens expire after 15 minutes as specified in requirements"""
        # Test implementation...
        pass
    
    def test_REQ_JWT_RefreshToken(self):
        """Test that refresh tokens can successfully issue new access tokens"""
        # Test implementation...
        pass
    
    def test_REQ_JWT_InvalidCredentials(self):
        """Test that invalid credentials are properly rejected"""
        # Test implementation...
        pass 