/**
 * URL Debug Script
 * 
 * Run this script to check URL construction before sending requests.
 * Run with: node -r dotenv/config src/scripts/debug-urls.js
 */

// Test different URL construction methods
const API_BASE_URL = 'http://localhost:8000';

// Method 1: Using join with slashes
const API_URL_1 = `${API_BASE_URL}/api/`;
const API_URL_2 = `${API_BASE_URL}/api`;
const API_URL_3 = API_BASE_URL + '/api/';
const API_URL_4 = API_BASE_URL + '/api';

console.log('Base URL:', API_BASE_URL);
console.log('------------------------------------');
console.log('API_URL_1 (template with trailing slash):', API_URL_1);
console.log('API_URL_2 (template without trailing slash):', API_URL_2);
console.log('API_URL_3 (concatenation with trailing slash):', API_URL_3);
console.log('API_URL_4 (concatenation without trailing slash):', API_URL_4);

console.log('\nAuth URL Constructions:');
console.log('------------------------------------');
console.log('1a. Template with both slashes:', `${API_URL_1}auth/`);
console.log('1b. Template without trailing slash:', `${API_URL_1}auth`);
console.log('2a. Template with both slashes:', `${API_URL_2}/auth/`);
console.log('2b. Template without trailing slash:', `${API_URL_2}/auth`);
console.log('3a. Concat with both slashes:', API_URL_3 + 'auth/');
console.log('3b. Concat without trailing slash:', API_URL_3 + 'auth');
console.log('4a. Concat with both slashes:', API_URL_4 + '/auth/');
console.log('4b. Concat without trailing slash:', API_URL_4 + '/auth');

// Normalized construction with safe slash handling
function joinURLs(...parts) {
  return parts
    .map(part => part.replace(/^\/+/, '').replace(/\/+$/, ''))
    .join('/')
    + '/';
}

console.log('\nNormalized URL Construction:');
console.log('------------------------------------');
console.log('Normalized URL:', joinURLs(API_BASE_URL, 'api', 'auth', 'register'));

// Test environment construction
const ENV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
console.log('\nEnvironment URL Construction:');
console.log('------------------------------------');
console.log('ENV_API_URL:', ENV_API_URL);
console.log('Register URL from ENV:', `${ENV_API_URL}auth/register/`);

/**
 * Key findings and recommendations:
 * 
 * 1. Ensure consistent slash usage between parts
 * 2. Use a URL joining function to prevent duplicate slashes
 * 3. For Next.js environment variables, verify they are correctly formatted
 */ 