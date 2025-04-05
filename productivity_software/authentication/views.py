from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from datetime import timedelta
from .serializers import (
    RegistrationSerializer, LoginSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    TwoFactorVerifySerializer, UserProfileSerializer
)
from users.models import UserProfile
import pyotp
from django.conf import settings
import hashlib
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

User = get_user_model()

@extend_schema_view(
    post=extend_schema(
        tags=['Authentication'],
        summary="Register a new user",
        description="Creates a new user account with the provided information and sends a verification email.",
        responses={201: None},
        examples=[
            OpenApiExample(
                'Register Example',
                value={
                    "username": "newuser",
                    "email": "user@example.com",
                    "password": "SecurePassword123",
                    "password_confirm": "SecurePassword123",
                    "first_name": "New",
                    "last_name": "User",
                    "phone_number": "+1234567890",
                    "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                }
            )
        ]
    )
)
class RegisterView(APIView):
    """
    User registration endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:Registration
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate verification token
            from django.contrib.auth.tokens import default_token_generator
            token = default_token_generator.make_token(user)
            
            # Send verification email (implementation omitted)
            # self.send_verification_email(user, token)
            
            return Response({
                "message": "User registered successfully. Please verify your email.",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema_view(
    post=extend_schema(
        tags=['Authentication'],
        summary="Login user",
        description="Authenticates user with username/email and password, returns JWT tokens.",
        responses={200: None},
        examples=[
            OpenApiExample(
                'Login with Username Example',
                value={
                    "username": "testuser",
                    "password": "SecurePassword123"
                }
            ),
            OpenApiExample(
                'Login with Email Example',
                value={
                    "email": "user@example.com",
                    "password": "SecurePassword123"
                }
            )
        ]
    )
)
class LoginView(APIView):
    """
    User login endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:Login
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # Get credentials
            username = serializer.validated_data.get('username')
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')
            
            # Find user by username or email
            if username:
                user = authenticate(username=username, password=password)
            else:
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            if user:
                # Check if account is locked
                if user.locked_until and user.locked_until > timezone.now():
                    return Response({
                        "error": "Account locked. Try again later.",
                        "locked_until": user.locked_until
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Reset login attempts on successful login
                user.login_attempts = 0
                user.last_login_ip = self.get_client_ip(request)
                user.save()
                
                # Check if 2FA is enabled
                if hasattr(user, 'profile') and user.profile.two_factor_enabled:
                    # Generate and send 2FA code (implementation omitted)
                    totp = pyotp.TOTP(self.get_totp_secret(user))
                    code = totp.now()
                    
                    # In a real app, you would send this code via SMS/email
                    # For simplicity, we're returning it in the response
                    return Response({
                        "message": "2FA verification required",
                        "requires_2fa": True,
                        "user_id": user.id,
                        "temp_token": self.generate_temp_token(user)
                    }, status=status.HTTP_200_OK)
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email
                    }
                }, status=status.HTTP_200_OK)
            else:
                # Handle failed login
                if username:
                    user_exist_check = User.objects.filter(username=username).first()
                else:
                    user_exist_check = User.objects.filter(email=email).first()
                
                if user_exist_check:
                    # Implement account lockout
                    user_exist_check.login_attempts += 1
                    if user_exist_check.login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                        user_exist_check.locked_until = timezone.now() + timedelta(minutes=30)
                    user_exist_check.save()
                
                return Response({
                    "error": "Invalid credentials"
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_totp_secret(self, user):
        # In a real app, you would retrieve this from a secure storage
        return f"SECRET_{user.id}"
    
    def generate_temp_token(self, user):
        # Generate a temporary token for 2FA verification
        # In a real app, this would be more secure
        token_data = f"{user.id}:{timezone.now().timestamp()}:{settings.SECRET_KEY}"
        return hashlib.sha256(token_data.encode()).hexdigest()

@extend_schema_view(
    post=extend_schema(
        tags=['Authentication'],
        summary="Logout user",
        description="Invalidates the provided refresh token to log out the user.",
        responses={200: None},
        examples=[
            OpenApiExample(
                'Logout Example',
                value={
                    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
            )
        ]
    )
)
class LogoutView(APIView):
    """
    User logout endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:Logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Get refresh token from request
            refresh_token = request.data.get("refresh")
            if refresh_token:
                # Parse token and add to blacklist
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    """
    Verify email endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:EmailVerification
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            # Parse the token to get user
            # This is a simplified implementation
            from django.contrib.auth.tokens import default_token_generator
            
            # Get user ID from URL path
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Find the user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            # Verify token
            is_valid = default_token_generator.check_token(user, token)
            if is_valid:
                # Mark email as verified
                user.is_email_verified = True
                user.save()
                
                return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """
    Request password reset endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:PasswordReset
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if user with this email exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Don't reveal that the user doesn't exist
                return Response({"message": "If a user with this email exists, a password reset link has been sent."}, 
                               status=status.HTTP_200_OK)
            
            # Generate password reset token
            from django.contrib.auth.tokens import default_token_generator
            token = default_token_generator.make_token(user)
            
            # Send password reset email (implementation omitted)
            # self.send_password_reset_email(user, token)
            
            return Response({"message": "Password reset link has been sent to your email."}, 
                           status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    """
    Confirm password reset endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:PasswordReset
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            
            # Find the user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Verify token
            from django.contrib.auth.tokens import default_token_generator
            is_valid = default_token_generator.check_token(user, token)
            
            if is_valid:
                # Set new password
                user.set_password(password)
                
                # Reset login attempts and locked status
                user.login_attempts = 0
                user.locked_until = None
                user.save()
                
                return Response({"message": "Password has been reset successfully."}, 
                               status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorVerifyView(APIView):
    """
    Verify two-factor authentication code.
    @requirement 7_Security_Requirements.md:User_Authentication:MultiFactor
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            code = serializer.validated_data['code']
            temp_token = serializer.validated_data['temp_token']
            
            # Find the user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Verify temp token (simplified implementation)
            expected_token = self.generate_temp_token(user)
            if temp_token != expected_token:
                return Response({"error": "Invalid temporary token"}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Verify 2FA code
            totp = pyotp.TOTP(self.get_totp_secret(user))
            if totp.verify(code):
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid verification code"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_totp_secret(self, user):
        # In a real app, you would retrieve this from a secure storage
        return f"SECRET_{user.id}"
    
    def generate_temp_token(self, user):
        # Generate a temporary token for 2FA verification
        # This should match the token generation in LoginView
        token_data = f"{user.id}:{timezone.now().timestamp():.0f}:{settings.SECRET_KEY}"
        return hashlib.sha256(token_data.encode()).hexdigest()

class OAuthGoogleLoginView(APIView):
    """
    Google OAuth login endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:OAuth
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # This is a simplified implementation 
        # In a real app, you would use a library like python-social-auth
        code = request.data.get('code')
        if not code:
            return Response({"error": "Authorization code is required"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for tokens (implementation omitted)
        # tokens = exchange_code_for_token(code)
        
        # Get user info from Google (implementation omitted)
        # user_info = get_user_info_from_google(tokens['access_token'])
        
        # Find or create user
        # email = user_info['email']
        # user = User.objects.filter(email=email).first()
        # if not user:
        #     # Create new user
        #     user = User.objects.create_user(...)
        
        # Generate JWT tokens
        # refresh = RefreshToken.for_user(user)
        
        # This is a mock implementation
        return Response({
            "message": "Google OAuth login would be implemented here",
            # "refresh": str(refresh),
            # "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

class OAuthMicrosoftLoginView(APIView):
    """
    Microsoft OAuth login endpoint.
    @requirement 7_Security_Requirements.md:User_Authentication:OAuth
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # This is a simplified implementation 
        # In a real app, you would use a library like MSAL (Microsoft Authentication Library)
        code = request.data.get('code')
        if not code:
            return Response({"error": "Authorization code is required"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for tokens (implementation omitted)
        # tokens = exchange_code_for_token(code)
        
        # Get user info from Microsoft (implementation omitted)
        # user_info = get_user_info_from_microsoft(tokens['access_token'])
        
        # Find or create user
        # email = user_info['email']
        # user = User.objects.filter(email=email).first()
        # if not user:
        #     # Create new user
        #     user = User.objects.create_user(...)
        
        # Generate JWT tokens
        # refresh = RefreshToken.for_user(user)
        
        # This is a mock implementation
        return Response({
            "message": "Microsoft OAuth login would be implemented here",
            # "refresh": str(refresh),
            # "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

@extend_schema_view(
    get=extend_schema(
        tags=['Authentication'],
        summary="Index of authentication endpoints",
        description="Shows all available authentication endpoints with their descriptions.",
    )
)
class IndexView(APIView):
    """
    Index view for authentication API endpoints.
    Displays available endpoints for the authentication system.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        available_endpoints = {
            "endpoints": [
                {"path": "register/", "method": "POST", "description": "Register a new user"},
                {"path": "login/", "method": "POST", "description": "Authenticate user and get tokens"},
                {"path": "logout/", "method": "POST", "description": "Logout and invalidate tokens"},
                {"path": "token/refresh/", "method": "POST", "description": "Get new access token using refresh token"},
                {"path": "token/verify/", "method": "POST", "description": "Verify token validity"},
                {"path": "password/reset/", "method": "POST", "description": "Request password reset email"},
                {"path": "password/reset/confirm/", "method": "POST", "description": "Set new password with reset token"},
                {"path": "email/verify/<token>/", "method": "GET", "description": "Verify email address"},
                {"path": "2fa/verify/", "method": "POST", "description": "Verify two-factor authentication code"},
                {"path": "oauth/google/", "method": "POST", "description": "Login with Google"},
                {"path": "oauth/microsoft/", "method": "POST", "description": "Login with Microsoft"},
            ],
            "version": "1.0.0"
        }
        return Response(available_endpoints) 