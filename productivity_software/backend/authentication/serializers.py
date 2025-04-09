from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from users.models import UserProfile
from organizations.models import Organization

User = get_user_model()

class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    @requirement 7_Security_Requirements.md:User_Authentication:Registration
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    organization_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'organization_id', 'phone_number')
    
    def validate(self, attrs):
        """
        Validate registration data.
        @requirement 7_Security_Requirements.md:User_Authentication:PasswordPolicy
        """
        # Check if passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if organization exists if provided
        if 'organization_id' in attrs and attrs['organization_id']:
            try:
                attrs['organization'] = Organization.objects.get(id=attrs['organization_id'])
            except Organization.DoesNotExist:
                raise serializers.ValidationError({"organization_id": "Organization not found."})
        
        return attrs
    
    def create(self, validated_data):
        """
        Create user and user profile.
        @requirement 7_Security_Requirements.md:User_Authentication:UserCreation
        """
        organization = validated_data.pop('organization', None) if 'organization' in validated_data else None
        validated_data.pop('password_confirm')
        validated_data.pop('organization_id', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create user profile
        profile = UserProfile.objects.create(
            user=user,
            organization=organization
        )
        
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    @requirement 7_Security_Requirements.md:User_Authentication:Login
    """
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """
        Validate login credentials.
        @requirement 7_Security_Requirements.md:User_Authentication:AccountLockout
        """
        if not attrs.get('username') and not attrs.get('email'):
            raise serializers.ValidationError({"authentication": "Must provide either username or email."})
        
        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    @requirement 7_Security_Requirements.md:User_Authentication:PasswordReset
    """
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    @requirement 7_Security_Requirements.md:User_Authentication:PasswordReset
    """
    token = serializers.CharField(required=True)
    user_id = serializers.UUIDField(required=False)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        """
        Validate password reset data.
        """
        # Check if passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        return attrs

class TwoFactorVerifySerializer(serializers.Serializer):
    """
    Serializer for two-factor authentication verification.
    @requirement 7_Security_Requirements.md:User_Authentication:MultiFactor
    """
    user_id = serializers.UUIDField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)
    temp_token = serializers.CharField(required=True)

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ('bio', 'profile_image', 'date_of_birth', 'timezone', 
                  'language_preference', 'organization_name', 'two_factor_enabled')
        read_only_fields = ('two_factor_enabled',) 