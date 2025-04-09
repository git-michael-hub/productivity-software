import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Mock the hooks
jest.mock('@/contexts/AuthContext');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('ProtectedRoute Component', () => {
  const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  
  const mockRouter = {
    replace: jest.fn(),
  };
  
  // Storage mock
  let mockStorage: { [key: string]: string } = {};
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter as any);
    mockedUsePathname.mockReturnValue('/dashboard');
    
    // Mock sessionStorage
    mockStorage = {};
    jest.spyOn(window.sessionStorage, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value.toString();
    });
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => {
      return mockStorage[key] || null;
    });
    jest.spyOn(window.sessionStorage, 'removeItem').mockImplementation((key) => {
      delete mockStorage[key];
    });
  });

  it('should show loading indicator when authentication is loading', () => {
    // Set up mocks
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
      verifyMFA: jest.fn(),
      clearError: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Verify loading indicator is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    // Set up mocks
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: '1', email: 'test@example.com' },
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
      verifyMFA: jest.fn(),
      clearError: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Verify protected content is shown
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // Loading spinner not shown
  });

  it('should redirect to login and save current path when user is not authenticated', () => {
    // Set up mocks
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
      verifyMFA: jest.fn(),
      clearError: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Verify redirect happens and path is saved
    expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login');
    expect(mockStorage['redirectAfterLogin']).toBe('/dashboard');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children when user is not authenticated', () => {
    // Set up mocks
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
      verifyMFA: jest.fn(),
      clearError: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Verify protected content is not shown
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
}); 