#!/bin/sh

set -e

# Wait for the database to be ready
if [ "$DATABASE_ENGINE" = "django.db.backends.postgresql" ]; then
    echo "Waiting for PostgreSQL to become available..."
    
    RETRIES=10
    until PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
        echo "Waiting for PostgreSQL server, $((RETRIES)) remaining attempts..."
        RETRIES=$((RETRIES-1))
        sleep 5
    done
    
    if [ $RETRIES -eq 0 ]; then
        echo "ERROR: PostgreSQL not available, exiting!"
        exit 1
    fi
    
    echo "PostgreSQL is available"
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create cache tables if using database cache
if [ "$CACHE_BACKEND" = "django.core.cache.backends.db.DatabaseCache" ]; then
    echo "Creating cache tables..."
    python manage.py createcachetable
fi

# Create or update superuser if environment variables are set
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "Creating/updating superuser..."
    python manage.py createsuperuser --noinput || true
fi

# Start Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn productivity_software.wsgi:application -c gunicorn.conf.py 