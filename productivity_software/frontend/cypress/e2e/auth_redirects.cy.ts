/// <reference types="cypress" />

// Test suite for authentication redirects
describe('Authentication Redirects', () => {
  beforeEach(() => {
    // Clear localStorage and cookies before each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should redirect unauthenticated user from dashboard to login', () => {
    // Try to visit dashboard without being logged in
    cy.visit('/dashboard');
    
    // Should be redirected to login
    cy.url().should('include', '/auth/login');
  });

  it('should allow unauthenticated user to access login page', () => {
    // Visit login page
    cy.visit('/auth/login');
    
    // Should stay on login page
    cy.url().should('include', '/auth/login');
    cy.contains('Log In').should('be.visible');
  });

  it('should allow unauthenticated user to access register page', () => {
    // Visit register page
    cy.visit('/auth/register');
    
    // Should stay on register page
    cy.url().should('include', '/auth/register');
    cy.contains('Create an account').should('be.visible');
  });

  it('should allow unauthenticated user to access forgot password page', () => {
    // Visit forgot password page
    cy.visit('/auth/forgot-password');
    
    // Should stay on forgot password page
    cy.url().should('include', '/auth/forgot-password');
    cy.contains('Forgot Password').should('be.visible');
  });

  it('should redirect authenticated user from login to dashboard', () => {
    // Set up a mock authenticated state
    const fakeTokens = {
      access: 'fake-access-token',
      refresh: 'fake-refresh-token'
    };
    const fakeUser = {
      id: '123',
      email: 'test@example.com'
    };

    // Store tokens and user data to simulate authenticated state
    cy.window().then(win => {
      win.localStorage.setItem('auth_tokens', JSON.stringify(fakeTokens));
      win.localStorage.setItem('user_data', JSON.stringify(fakeUser));
      
      // Mock the auth check endpoint
      cy.intercept('GET', '**/api/auth/check-auth/**', {
        statusCode: 200,
        body: {
          isAuthenticated: true,
          user: fakeUser
        }
      }).as('checkAuth');
    });
    
    // Visit login page
    cy.visit('/auth/login');
    
    // Wait for auth check to complete
    cy.wait('@checkAuth');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should redirect authenticated user from register to dashboard', () => {
    // Set up a mock authenticated state
    const fakeTokens = {
      access: 'fake-access-token',
      refresh: 'fake-refresh-token'
    };
    const fakeUser = {
      id: '123',
      email: 'test@example.com'
    };

    // Store tokens and user data to simulate authenticated state
    cy.window().then(win => {
      win.localStorage.setItem('auth_tokens', JSON.stringify(fakeTokens));
      win.localStorage.setItem('user_data', JSON.stringify(fakeUser));
      
      // Mock the auth check endpoint
      cy.intercept('GET', '**/api/auth/check-auth/**', {
        statusCode: 200,
        body: {
          isAuthenticated: true,
          user: fakeUser
        }
      }).as('checkAuth');
    });
    
    // Visit register page
    cy.visit('/auth/register');
    
    // Wait for auth check to complete
    cy.wait('@checkAuth');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should redirect authenticated user from forgot-password to dashboard', () => {
    // Set up a mock authenticated state
    const fakeTokens = {
      access: 'fake-access-token',
      refresh: 'fake-refresh-token'
    };
    const fakeUser = {
      id: '123',
      email: 'test@example.com'
    };

    // Store tokens and user data to simulate authenticated state
    cy.window().then(win => {
      win.localStorage.setItem('auth_tokens', JSON.stringify(fakeTokens));
      win.localStorage.setItem('user_data', JSON.stringify(fakeUser));
      
      // Mock the auth check endpoint
      cy.intercept('GET', '**/api/auth/check-auth/**', {
        statusCode: 200,
        body: {
          isAuthenticated: true,
          user: fakeUser
        }
      }).as('checkAuth');
    });
    
    // Visit forgot password page
    cy.visit('/auth/forgot-password');
    
    // Wait for auth check to complete
    cy.wait('@checkAuth');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should redirect to original url after login', () => {
    // Try to visit a protected page
    cy.visit('/dashboard/profile');
    
    // Should be redirected to login
    cy.url().should('include', '/auth/login');
    
    // Check that redirectAfterLogin is set in sessionStorage
    cy.window().then(win => {
      expect(win.sessionStorage.getItem('redirectAfterLogin')).to.equal('/dashboard/profile');
    });
    
    // Set up API mocks for login
    cy.intercept('POST', '**/api/auth/login/**', {
      statusCode: 200,
      body: {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token'
      }
    }).as('loginRequest');
    
    // Perform login
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    
    // Should be redirected to original url
    cy.url().should('include', '/dashboard/profile');
    
    // Check that redirectAfterLogin is removed from sessionStorage
    cy.window().then(win => {
      expect(win.sessionStorage.getItem('redirectAfterLogin')).to.be.null;
    });
  });
}); 