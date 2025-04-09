import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthRedirect from '../AuthRedirect';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Mock the hooks
jest.mock('@/contexts/AuthContext');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('AuthRedirect Component', () => {
  const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter as any);
  });

  it('should not redirect when loading', () => {
    // Set up mocks
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
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
    mockedUsePathname.mockReturnValue('/auth/login');

    render(<AuthRedirect />);

    // Verify no redirect happens during loading
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should not redirect authenticated user on non-auth path', () => {
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
    mockedUsePathname.mockReturnValue('/dashboard');

    render(<AuthRedirect />);

    // Verify no redirect happens for authenticated user on dashboard
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should redirect authenticated user from login page to dashboard', () => {
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
    mockedUsePathname.mockReturnValue('/auth/login');

    render(<AuthRedirect />);

    // Verify redirect happens for authenticated user on login page
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect authenticated user from register page to dashboard', () => {
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
    mockedUsePathname.mockReturnValue('/auth/register');

    render(<AuthRedirect />);

    // Verify redirect happens for authenticated user on register page
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect authenticated user from forgot-password page to dashboard', () => {
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
    mockedUsePathname.mockReturnValue('/auth/forgot-password');

    render(<AuthRedirect />);

    // Verify redirect happens for authenticated user on forgot password page
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should not redirect unauthenticated user from login page', () => {
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
    mockedUsePathname.mockReturnValue('/auth/login');

    render(<AuthRedirect />);

    // Verify no redirect happens for unauthenticated user on login page
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
}); 