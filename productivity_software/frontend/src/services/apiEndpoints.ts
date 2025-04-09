// Get API base URL from environment or default to localhost
// For browser requests, always use localhost
export const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000');

// Helper function to join URL parts with proper slash handling
const joinURL = (...parts: string[]): string => {
  return parts
    .map(part => part.replace(/^\/+/, '').replace(/\/+$/, ''))
    .join('/')
    + '/';
};

// API endpoints with proper slash handling
export const API_URL = joinURL(API_BASE_URL, 'api');
export const AUTH_BASE_URL = joinURL(API_URL, 'auth');
export const REGISTER_URL = joinURL(AUTH_BASE_URL, 'register');
export const LOGIN_URL = joinURL(AUTH_BASE_URL, 'login');
export const LOGOUT_URL = joinURL(AUTH_BASE_URL, 'logout');
export const TOKEN_REFRESH_URL = joinURL(AUTH_BASE_URL, 'token/refresh');
export const TOKEN_VERIFY_URL = joinURL(AUTH_BASE_URL, 'token/verify');
export const PASSWORD_RESET_URL = joinURL(AUTH_BASE_URL, 'password/reset');
export const PASSWORD_RESET_CONFIRM_URL = joinURL(AUTH_BASE_URL, 'password/reset/confirm');
export const VERIFY_EMAIL_URL = joinURL(AUTH_BASE_URL, 'email/verify');
export const VERIFY_2FA_URL = joinURL(AUTH_BASE_URL, '2fa/verify');
export const OAUTH_GOOGLE_URL = joinURL(AUTH_BASE_URL, 'oauth/google');
export const OAUTH_MICROSOFT_URL = joinURL(AUTH_BASE_URL, 'oauth/microsoft');
export const USER_PROFILE_URL = joinURL(AUTH_BASE_URL, 'profile');

// API endpoints for authentication
export const API_ENDPOINTS = {
  REGISTER: REGISTER_URL,
  LOGIN: LOGIN_URL,
  LOGOUT: LOGOUT_URL,
  TOKEN_REFRESH: TOKEN_REFRESH_URL,
  VERIFY_TOKEN: TOKEN_VERIFY_URL,
  REQUEST_PASSWORD_RESET: PASSWORD_RESET_URL,
  CONFIRM_PASSWORD_RESET: PASSWORD_RESET_CONFIRM_URL,
  VERIFY_EMAIL: VERIFY_EMAIL_URL,
  VERIFY_2FA: VERIFY_2FA_URL,
  OAUTH_GOOGLE: OAUTH_GOOGLE_URL,
  OAUTH_MICROSOFT: OAUTH_MICROSOFT_URL,
  USER_PROFILE: USER_PROFILE_URL
};
