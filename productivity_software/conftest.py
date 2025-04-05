import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    """Return an authenticated API client."""
    return APIClient()

@pytest.fixture
def authenticated_client(db):
    """Return an authenticated API client."""
    client = APIClient()
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='securepassword123'
    )
    client.force_authenticate(user=user)
    return client, user 