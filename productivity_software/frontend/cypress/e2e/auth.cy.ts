/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should register a new user successfully', () => {
    cy.visit('/auth/register');
    
    // Fill out registration form
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('SecurePass123!');
    cy.get('input[name="password_confirm"]').type('SecurePass123!');
    cy.get('input[name="first_name"]').type('Test');
    cy.get('input[name="last_name"]').type('User');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect to login
    cy.url().should('include', '/auth/login');
  });

  it('should login successfully', () => {
    cy.visit('/auth/login');
    
    // Fill out login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('SecurePass123!');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should show user menu
    cy.get('[data-testid="user-menu"]').should('exist');
  });

  it('should handle invalid login', () => {
    cy.visit('/auth/login');
    
    // Fill out login form with wrong password
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('WrongPassword123!');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('.alert-danger').should('be.visible');
    
    // Should stay on login page
    cy.url().should('include', '/auth/login');
  });

  it('should handle MFA verification', () => {
    cy.visit('/auth/login');
    
    // Login with MFA-enabled account
    cy.get('input[name="email"]').type('mfa@example.com');
    cy.get('input[name="password"]').type('SecurePass123!');
    cy.get('button[type="submit"]').click();
    
    // Should show MFA verification form
    cy.get('[data-testid="mfa-verification"]').should('be.visible');
    
    // Enter verification code
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should logout successfully', () => {
    // Login first
    cy.login('test@example.com', 'SecurePass123!');
    
    // Click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to home
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Should clear auth tokens
    cy.window().its('localStorage').invoke('getItem', 'auth_tokens').should('be.null');
  });

  it('should protect routes', () => {
    // Try to access protected route without auth
    cy.visit('/dashboard');
    
    // Should redirect to login
    cy.url().should('include', '/auth/login');
    
    // Should show message
    cy.get('.alert-warning').should('contain', 'Please login to continue');
  });
}); 