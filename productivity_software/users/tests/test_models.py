"""
Test module for the User and UserProfile models.
@requirement 7_Security_Requirements.md:User_Authentication:UserModel
"""
import uuid
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.hashers import check_password
from users.models import UserProfile, Role, User
from organizations.models import Organization

@pytest.mark.django_db
class TestUserModel(TestCase):
    """
    Tests for the custom User model.
    @requirement 7_Security_Requirements.md:User_Authentication:UserModel
    """
    
    def setUp(self):
        """Set up test data for User model tests."""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'SecurePassword123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+1234567890'
        }
        self.user = User.objects.create_user(**self.user_data)
        
        # Create a role with permissions
        self.content_type = ContentType.objects.get_for_model(User)
        self.permission = Permission.objects.create(
            codename='test_permission',
            name='Test Permission',
            content_type=self.content_type
        )
        
        self.role = Role.objects.create(name='TestRole', description='Test role description')
        self.role.permissions.add(self.permission)
        
        # Add role to user
        self.user.roles.add(self.role)
    
    def test_user_creation(self):
        """
        Test that a user can be created with expected fields.
        @requirement 7_Security_Requirements.md:User_Authentication:UserCreation
        """
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.first_name, 'Test')
        self.assertEqual(self.user.last_name, 'User')
        self.assertEqual(self.user.phone_number, '+1234567890')
        self.assertFalse(self.user.is_email_verified)
        self.assertFalse(self.user.is_phone_verified)
        self.assertEqual(self.user.login_attempts, 0)
        self.assertIsNone(self.user.locked_until)
        self.assertIsInstance(self.user.id, uuid.UUID)
    
    def test_user_has_perm_with_role(self):
        """
        Test that permissions from roles are properly checked.
        @requirement 7_Security_Requirements.md:Authorization:PermissionChecking
        """
        # Test permission from role
        has_perm = self.user.has_perm(f'{self.content_type.app_label}.test_permission')
        self.assertTrue(has_perm)
        
        # Test non-existent permission
        has_perm = self.user.has_perm('app.non_existent_permission')
        self.assertFalse(has_perm)
    
    def test_user_has_perm_superuser(self):
        """
        Test that superusers have all permissions.
        @requirement 7_Security_Requirements.md:Authorization:PermissionChecking
        """
        # Make user a superuser
        self.user.is_superuser = True
        self.user.save()
        
        # Superuser should have all permissions
        has_perm = self.user.has_perm('any.permission')
        self.assertTrue(has_perm)

@pytest.mark.django_db
class TestUserProfileModel(TestCase):
    """
    Tests for the UserProfile model.
    @requirement 7_Security_Requirements.md:User_Authentication:ProfileSecurity
    """
    
    def setUp(self):
        """Set up test data for UserProfile model tests."""
        self.user = User.objects.create_user(
            username='profiletest',
            email='profile@example.com',
            password='SecurePassword123'
        )
        
        self.organization = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='org@example.com'
        )
        
        self.profile = UserProfile.objects.create(
            user=self.user,
            organization=self.organization,
            bio='Test bio information',
            profile_image='https://example.com/image.jpg',
            timezone='America/New_York',
            language_preference='en-US',
            two_factor_enabled=False
        )
    
    def test_profile_creation(self):
        """
        Test that a user profile can be created with expected fields.
        @requirement 7_Security_Requirements.md:User_Authentication:ProfileSecurity
        """
        self.assertEqual(self.profile.user, self.user)
        self.assertEqual(self.profile.organization, self.organization)
        self.assertEqual(self.profile.bio, 'Test bio information')
        self.assertEqual(self.profile.profile_image, 'https://example.com/image.jpg')
        self.assertEqual(self.profile.timezone, 'America/New_York')
        self.assertEqual(self.profile.language_preference, 'en-US')
        self.assertFalse(self.profile.two_factor_enabled)
    
    def test_security_question_setup(self):
        """
        Test setting and verifying security questions.
        @requirement 7_Security_Requirements.md:User_Authentication:SecurityQuestions
        """
        # Set security question and answer
        question = "What is your favorite color?"
        answer = "Blue"
        self.profile.set_security_question(question, answer)
        
        # Check that question is stored and answer is hashed
        self.assertEqual(self.profile.security_question, question)
        self.assertNotEqual(self.profile.security_answer_hash, answer)
        
        # Verify correct answer
        self.assertTrue(self.profile.verify_security_answer(answer))
        
        # Verify incorrect answer
        self.assertFalse(self.profile.verify_security_answer("Red"))
        
        # Test case insensitivity
        self.assertTrue(self.profile.verify_security_answer("blue"))
        
        # Test whitespace handling
        self.assertTrue(self.profile.verify_security_answer(" Blue "))

@pytest.mark.django_db
class TestRoleModel(TestCase):
    """
    Tests for the Role model.
    @requirement 7_Security_Requirements.md:Authorization:RoleBasedAccess
    """
    
    def setUp(self):
        """Set up test data for Role model tests."""
        self.role_data = {
            'name': 'Administrator',
            'description': 'Full system access'
        }
        self.role = Role.objects.create(**self.role_data)
        
        # Create permissions (if they don't already exist)
        self.content_type = ContentType.objects.get_for_model(User)
        
        # Try to get or create the first permission
        try:
            self.permission1 = Permission.objects.get(
                codename='create_user',
                content_type=self.content_type
            )
        except Permission.DoesNotExist:
            self.permission1 = Permission.objects.create(
                codename='create_user',
                name='Can create user',
                content_type=self.content_type
            )
            
        # Try to get or create the second permission    
        try:
            self.permission2 = Permission.objects.get(
                codename='delete_user',
                content_type=self.content_type
            )
        except Permission.DoesNotExist:
            self.permission2 = Permission.objects.create(
                codename='delete_user',
                name='Can delete user',
                content_type=self.content_type
            )
        
        # Add permissions to role
        self.role.permissions.add(self.permission1, self.permission2)
    
    def test_role_creation(self):
        """
        Test that a role can be created with expected fields.
        @requirement 7_Security_Requirements.md:Authorization:RoleBasedAccess
        """
        self.assertEqual(self.role.name, 'Administrator')
        self.assertEqual(self.role.description, 'Full system access')
        self.assertEqual(self.role.permissions.count(), 2)
    
    def test_role_string_representation(self):
        """
        Test the string representation of a Role object.
        @requirement 7_Security_Requirements.md:Authorization:RoleBasedAccess
        """
        self.assertEqual(str(self.role), 'Administrator')
    
    def test_role_permissions_assignment(self):
        """
        Test adding and removing permissions from a role.
        @requirement 7_Security_Requirements.md:Authorization:RoleBasedAccess
        """
        # Test permissions were added
        self.assertTrue(self.role.permissions.filter(codename='create_user').exists())
        self.assertTrue(self.role.permissions.filter(codename='delete_user').exists())
        
        # Test removing a permission
        self.role.permissions.remove(self.permission1)
        self.assertFalse(self.role.permissions.filter(codename='create_user').exists())
        self.assertTrue(self.role.permissions.filter(codename='delete_user').exists()) 