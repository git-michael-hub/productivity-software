import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { 
  LOGIN_URL, 
  REGISTER_URL, 
  LOGOUT_URL, 
  TOKEN_REFRESH_URL,
  VERIFY_EMAIL_URL,
  PASSWORD_RESET_URL,
  PASSWORD_RESET_CONFIRM_URL 
} from './apiEndpoints';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  organization_id?: string;
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

// Auth API functions
export const loginUser = async (credentials: LoginData) => {
  try {
    const response = await axios.post<AuthResponse>(LOGIN_URL, credentials);
    setTokens(response.data);
    
    // Store user info from token
    const userData = decodeToken(response.data.access);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
      id: userData.user_id,
      email: userData.email
    }));
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData: RegisterData) => {
  try {
    console.log('Registering user with data:', userData);
    const response = await axios.post(REGISTER_URL, userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const tokens = getTokens();
    if (tokens) {
      await axios.post(LOGOUT_URL, { refresh: tokens.refresh });
    }
    removeTokens();
  } catch (error) {
    // Even if the API call fails, remove tokens from client
    removeTokens();
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const tokens = getTokens();
    if (!tokens || !tokens.refresh) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post<{ access: string }>(
      TOKEN_REFRESH_URL, 
      { refresh: tokens.refresh }
    );
    
    // Update only the access token
    setTokens({ ...tokens, access: response.data.access });
    return response.data.access;
  } catch (error) {
    removeTokens();
    throw error;
  }
};

export const verifyEmail = async (key: string) => {
  try {
    const response = await axios.post(VERIFY_EMAIL_URL, { key });
    return response.data;
  } catch (error) {
    throw error;
  }
};
  
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axios.post(PASSWORD_RESET_URL, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmPasswordReset = async (
  uid: string, 
  token: string, 
  new_password: string
) => {
  try {
    const response = await axios.post(
      PASSWORD_RESET_CONFIRM_URL, 
      { uid, token, new_password }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  const tokens = getTokens();
  return tokens && tokens.access && !isTokenExpired(tokens.access);
};

// Set up axios interceptor for authentication
axios.interceptors.request.use(
  async (config) => {
    const tokens = getTokens();
    if (tokens) {
      // Check if token is expired and refresh if needed
      if (isTokenExpired(tokens.access)) {
        try {
          const newAccessToken = await refreshToken();
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } catch (error) {
          // If refresh fails, proceed without token
          console.error('Failed to refresh token', error);
        }
      } else {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  loginUser,
  registerUser,
  logoutUser,
  verifyEmail,
  requestPasswordReset,
  confirmPasswordReset,
  getCurrentUser,
  isAuthenticated,
  getTokens,
  refreshToken
};
