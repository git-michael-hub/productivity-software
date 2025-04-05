# Rules

## Code Organization & Structure

1. **Project Structure**
   - Follow the Django project structure for backend code
   - Organize frontend Next.js code using the App Router structure
   - Keep shared utilities in dedicated folders by functionality
   - Maintain consistent naming conventions across the codebase

2. **File Naming**
   - Use snake_case for Python files
   - Use PascalCase for React components
   - Use camelCase for JavaScript/TypeScript utility files
   - Include type information in TypeScript filenames where appropriate (e.g., `UserTypes.ts`)

3. **Import Order**
   - Standard library imports first
   - Third-party library imports second
   - Local application imports third
   - Separate import groups with a blank line
   - Sort imports alphabetically within each group

4. **Component Organization**
   - Organize React components using atomic design principles
   - Keep component files under 300 lines of code
   - Extract complex logic into custom hooks
   - Co-locate component tests with component files

## Development Workflow

1. **Git Workflow**
   - Use feature branches for all new development
   - Name branches using the pattern: `feature/`, `bugfix/`, `hotfix/`, `release/`
   - Require pull request reviews before merging
   - Squash commits when merging to main branch
   - Write descriptive commit messages with issue references

2. **Code Reviews**
   - All code must be reviewed by at least one other developer
   - Reviewers should check for adherence to standards and best practices
   - Address all review comments before merging
   - Use Cursor's collaborative features for real-time code reviews

3. **Environment Management**
   - Use .env files for environment-specific configuration
   - Never commit sensitive information to version control
   - Document all environment variables in a template file
   - Use different environment configurations for development, testing, and production

## Coding Standards

1. **Python Standards**
   - Follow PEP 8 style guidelines
   - Use Type hints for all function parameters and return values
   - Document all functions with docstrings
   - Use Django's Class-Based Views for all view implementations
   - Implement custom mixins for reusable functionality

2. **JavaScript/TypeScript Standards**
   - Use TypeScript for all new frontend code
   - Follow Airbnb JavaScript Style Guide
   - Use ESLint with recommended settings
   - Prefer functional components with hooks over class components
   - Use TypeScript interfaces for prop types and data models

3. **Code Quality**
   - Maintain maximum cyclomatic complexity of 15 per function
   - Keep functions under 50 lines of code
   - Use meaningful variable and function names
   - Include comments for complex logic
   - Remove unused code instead of commenting it out

## Testing Standards

1. **Test Coverage**
   - Minimum 80% code coverage for business logic
   - 100% coverage for critical components
   - Write tests for all edge cases
   - Tests must pass before merging code

2. **Test Organization**
   - Use the Arrange-Act-Assert pattern for unit tests
   - Group related tests using describe blocks
   - Use descriptive test names that explain the expected behavior
   - Mock external dependencies in unit tests

3. **Testing Workflow**
   - Run tests locally before pushing code
   - Integrate tests into CI/CD pipeline
   - Fix failing tests immediately
   - Use Cursor's testing tools to run and debug tests

## Documentation Standards

1. **Code Documentation**
   - Document all public functions and classes
   - Use JSDoc for JavaScript/TypeScript
   - Use docstrings for Python
   - Update documentation when changing code

2. **Project Documentation**
   - Maintain up-to-date README files for all major components
   - Document architectural decisions in ADRs
   - Keep API documentation synchronized with implementation
   - Use diagrams for visualizing complex systems

3. **Comment Quality**
   - Focus comments on why, not what
   - Update comments when changing the related code
   - Remove redundant comments
   - Use TODO comments with issue references for future work

## Performance Optimization

1. **Query Optimization**
   - Use the Django Debug Toolbar to identify slow queries
   - Add appropriate indexes for frequently queried fields
   - Use select_related and prefetch_related to reduce query count
   - Implement query result caching for repetitive requests

2. **Frontend Performance**
   - Implement code splitting for large applications
   - Use lazy loading for images and non-critical components
   - Optimize bundle size using webpack bundle analyzer
   - Follow Next.js performance best practices

3. **Resource Management**
   - Close database connections and file handles properly
   - Implement connection pooling for database access
   - Use streaming responses for large data transfers
   - Monitor memory usage during development

## Accessibility Standards

1. **WCAG Compliance**
   - Ensure all features meet WCAG 2.1 AA standards
   - Use semantic HTML elements
   - Provide alternative text for images
   - Ensure keyboard navigation for all interactive elements

