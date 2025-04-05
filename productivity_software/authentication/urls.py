from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    RegisterView, LoginView, LogoutView, 
    PasswordResetRequestView, PasswordResetConfirmView,
    VerifyEmailView, TwoFactorVerifyView,
    OAuthGoogleLoginView, OAuthMicrosoftLoginView, IndexView
)

app_name = 'authentication'

urlpatterns = [
    # API Index
    path('', IndexView.as_view(), name='index'),
    
    # Registration and login
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # JWT token management
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Password management
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Email verification
    path('email/verify/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
    
    # Two-factor authentication
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='verify_2fa'),
    
    # OAuth integrations
    path('oauth/google/', OAuthGoogleLoginView.as_view(), name='oauth_google'),
    path('oauth/microsoft/', OAuthMicrosoftLoginView.as_view(), name='oauth_microsoft'),
] 