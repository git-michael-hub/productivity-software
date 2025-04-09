'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

// API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';

// Helper function to join URL parts with proper slash handling
const joinURL = (...parts: string[]): string => {
  return parts
    .map(part => part.replace(/^\/+/, '').replace(/\/+$/, ''))
    .join('/')
    + '/';
};

// Generate URLs with proper slash handling
const API_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
const AUTH_URL = joinURL(API_URL, 'auth');
const LOGIN_URL = joinURL(AUTH_URL, 'login');
const REGISTER_URL = joinURL(AUTH_URL, 'register');
const LOGOUT_URL = joinURL(AUTH_URL, 'logout');
const TOKEN_REFRESH_URL = joinURL(AUTH_URL, 'token/refresh');
const VERIFY_EMAIL_URL = joinURL(AUTH_URL, 'email/verify');
const CHECK_AUTH_URL = joinURL(AUTH_URL, 'check-auth');

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (key: string) => Promise<any>;
  verifyMFA: (code: string) => Promise<void>;
  clearError: () => void;
}

// This interface must match the fields expected by the backend RegistrationSerializer
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  organization_id?: string | null;
}

interface TokenData {
  exp: number;
  user_id: string;
  email: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
}

const TOKEN_STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'user_data';

// Helper functions for token management
const setTokens = (tokens: AuthResponse) => {
  Cookies.set('access_token', tokens.access, { secure: true, sameSite: 'strict' });
  Cookies.set('refresh_token', tokens.refresh, { secure: true, sameSite: 'strict' });
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
};

const getTokens = (): AuthResponse | null => {
  const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
  return tokensStr ? JSON.parse(tokensStr) : null;
};

const removeTokens = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

const decodeToken = (token: string): TokenData => {
  return jwtDecode<TokenData>(token);
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // First, check local tokens
        const tokens = getTokens();
        if (tokens && !isTokenExpired(tokens.access)) {
          const userData = decodeToken(tokens.access);
          const userStr = localStorage.getItem(USER_STORAGE_KEY);
          
          if (userStr) {
            // Set initial state based on local storage
            setUser(JSON.parse(userStr));
            setIsAuthenticated(true);
            
            // Then verify with the server
            try {
              // Set up headers with the access token
              const headers = {
                'Authorization': `Bearer ${tokens.access}`
              };
              
              // Check with the server if our token is still valid
              const response = await axios.get(CHECK_AUTH_URL, { headers });
              
              // If we get a successful response, the token is valid
              if (response.data.isAuthenticated) {
                // Update user data if needed
                setUser(response.data.user);
              }
            } catch (serverErr) {
              console.error('Error verifying auth with server', serverErr);
              // If there's a 401 Unauthorized error, clear local state
              if (axios.isAxiosError(serverErr) && (
                  serverErr.response?.status === 401 || 
                  serverErr.response?.status === 403
              )) {
                removeTokens();
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          }
        } else if (tokens) {
          // Tokens exist but access token is expired, try to refresh
          try {
            const response = await axios.post<{ access: string }>(
              TOKEN_REFRESH_URL, 
              { refresh: tokens.refresh }
            );
            
            // Update only the access token
            setTokens({ ...tokens, access: response.data.access });
            
            // Get user data from the new token
            const userData = decodeToken(response.data.access);
            const user = {
              id: userData.user_id,
              email: userData.email
            };
            
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
          } catch (refreshErr) {
            console.error('Failed to refresh token', refreshErr);
            removeTokens();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Error initializing auth', err);
        removeTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Setup axios interceptor for authentication
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const tokens = getTokens();
        if (tokens) {
          // Check if token is expired and refresh if needed
          if (isTokenExpired(tokens.access)) {
            try {
              const response = await axios.post<{ access: string }>(
                TOKEN_REFRESH_URL, 
                { refresh: tokens.refresh }
              );
              
              // Update only the access token
              setTokens({ ...tokens, access: response.data.access });
              config.headers.Authorization = `Bearer ${response.data.access}`;
            } catch (error) {
              // If refresh fails, logout
              removeTokens();
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            config.headers.Authorization = `Bearer ${tokens.access}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>(LOGIN_URL, { email, password });
      setTokens(response.data);
      
      // Store user info from token
      const userData = decodeToken(response.data.access);
      const user = {
        id: userData.user_id,
        email: userData.email
      };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      
      // Check if there's a saved redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.replace(redirectPath);
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      // Handle different error formats from the API
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login');
      }
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post(REGISTER_URL, userData);
      setError(null);
      // Don't auto-login after registration as email verification may be required
    } catch (err: any) {
      // Enhanced error logging
      console.error('Registration error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        url: REGISTER_URL,
        requestData: userData
      });

      // Handle API validation errors
      if (err.response?.data) {
        const errorData = err.response.data;
        const errorMessage = Object.keys(errorData)
          .map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`)
          .join('; ');
        setError(errorMessage);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during registration');
      }
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const tokens = getTokens();
      if (tokens) {
        await axios.post(LOGOUT_URL, { refresh: tokens.refresh });
      }
      removeTokens();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Logout error', err);
      // Even if the API logout fails, clear local state
      removeTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(VERIFY_EMAIL_URL, { key });
      return response.data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Email verification failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/`);
      setUser(response.data);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const verifyMFA = async (code: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-mfa/`, {
        code
      });
      
      if (response.data.access) {
        setTokens(response.data.access);
        await fetchUser();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Failed to verify MFA code');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    verifyMFA,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 