from django.apps import AppConfig


class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'documents'
    verbose_name = 'Document Management'
    
    def ready(self):
        """Import signals when the app is ready."""
        import documents.signals 