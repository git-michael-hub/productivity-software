/**
 * API URL construction test
 * Run with: npm test -- --testPathPattern=api-urls
 */
import { API_URL, AUTH_BASE_URL, REGISTER_URL } from '../../services/apiEndpoints';

describe('API URL Construction', () => {
  test('API_URL should be constructed correctly', () => {
    // Print to console for debugging
    console.log('API_URL:', API_URL);
    
    // API_URL should end with /api/
    expect(API_URL).toMatch(/\/api\/$/);
  });

  test('AUTH_BASE_URL should be constructed correctly', () => {
    // Print to console for debugging
    console.log('AUTH_BASE_URL:', AUTH_BASE_URL);
    
    // AUTH_BASE_URL should end with /api/auth/
    expect(AUTH_BASE_URL).toMatch(/\/api\/auth\/$/);
  });

  test('REGISTER_URL should be constructed correctly', () => {
    // Print to console for debugging
    console.log('REGISTER_URL:', REGISTER_URL);
    
    // REGISTER_URL should be something like /api/auth/register/
    expect(REGISTER_URL).toMatch(/\/api\/auth\/register\/$/);
  });

  // Debug URLs from context
  test('Debug URL construction with API_URL', () => {
    // Simulate API_URL with possible issues
    const API_URL_TEST = 'http://localhost:8000/api/';
    
    // Test different ways of constructing auth URL
    const authUrl1 = `${API_URL_TEST}auth/register/`;
    const authUrl2 = `${API_URL_TEST.replace(/\/$/, '')}/auth/register/`;
    
    console.log('API_URL_TEST:', API_URL_TEST);
    console.log('authUrl1:', authUrl1);
    console.log('authUrl2:', authUrl2);
    
    // This should match the URL pattern we want
    expect(authUrl1).toEqual('http://localhost:8000/api/auth/register/');
  });
}); 