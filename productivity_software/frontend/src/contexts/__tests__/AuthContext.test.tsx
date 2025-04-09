import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('axios');
jest.mock('js-cookie');
jest.mock('jwt-decode');

// Create a test component to access the AuthContext
const TestComponent = ({ onRender }: { onRender: (authContext: ReturnType<typeof useAuth>) => void }) => {
  const auth = useAuth();
  onRender(auth);
  return null;
};

describe('AuthContext', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedJsCookie = Cookies as jest.Mocked<typeof Cookies>;
  const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;
  const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  
  const mockRouter = { push: jest.fn(), replace: jest.fn() };
  let auth: ReturnType<typeof useAuth>;
  const renderCallback = (authContext: ReturnType<typeof useAuth>) => {
    auth = authContext;
  };
  
  // Storage mocks
  let mockLocalStorage: { [key: string]: string } = {};
  let mockSessionStorage: { [key: string]: string } = {};
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter as any);
    
    // Mock LocalStorage
    mockLocalStorage = {};
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => 
      mockLocalStorage[key] || null
    );
    jest.spyOn(window.localStorage, 'setItem').mockImplementation((key, value) => {
      mockLocalStorage[key] = value.toString();
    });
    jest.spyOn(window.localStorage, 'removeItem').mockImplementation((key) => {
      delete mockLocalStorage[key];
    });
    
    // Mock SessionStorage
    mockSessionStorage = {};
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => 
      mockSessionStorage[key] || null
    );
    jest.spyOn(window.sessionStorage, 'setItem').mockImplementation((key, value) => {
      mockSessionStorage[key] = value.toString();
    });
    jest.spyOn(window.sessionStorage, 'removeItem').mockImplementation((key) => {
      delete mockSessionStorage[key];
    });
    
    // Set default mock returns
    mockedJwtDecode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
      user_id: '123',
      email: 'test@example.com'
    });
    
    mockedAxios.interceptors = {
      request: {
        use: jest.fn().mockReturnValue(1),
        eject: jest.fn()
      } as any
    };
  });

  it('should initialize as unauthenticated with no tokens', async () => {
    // Simulate no stored tokens
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={renderCallback} />
        </AuthProvider>
      );
    });
    
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(auth.loading).toBe(false);
  });

  it('should initialize as authenticated with valid stored tokens', async () => {
    // Mock valid token
    const mockTokens = {
      access: 'valid-access-token',
      refresh: 'valid-refresh-token'
    };
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };
    
    // Simulate stored tokens
    mockLocalStorage['auth_tokens'] = JSON.stringify(mockTokens);
    mockLocalStorage['user_data'] = JSON.stringify(mockUser);
    
    // Mock check-auth endpoint
    mockedAxios.get.mockResolvedValueOnce({ 
      data: { 
        isAuthenticated: true,
        user: mockUser 
      } 
    });
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={renderCallback} />
        </AuthProvider>
      );
    });
    
    // Wait for auth check to complete
    await waitFor(() => expect(auth.loading).toBe(false));
    
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user).toEqual(mockUser);
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  it('should handle server reporting user as not authenticated', async () => {
    // Mock valid token but server says not authenticated
    const mockTokens = {
      access: 'valid-access-token',
      refresh: 'valid-refresh-token'
    };
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };
    
    // Simulate stored tokens
    mockLocalStorage['auth_tokens'] = JSON.stringify(mockTokens);
    mockLocalStorage['user_data'] = JSON.stringify(mockUser);
    
    // Mock check-auth endpoint reporting not authenticated
    mockedAxios.get.mockResolvedValueOnce({ 
      data: { 
        isAuthenticated: false
      } 
    });
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={renderCallback} />
        </AuthProvider>
      );
    });
    
    // Wait for auth check to complete
    await waitFor(() => expect(auth.loading).toBe(false));
    
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(mockLocalStorage['auth_tokens']).toBeUndefined();
    expect(mockLocalStorage['user_data']).toBeUndefined();
  });

  it('should redirect to saved path after login', async () => {
    // Set up mock redirect path
    mockSessionStorage['redirectAfterLogin'] = '/dashboard/profile';
    
    // Mock successful login response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      }
    });
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={renderCallback} />
        </AuthProvider>
      );
    });
    
    // Perform login
    await act(async () => {
      await auth.login('test@example.com', 'password');
    });
    
    // Check redirection to saved path
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard/profile');
    expect(mockSessionStorage['redirectAfterLogin']).toBeUndefined();
  });

  it('should redirect to dashboard if no saved path after login', async () => {
    // Ensure no redirect path is set
    delete mockSessionStorage['redirectAfterLogin'];
    
    // Mock successful login response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      }
    });
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={renderCallback} />
        </AuthProvider>
      );
    });
    
    // Perform login
    await act(async () => {
      await auth.login('test@example.com', 'password');
    });
    
    // Check redirection to dashboard
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should refresh token when access token is expired', async () => {
    // Mock expired token
    const mockTokens = {
      access: 'expired-access-token',
      refresh: 'valid-refresh-token'
    };
    
    // Simulate stored tokens
    mockLocalStorage['auth_tokens'] = JSON.stringify(mockTokens);
    
    // Mock token as expired
    mockedJwtDecode.mockReturnValueOnce({
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
      user_id: '123',
      email: 'test@example.com'
    });
    
    // Mock successful token refresh
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access: 'new-access-token'
      }
    });
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={renderCallback} />
        </AuthProvider>
      );
    });
    
    // Wait for refresh to complete
    await waitFor(() => expect(auth.loading).toBe(false));
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/token/refresh/'), 
      { refresh: 'valid-refresh-token' }
    );
    expect(auth.isAuthenticated).toBe(true);
  });
}); 