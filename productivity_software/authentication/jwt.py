from rest_framework_simplejwt.tokens import Token
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.settings import api_settings
from datetime import timedelta

class AccessToken(Token):
    """
    Custom access token with additional claims.
    @requirement 7_Security_Requirements.md:Authentication:JWT
    """
    token_type = 'access'
    lifetime = api_settings.ACCESS_TOKEN_LIFETIME

    @classmethod
    def for_user(cls, user):
        """
        Create a JWT token for a user with additional claims.
        @requirement 7_Security_Requirements.md:Authentication:CustomClaims
        """
        token = super().for_user(user)
        
        # Add custom claims
        token['email'] = user.email
        token['username'] = user.username
        
        # Add user roles if available
        roles = [role.name for role in user.roles.all()]
        token['roles'] = roles
        
        # Add organization if available
        try:
            if user.profile.organization:
                token['organization'] = str(user.profile.organization.id)
        except:
            pass
            
        return token

class RefreshToken(Token):
    """
    Custom refresh token with rotating refresh token capability.
    @requirement 7_Security_Requirements.md:Authentication:JWT
    """
    token_type = 'refresh'
    lifetime = api_settings.REFRESH_TOKEN_LIFETIME
    
    @property
    def access_token(self):
        """
        Generate a new access token from this refresh token.
        """
        access = AccessToken()
        
        # Copy claims from refresh token to access token
        access.payload = self.payload.copy()
        access.payload.update({
            'exp': access.current_time + access.lifetime,
            'token_type': access.token_type,
        })
        
        return access 