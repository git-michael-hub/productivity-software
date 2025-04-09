# Database Migration Guide

This guide outlines the process for migrating the Productivity Software application from SQLite to a multi-database setup with PostgreSQL, MongoDB, Redis, and Elasticsearch.

## 1. Preparation

Before starting the migration, ensure all databases are properly installed and configured as outlined in the [Database Setup Guide](database_setup.md).

### Backup Existing Data

```bash
# Create a backup of the SQLite database
cp productivity_software/db.sqlite3 productivity_software/db.sqlite3.bak

# Create a Django fixture backup of all data
python manage.py dumpdata --exclude contenttypes --exclude auth.Permission > data_backup.json
```

## 2. Update Django Settings

Update the `settings.py` file to configure the new database setup:

```python
# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'productivity_db',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'mongodb': {
        'ENGINE': 'djongo',
        'NAME': 'productivity_documents',
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
            'port': 27017,
        }
    }
}

# Redis Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Elasticsearch Configuration
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'localhost:9200'
    },
}
```

## 3. Database Router Setup

Create a database router to direct different models to the appropriate database:

```python
# Create a file: productivity_software/routers.py

class DatabaseRouter:
    """
    Router to direct document models to MongoDB and all others to PostgreSQL.
    """
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'documents':
            if model.__name__ in ['Document', 'DocumentVersion']:
                return 'mongodb'
        return 'default'
    
    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'documents':
            if model.__name__ in ['Document', 'DocumentVersion']:
                return 'mongodb'
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        # Allow relations between models in the same database
        if obj1._meta.app_label == obj2._meta.app_label:
            return True
        return False
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'documents':
            if model_name in ['document', 'documentversion']:
                return db == 'mongodb'
            return db == 'default'
        return db == 'default'
```

And add the router to settings.py:

```python
DATABASE_ROUTERS = ['productivity_software.routers.DatabaseRouter']
```

## 4. Migrating Data from SQLite to PostgreSQL

### Run Migrations on the New Database

```bash
# Create migrations for all apps
python manage.py makemigrations

# Apply migrations to PostgreSQL (default database)
python manage.py migrate --database=default

# Apply migrations to MongoDB 
python manage.py migrate --database=mongodb documents
```

### Load Data from Backup

```bash
# Load data from the backup fixture
python manage.py loaddata data_backup.json
```

## 5. Elasticsearch Index Setup

Create and populate the Elasticsearch indices:

```bash
# Create Elasticsearch indices
python manage.py search_index --create

# Populate Elasticsearch indices with existing data
python manage.py search_index --populate
```

## 6. Data Verification

Verify that all data has been properly migrated:

```bash
# Check PostgreSQL data
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.count()  # Should match count from SQLite

# Check MongoDB data
>>> from documents.models import Document
>>> Document.objects.count()  # If you had documents in SQLite
```

## 7. Redis Cache Warming

Populate the Redis cache with frequently accessed data:

```bash
# In Django shell
python manage.py shell
>>> from django.core.cache import cache
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> users = User.objects.all()
>>> for user in users:
...     cache.set(f"user_{user.id}", user, 3600)
```

## 8. Testing and Validation

Run tests to ensure the application works with the new database setup:

```bash
# Run tests
python manage.py test
```

Manually test key functionality to ensure data integrity and application performance.

## 9. Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check database exists
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='productivity_db';"
```

### MongoDB Connection Issues

```bash
# Check MongoDB service
sudo systemctl status mongod

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

### Redis Connection Issues

```bash
# Check Redis service
sudo systemctl status redis

# Test Redis connection
redis-cli ping  # Should return PONG
```

### Elasticsearch Connection Issues

```bash
# Check Elasticsearch service
sudo systemctl status elasticsearch

# Test Elasticsearch connection
curl -X GET "localhost:9200/"
```

## 10. Reverting to SQLite (If Needed)

If you need to revert to the SQLite database:

1. Update `settings.py` to use SQLite again
2. Restore the SQLite database file: `cp db.sqlite3.bak db.sqlite3`

## 11. Performance Monitoring

Monitor performance after migration:

```bash
# Install Django Debug Toolbar for development
pip install django-debug-toolbar

# Add appropriate monitoring tools for production
# Consider tools like New Relic, Datadog, or Django Silk
```

Add the following to settings.py:

```python
# Django Debug Toolbar (for development only)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
``` 