"""
Example API endpoint demonstrating proper alignment with requirements
"""

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Define serializers that align with requirements
# @requirement 3_Technical_Requirements.md:API_Design:Request_Validation
class DocumentCreateSerializer(serializers.Serializer):
    """
    Request serializer for document creation endpoint.
    
    Validates all required fields as specified in:
    2_Product_Requirements.md, section 'Document Creation Requirements'
    """
    title = serializers.CharField(
        max_length=255,  # @requirement 2_Product_Requirements.md:Document:MaxTitleLength
        required=True    # @requirement 2_Product_Requirements.md:Document:RequiredFields
    )
    content = serializers.CharField(
        required=True    # @requirement 2_Product_Requirements.md:Document:RequiredFields
    )
    folder_id = serializers.UUIDField(
        required=False   # @requirement 2_Product_Requirements.md:Document:OptionalFields
    )
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,  # @requirement 2_Product_Requirements.md:Document:OptionalFields
        max_length=10    # @requirement 2_Product_Requirements.md:Document:MaxTagCount
    )


# API View that aligns with requirements
# @api-requirement 3_Technical_Requirements.md:API_Design:RESTful_Endpoints
# @api-requirement 2_Product_Requirements.md:Document_Management:Creation
class DocumentAPIView(APIView):
    """
    API endpoints for document management.
    
    Implements functionality specified in:
    - 2_Product_Requirements.md (Document Management section)
    - 3_Technical_Requirements.md (API Design section)
    """
    permission_classes = [IsAuthenticated]  # @requirement 7_Security_Requirements.md:Authentication
    
    # @api-requirement 2_Product_Requirements.md:Document_Management:Creation
    # @api-requirement 3_Technical_Requirements.md:API_Design:HTTP_Methods
    def post(self, request):
        """
        Create a new document
        
        URL: /api/v1/documents/
        Method: POST
        Auth: Required
        
        Request body follows schema in 3_Technical_Requirements.md:API_Design:Schemas:Document
        """
        serializer = DocumentCreateSerializer(data=request.data)
        
        # Validation as specified in requirements
        # @requirement 3_Technical_Requirements.md:API_Design:Validation
        if not serializer.is_valid():
            # Error format specified in requirements
            # @requirement 3_Technical_Requirements.md:API_Design:Error_Handling
            return Response(
                {
                    'status': 'error',
                    'code': 'validation_error',  # @requirement 3_Technical_Requirements.md:API_Design:Error_Codes
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process creation request
        # Implementation would go here...
        
        # Success response format from requirements
        # @requirement 3_Technical_Requirements.md:API_Design:Responses:Success
        return Response(
            {
                'status': 'success',
                'message': 'Document created successfully',
                'data': {
                    'id': 'generated-uuid-here',
                    'title': serializer.validated_data['title'],
                    'created_at': '2023-04-01T12:00:00Z'
                }
            },
            status=status.HTTP_201_CREATED
        )
    
    # @api-requirement 2_Product_Requirements.md:Document_Management:Retrieval
    # @api-requirement 3_Technical_Requirements.md:API_Design:HTTP_Methods
    def get(self, request, document_id=None):
        """
        Retrieve a document or list of documents
        
        URL: /api/v1/documents/ or /api/v1/documents/{id}/
        Method: GET
        Auth: Required
        
        Response follows schema in 3_Technical_Requirements.md:API_Design:Schemas:Document
        """
        # Implementation for specific document retrieval
        if document_id:
            # Check if document exists
            # @requirement 3_Technical_Requirements.md:API_Design:Error_Handling
            if False:  # This would check if document exists
                return Response(
                    {
                        'status': 'error',
                        'code': 'document_not_found',  # @requirement 3_Technical_Requirements.md:API_Design:Error_Codes
                        'message': 'Document not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Return document data
            # @requirement 3_Technical_Requirements.md:API_Design:Responses:Document
            return Response(
                {
                    'status': 'success',
                    'data': {
                        'id': document_id,
                        'title': 'Example Document',
                        'content': 'Document content here...',
                        'created_at': '2023-04-01T12:00:00Z',
                        'updated_at': '2023-04-01T13:30:00Z'
                    }
                },
                status=status.HTTP_200_OK
            )
        
        # Implementation for document list with pagination
        # @requirement 3_Technical_Requirements.md:API_Design:Pagination
        # @requirement 2_Product_Requirements.md:Document_Management:Listing
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 25))
        
        # Ensure limit doesn't exceed max defined in requirements
        # @requirement 3_Technical_Requirements.md:API_Design:Pagination:MaxLimit
        if limit > 100:
            limit = 100
        
        # Return paginated list
        # @requirement 3_Technical_Requirements.md:API_Design:Responses:List
        return Response(
            {
                'status': 'success',
                'data': [
                    {
                        'id': 'uuid-1',
                        'title': 'Example Document 1',
                        'created_at': '2023-04-01T12:00:00Z'
                    },
                    {
                        'id': 'uuid-2',
                        'title': 'Example Document 2',
                        'created_at': '2023-03-29T10:30:00Z'
                    }
                ],
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': 150,
                    'pages': 6
                }
            },
            status=status.HTTP_200_OK
        ) 