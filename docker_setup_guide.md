# Docker Configuration

This guide explains how to use Docker to run both the backend and frontend of the Productivity Software project.


## Docker Setup

The project has been configured with Docker Compose to make development and deployment easy. The Docker setup includes:

- PostgreSQL database container
- Redis cache container
- Django backend container
- React TypeScript frontend container
- Nginx container (for production)

## Development Environment

Start the development environment with:

```bash
docker-compose up
```

This will start all services in development mode with hot-reloading enabled for both frontend and backend.

## Production Environment

For production deployment, use:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

The production setup includes:

- Optimized TypeScript builds for the frontend
- Nginx serving static files
- Gunicorn for the Django application
- Proper SSL configuration

## TypeScript Configuration

The frontend Docker configuration has been optimized for TypeScript development:

- TypeScript type checking during build
- ESLint with TypeScript-specific rules
- Type-safe development environment
- Automatic hot reloading of TypeScript changes
