"""
Models for the documents app.
@requirement 2_Product_Requirements.md:Feature_List:DocumentManagement
"""
from django.db import models
from djongo.models import ObjectIdField, DjongoManager
from django.conf import settings
from django_elasticsearch_dsl import Document as ESDocument, fields
from django_elasticsearch_dsl.registries import registry

class Document(models.Model):
    """
    Document model using MongoDB for storage.
    @requirement 2_Product_Requirements.md:Feature_List:DocumentManagement
    @requirement 23_Vendor_Integration_Requirements.md:Storage_Services
    """
    _id = ObjectIdField()
    title = models.CharField(max_length=255)
    content = models.TextField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    version = models.IntegerField(default=1)
    tags = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=(
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ), default='draft')
    
    # Use DjongoManager to work with MongoDB
    objects = DjongoManager()
    
    class Meta:
        db_table = 'documents'
        app_label = 'documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        
    def __str__(self):
        return self.title
    
    def create_version(self):
        """Create a new version of this document."""
        previous_versions = DocumentVersion.objects.filter(document_id=self._id)
        version_num = previous_versions.count() + 1
        
        # Create a new version record
        DocumentVersion.objects.create(
            document_id=self._id,
            title=self.title,
            content=self.content,
            version=version_num,
            created_by=self.owner
        )
        
        # Update document version
        self.version = version_num
        self.save()
        
        return version_num

class DocumentVersion(models.Model):
    """
    Store document versions in MongoDB.
    @requirement 2_Product_Requirements.md:Feature_List:DocumentVersioning
    """
    _id = ObjectIdField()
    document_id = models.CharField(max_length=50)  # Reference to Document _id
    title = models.CharField(max_length=255)
    content = models.TextField()
    version = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Use DjongoManager to work with MongoDB
    objects = DjongoManager()
    
    class Meta:
        db_table = 'document_versions'
        app_label = 'documents'
        verbose_name = 'Document Version'
        verbose_name_plural = 'Document Versions'
        
    def __str__(self):
        return f"{self.title} (v{self.version})"

class DocumentPermission(models.Model):
    """
    Store document permissions in PostgreSQL.
    @requirement 7_Security_Requirements.md:Document_Permissions
    """
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    permission_type = models.CharField(max_length=20, choices=(
        ('read', 'Read'),
        ('edit', 'Edit'),
        ('admin', 'Admin'),
    ))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'document_permissions'
        app_label = 'documents'
        unique_together = ('document', 'user')
        
    def __str__(self):
        return f"{self.user.username} - {self.permission_type} - {self.document.title}"

# Elasticsearch integration
@registry.register_document
class DocumentIndex(ESDocument):
    """
    Elasticsearch document index for full-text search.
    @requirement 18_Advanced_Technology_Requirements.md:AI_Machine_Learning:Search
    @requirement 8_Performance_Requirements.md:Search_Optimization
    """
    id = fields.KeywordField()
    title = fields.TextField(
        fields={'raw': fields.KeywordField()}
    )
    content = fields.TextField()
    owner = fields.ObjectField(properties={
        'id': fields.KeywordField(),
        'username': fields.KeywordField(),
    })
    created_at = fields.DateField()
    updated_at = fields.DateField()
    tags = fields.ListField(fields.KeywordField())
    status = fields.KeywordField()
    
    class Index:
        name = 'documents'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }
        
    class Django:
        model = Document
        fields = [
            'version',
        ]
        
        # Auto populate the Elasticsearch index
        # when a document is created or updated
        auto_refresh = True
        
        # Define related_models if needed for relationships
        related_models = []
        
    def prepare_owner(self, instance):
        return {
            'id': instance.owner.id,
            'username': instance.owner.username
        } 