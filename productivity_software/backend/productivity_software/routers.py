"""
Database router for the Productivity Software project.
"""

class DatabaseRouter:
    """
    Router to direct document models to MongoDB and all others to PostgreSQL.
    
    This router ensures that:
    1. Document and DocumentVersion models use MongoDB
    2. All other models use PostgreSQL
    3. Relations are only allowed within the same database
    4. Migrations are directed to the appropriate database
    """
    
    def db_for_read(self, model, **hints):
        """
        Direct read operations to the appropriate database.
        """
        if model._meta.app_label == 'documents':
            if model.__name__ in ['Document', 'DocumentVersion']:
                return 'mongodb'
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Direct write operations to the appropriate database.
        """
        if model._meta.app_label == 'documents':
            if model.__name__ in ['Document', 'DocumentVersion']:
                return 'mongodb'
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations only between models in the same database.
        """
        # If both models are Document-related, allow relation
        if obj1._meta.app_label == 'documents' and obj2._meta.app_label == 'documents':
            doc_models = ['Document', 'DocumentVersion']
            if obj1.__class__.__name__ in doc_models and obj2.__class__.__name__ in doc_models:
                return True
            # If one is MongoDB model and other is not, disallow relation
            if (obj1.__class__.__name__ in doc_models) != (obj2.__class__.__name__ in doc_models):
                return False
            
        # Allow relation if both are in the default database
        if obj1._meta.app_label != 'documents' and obj2._meta.app_label != 'documents':
            return True
            
        # For general case, allow relation if both are in the same app
        return obj1._meta.app_label == obj2._meta.app_label
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Direct migrations to the appropriate database.
        """
        if app_label == 'documents':
            if model_name in ['document', 'documentversion']:
                return db == 'mongodb'
            return db == 'default'
        return db == 'default' 