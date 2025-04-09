# Database Setup Guide

This guide documents the setup and configuration steps for the database system of the Productivity Software application.

## 1. Database Components

The Productivity Software application uses multiple database systems for different purposes:

- **PostgreSQL (v15.0+)**: Primary relational database for structured data
- **MongoDB (v7.0.0+)**: Document storage for flexible document content
- **Redis (v7.2.0+)**: Caching layer and session storage
- **Elasticsearch (v8.10.0+)**: Full-text search capabilities

## 2. Installation

### PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql@15

# Verify installation
psql --version
```

### MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community@7.0

# Verify installation
mongod --version
```

### Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS (using Homebrew)
brew install redis

# Verify installation
redis-server --version
```

### Elasticsearch

```bash
# Ubuntu/Debian
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt-get update
sudo apt-get install elasticsearch

# macOS (using Homebrew)
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# Verify installation
elasticsearch --version
```

## 3. Database Creation

### PostgreSQL

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE productivity_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE productivity_db TO postgres;
\q
```

### MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community@7.0  # macOS

# Connect to MongoDB
mongosh

# Create database
use productivity_documents
db.createCollection("documents")
exit
```

## 4. Django Configuration

The Django project is already configured to use these database systems. Key settings are:

### settings.py

```python
# PostgreSQL Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'productivity_db',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# MongoDB Configuration
DATABASES = {
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

## 5. Database Migrations

Run Django migrations to set up the PostgreSQL database schema:

```bash
# From the project root directory
python manage.py makemigrations
python manage.py migrate
```

## 6. Testing the Connections

### Test PostgreSQL Connection

```python
# In Django shell (python manage.py shell)
from django.db import connections
connections['default'].ensure_connection()
print("PostgreSQL connection successful!")
```

### Test MongoDB Connection

```python
# In Django shell (python manage.py shell)
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['productivity_documents']
print("MongoDB connection successful!")
```

### Test Redis Connection

```python
# In Django shell (python manage.py shell)
from django.core.cache import cache
cache.set('test_key', 'test_value', 10)
value = cache.get('test_key')
print(f"Redis connection successful! Retrieved: {value}")
```

### Test Elasticsearch Connection

```python
# In Django shell (python manage.py shell)
from elasticsearch_dsl.connections import connections
es = connections.get_connection()
print(f"Elasticsearch connection successful! Info: {es.info()}")
```

## 7. Data Backup and Recovery

### PostgreSQL Backup

```bash
# Create a backup
pg_dump -U postgres -d productivity_db > backup_postgres.sql

# Restore from backup
psql -U postgres -d productivity_db < backup_postgres.sql
```

### MongoDB Backup

```bash
# Create a backup
mongodump --db productivity_documents --out mongo_backup

# Restore from backup
mongorestore --db productivity_documents mongo_backup/productivity_documents
```

## 8. Common Issues and Troubleshooting

1. **PostgreSQL Connection Issues**
   - Ensure PostgreSQL service is running: `sudo systemctl status postgresql`
   - Check correct credentials are used in settings.py

2. **MongoDB Connection Issues**
   - Ensure MongoDB service is running: `sudo systemctl status mongod`
   - Verify MongoDB is listening on the correct port: `netstat -tuln | grep 27017`

3. **Redis Connection Issues**
   - Check Redis server status: `redis-cli ping` (should return PONG)
   - Ensure Redis is running: `sudo systemctl status redis`

4. **Elasticsearch Issues**
   - Verify Elasticsearch is running: `curl -X GET "localhost:9200/"`
   - Check logs for any startup errors: `/var/log/elasticsearch/elasticsearch.log` 