2. **Testing Accessibility**
   - Use automated tools like axe-core for initial checks
   - Perform manual testing with screen readers
   - Test keyboard navigation for all features
   - Verify sufficient color contrast ratios

## Security Practices

1. **Authentication & Authorization**
   - Use Django's authentication system and permission classes
   - Implement proper input validation for all user inputs
   - Protect against common vulnerabilities (XSS, CSRF, SQL injection)
   - Follow the principle of least privilege for access control

2. **Data Protection**
   - Encrypt sensitive data at rest and in transit
   - Implement proper error handling without exposing sensitive information
   - Follow data minimization principles
   - Comply with relevant regulations (GDPR, CCPA, etc.)

## Cursor-Specific Keyboard Shortcuts

1. **Essential Shortcuts**
   - `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux): Command palette
   - `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux): Quick file navigation
   - `Cmd+P` (Mac) / `Ctrl+P` (Windows/Linux): Open file
   - `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows/Linux): Global search
   - `F1`: Show AI chat panel

2. **Code Navigation**
   - `Cmd+Click` (Mac) / `Ctrl+Click` (Windows/Linux): Go to definition
   - `Cmd+Shift+O` (Mac) / `Ctrl+Shift+O` (Windows/Linux): Navigate to symbol
   - `Cmd+G` (Mac) / `Ctrl+G` (Windows/Linux): Go to line
   - `Alt+Left/Right`: Navigate back/forward

3. **AI-Assisted Shortcuts**
   - `Cmd+L` (Mac) / `Ctrl+L` (Windows/Linux): Select current line for AI
   - `Cmd+I` (Mac) / `Ctrl+I` (Windows/Linux): Inline AI completion
   - `Cmd+K Cmd+E` (Mac) / `Ctrl+K Ctrl+E` (Windows/Linux): Explain selected code
   - `Cmd+K Cmd+G` (Mac) / `Ctrl+K Ctrl+G` (Windows/Linux): Generate code from comment

4. **Team-Specific Shortcuts**
   - Document custom shortcuts in project README
   - Standardize shortcut usage across the team
   - Create project-specific keybindings for common actions
   - Provide cheat sheets for new team members

## AI-Assisted Development Practices

1. **Code Generation**
   - Use AI for generating boilerplate code
   - Verify and validate all AI-generated code
   - Follow consistent prompt patterns for better results
   - Use comments to guide AI code generation

2. **Code Understanding**
   - Use AI to explain complex code sections
   - Generate documentation with AI assistance
   - Request code reviews and improvement suggestions
   - Use AI to analyze performance bottlenecks

3. **Learning & Onboarding**
   - Leverage AI for learning new technologies
   - Generate example code for unfamiliar patterns
   - Create documentation with AI assistance
   - Use AI to understand legacy code

4. **Best Practices**
   - Always review AI-generated code for correctness
   - Provide clear, specific prompts for better results
   - Use AI suggestions as a starting point, not final code
   - Share effective prompts with team members

## Collaborative Coding Features

1. **Shared Editing**
   - Use Cursor's collaborative editing for pair programming
   - Set clear goals for collaborative sessions
   - Designate a session leader for direction
   - Document decisions made during collaborative sessions

2. **Code Reviews**
   - Use Cursor's collaborative features for real-time code reviews
   - Share AI insights during review sessions
   - Document review comments and resolutions
   - Follow up on implementation of review feedback

3. **Knowledge Sharing**
   - Share AI prompts and responses for complex problems
   - Document solutions to recurring challenges
   - Create team libraries of effective prompts
   - Use collaborative sessions for mentoring

4. **Team Conventions**
   - Establish conventions for collaborative sessions
   - Schedule regular pair programming sessions
   - Set guidelines for when to use collaborative features
   - Track effectiveness of collaborative coding practices

## IDE-Specific Settings

1. **Cursor Configuration**
   - Use consistent formatting settings across the team
   - Configure linters and formatters to run on save
   - Set up project-specific snippets for common patterns
   - Share useful keyboard shortcuts with the team

2. **Extensions**
   - Required extensions: ESLint, Prettier, Python, Django
   - Recommended extensions: GitLens, Docker, REST Client
   - Configure extension settings for consistency
   - Document extension configuration in project README 