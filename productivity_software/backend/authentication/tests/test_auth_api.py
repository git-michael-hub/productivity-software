from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
import json
import uuid

User = get_user_model()

class CheckAuthStatusViewTests(TestCase):
    """Test the auth status API endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.auth_check_url = reverse('authentication:check_auth')
        
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_auth_status_unauthenticated(self):
        """Test checking auth status for unauthenticated user"""
        # The API now returns 401 for unauthenticated users
        response = self.client.get(self.auth_check_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_auth_status_authenticated(self):
        """Test checking auth status for authenticated user"""
        # Force authenticate the user
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.auth_check_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Parse the response
        data = json.loads(response.content)
        self.assertTrue(data['isAuthenticated'])
        
        # Convert UUID to string for comparison
        user_id_str = str(self.user.id)
        self.assertEqual(data['user']['id'], user_id_str)
        self.assertEqual(data['user']['email'], self.user.email)
        self.assertEqual(data['user']['username'], self.user.username)
    
    def test_auth_status_with_token(self):
        """Test checking auth status with token authentication"""
        # Get auth token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        
        # Authenticate with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.auth_check_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Parse the response
        data = json.loads(response.content)
        self.assertTrue(data['isAuthenticated'])
        
        # Convert UUID to string for comparison
        user_id_str = str(self.user.id)
        self.assertEqual(data['user']['id'], user_id_str) 