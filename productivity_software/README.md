# Productivity Software

A comprehensive productivity management application built with Django, PostgreSQL, Redis, and React with TypeScript.

## Directory Structure

- `/backend` - Django backend application
- `/frontend` - React TypeScript single-page application
- `.cursor` - Cursor IDE configuration and rules

## Features

- User Authentication & Authorization
- Task Management
- Document Storage & Sharing
- Team Collaboration
- Analytics & Reporting

## Technology Stack

### Backend
- Python 3.12 / Django 4.2
- PostgreSQL for relational data
- Redis for caching and messaging
- Django REST Framework for API
- Celery for background tasks

### Frontend
- React 18 with TypeScript
- Redux for state management
- Material UI components
- Styled Components for styling
- TypeScript for strict type checking

## Development with Docker

### Prerequisites

- Docker and Docker Compose installed on your system
- Git for version control

### Setup and Running (Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/productivity-software.git
   cd productivity-software
   ```

2. Start the development environment:
   ```bash
   docker-compose up
   ```

This will start the following services:
- PostgreSQL database on port 5432
- Redis on port 6379
- Django backend on port 8000
- React frontend on port 3000

3. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/

4. Default superuser credentials:
   - Username: admin
   - Password: adminpassword

### Running Tests

```bash
# Run backend tests
docker-compose exec backend python -m pytest

# Run frontend tests
docker-compose exec frontend npm test
```

## Production Deployment

For production environments, use the production configuration:

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Apply database migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser if needed
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --no-input
```

In production mode:
- The frontend is built as a static bundle and served by Nginx
- The backend runs with Gunicorn instead of Django's development server
- Nginx handles routing between frontend and backend
- HTTPS is configured (add your SSL certificates to the nginx/ssl directory)

## Development without Docker

### Backend Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Use the correct Node.js version (required: v16.x LTS/Gallium):
   ```bash
   # If you have nvm installed:
   nvm use lts/gallium  # or nvm use 16.20.2
   
   # Check that you're using the correct version
   node -v  # Should output v16.x.x
   ```

3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: The `--legacy-peer-deps` flag is required due to some dependency conflicts.

4. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

### Running Frontend in Development Mode

When running the frontend in development mode:

1. Make sure the backend server is running at http://localhost:8000 first.
2. The proxy is configured to forward API requests to the backend.
3. Any changes to frontend code will trigger automatic reloading.
4. TypeScript type checking and ESLint will run automatically.

### Troubleshooting Frontend Issues

- **Port conflict**: If port 3000 is already in use, React will prompt you to use another port. Type `Y` to accept.

- **Missing dependencies**: If you encounter module not found errors, try:
  ```bash
  npm install --legacy-peer-deps
  ```

- **Backend connection issues**: If you see proxy errors:
  - Ensure the backend server is running on port 8000
  - Check that the proxy setting in `package.json` is set to `"http://localhost:8000"`

- **TypeScript errors**: If you encounter TypeScript compiler errors:
  - These are often just warnings and the app will still run
  - Fix the errors by following the TypeScript requirements in `.cursor/rules/coding_standards.mdc`

- **Node version issues**: If you encounter incompatibility errors:
  - Switch to Node.js v16 (LTS/Gallium) which is required for this project
  - Using the wrong Node version may lead to unexpected errors

## Authentication and Authorization

The system uses JWT (JSON Web Tokens) for authentication:

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Token refresh is handled automatically by the frontend

User permissions are role-based:
- Admin: Full access to all features
- Manager: Can manage teams and assign tasks
- User: Basic access to personal tasks and documents

## Environment Variables

- Development environment variables are loaded from `.env` files
- Production environment variables should be set in your hosting environment or in `.env.prod` files

## Contributing

1. Create a feature branch from `develop`
2. Make your changes following the coding standards in `.cursor/rules`
3. Write tests for your changes
4. Submit a pull request

## TypeScript Requirements

All JavaScript code must adhere to TypeScript standards:
- All React components must use TypeScript (.tsx files)
- All utility functions must use TypeScript (.ts files)
- Strict type checking is enforced
- No use of "any" type except where absolutely necessary
- Proper interfaces for all data models and component props

See `.cursor/rules/coding_standards.mdc` for detailed TypeScript requirements.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 