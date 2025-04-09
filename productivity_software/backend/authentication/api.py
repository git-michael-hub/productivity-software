from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class CheckAuthStatusView(APIView):
    """
    API endpoint to check if the user is authenticated
    """
    
    def get(self, request):
        """
        Returns the authentication status of the current user
        """
        if request.user.is_authenticated:
            return Response({
                "isAuthenticated": True,
                "user": {
                    "id": request.user.id,
                    "email": request.user.email,
                    "username": request.user.username
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "isAuthenticated": False,
                "detail": "Authentication credentials were not provided."
            }, status=status.HTTP_401_UNAUTHORIZED) 