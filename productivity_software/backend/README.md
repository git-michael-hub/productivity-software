# Productivity Software

A comprehensive productivity management application built with Django, PostgreSQL, and Redis.

## Features

- User authentication and authorization
- Organization management
- Task and project tracking
- Document management with version control

## Getting Started with Docker

This application is containerized using Docker, making it easy to set up and run in any environment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Development Environment

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd productivity_software
   ```

2. Create a `.env` file (you can copy from `.env.sample`):
   ```bash
   cp .env.sample .env
   ```

3. Start the development environment:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Web application: http://localhost:8000
   - Admin interface: http://localhost:8000/admin (username: admin, password: adminpassword)

## Testing Strategy

This project follows the Test Pyramid approach with three layers of testing:

1. **Unit Tests (70%)**: Test individual components and functions in isolation
2. **Integration Tests (20%)**: Test interactions between components
3. **End-to-End Tests (10%)**: Test complete user flows

### Running Tests

#### Basic Test Commands

```bash
# Run all tests (Docker environment)
docker-compose exec web pytest

# Run all tests (local environment)
python -m pytest

# Run specific test module
python -m pytest users/tests/test_models.py

# Run tests with verbose output
python -m pytest -v
```

#### Test Coverage

```bash
# Run tests with coverage report
python -m pytest --cov=. --cov-report=term-missing

# Generate HTML coverage report
python -m pytest --cov=. --cov-report=html
```

#### Running Tests by Type

```bash
# Run unit tests
python -m pytest tests/unit/

# Run integration tests
python -m pytest tests/integration/

# Run end-to-end tests
python -m pytest e2e_tests/
```

#### Test Documentation

Test files include traceability to requirements using the `@requirement` annotation that links each test to specific requirement documents.

### Production Deployment

1. Create a production environment file:
   ```bash
   cp .env.prod.example .env.prod
   # Edit .env.prod with your production settings
   ```

2. Generate SSL certificates:
   ```bash
   cd nginx/certs
   ./generate_self_signed_certs.sh
   # For production, replace with real certificates
   ```

3. Start the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. Access the application at your domain name.

## Docker Configuration Files

- `Dockerfile`: Development Docker configuration
- `Dockerfile.prod`: Production-optimized Docker configuration
- `docker-compose.yml`: Development environment services
- `docker-compose.prod.yml`: Production environment services
- `entrypoint.sh`: Development entrypoint script
- `entrypoint.prod.sh`: Production entrypoint script
- `nginx/conf/default.conf`: Nginx configuration for production

## Database Setup

The application is configured to use:
- PostgreSQL for relational data (users, organizations, permissions)
- Redis for caching and session management

The Docker Compose files set up these databases automatically.

## Scaling in Production

For production workloads, consider:
1. Using a managed database service
2. Setting up a load balancer
3. Implementing Redis cluster for large-scale deployments
4. Setting up proper monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a pull request

### Development Guidelines

- Follow the Test Pyramid strategy for all new features
- Write tests before implementation (TDD approach)
- Maintain minimum 80% code coverage for business logic
- Include proper requirements traceability in test docstrings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authentication & Authorization System

This system provides comprehensive user authentication and authorization functionality for the Productivity Software project, based on the project plan.

### Key Features

- **User Management**: Extended user model with profile information
- **Role-Based Access Control**: Fine-grained permission system with roles
- **JWT Authentication**: Secure token-based authentication
- **Multi-Factor Authentication**: Two-factor authentication support
- **OAuth Integration**: Social login with Google and Microsoft
- **Security Features**: Account lockout, password policies
- **Organizations/Multi-tenancy**: Support for organization-based user grouping

### APIs

Authentication endpoints available at `/api/auth/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register/` | POST | Register a new user |
| `/login/` | POST | Authenticate and get JWT tokens |
| `/logout/` | POST | Invalidate refresh token |
| `/token/refresh/` | POST | Get new access token using refresh token |
| `/token/verify/` | POST | Verify token validity |
| `/password/reset/` | POST | Request password reset email |
| `/password/reset/confirm/` | POST | Set new password with reset token |
| `/email/verify/<token>/` | GET | Verify email address |
| `/2fa/verify/` | POST | Verify two-factor authentication code |
| `/oauth/google/` | POST | Login with Google |
| `/oauth/microsoft/` | POST | Login with Microsoft |

### Installation & Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Apply migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

4. Run the development server:
   ```
   python manage.py runserver
   ```

### Requirements Traceability

This implementation aligns with the following requirements:
- `7_Security_Requirements.md:User_Authentication`
- `7_Security_Requirements.md:Authorization`
- `3_Technical_Requirements.md:Security & Authentication`
- `20_Multi_Tenancy_Requirements.md:Tenant_Structure` 