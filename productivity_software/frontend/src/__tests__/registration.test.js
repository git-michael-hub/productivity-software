/**
 * Registration Form Validation Tests
 */
import * as Yup from 'yup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock the API using axios-mock-adapter
const mock = new MockAdapter(axios);

// Validation schema for registration form
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and special character'
    )
    .required('Password is required'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  first_name: Yup.string()
    .required('First name is required'),
  last_name: Yup.string()
    .required('Last name is required'),
  phone_number: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number must be valid (E.164 format)'),
  organization_id: Yup.string()
    .nullable()
    .test('is-uuid-or-empty', 'Must be a valid UUID', value => {
      if (!value || value === '') return true;
      // UUID regex pattern
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidPattern.test(value);
    })
});

describe('Registration Form Validation Tests', () => {
  // Test organization_id validation
  describe('organization_id field validation', () => {
    test('Empty organization_id should be valid', async () => {
      const testData = { organization_id: '' };
      await expect(validationSchema.validateAt('organization_id', testData)).resolves.toBe('');
    });
    
    test('Valid UUID organization_id should be valid', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const testData = { organization_id: validUUID };
      await expect(validationSchema.validateAt('organization_id', testData)).resolves.toBe(validUUID);
    });
    
    test('Invalid UUID organization_id should be invalid', async () => {
      const invalidUUID = 'not-a-uuid';
      const testData = { organization_id: invalidUUID };
      await expect(validationSchema.validateAt('organization_id', testData)).rejects.toThrow();
    });

    test('null organization_id should be valid', async () => {
      const testData = { organization_id: null };
      await expect(validationSchema.validateAt('organization_id', testData)).resolves.toBe(null);
    });
    
    test('undefined organization_id should be valid', async () => {
      const testData = { organization_id: undefined };
      await expect(validationSchema.validateAt('organization_id', testData)).resolves.toBe(undefined);
    });
  });

  // Test API integration (mock)
  describe('Registration API Integration', () => {
    // Setup API mocks
    beforeEach(() => {
      // Success response for valid data with empty organization_id
      mock.onPost('http://localhost:8000/api/auth/register/').reply(config => {
        const data = JSON.parse(config.data);
        
        // Check if organization_id is empty or valid UUID
        if (data.organization_id && data.organization_id !== '') {
          // Test UUID format
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidPattern.test(data.organization_id)) {
            return [400, { organization_id: ["Must be a valid UUID."] }];
          }
        }
        
        // All valid
        return [201, { success: true }];
      });
    });
    
    // Cleanup after tests
    afterEach(() => {
      mock.reset();
    });
    
    test('Should successfully register with empty organization_id', async () => {
      const testData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
        organization_id: ''
      };
      
      const response = await axios.post('http://localhost:8000/api/auth/register/', testData);
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
    });
    
    test('Should successfully register with valid UUID organization_id', async () => {
      const testData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
        organization_id: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const response = await axios.post('http://localhost:8000/api/auth/register/', testData);
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
    });
    
    test('Should fail register with invalid UUID organization_id', async () => {
      const testData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
        organization_id: 'invalid-uuid'
      };
      
      try {
        await axios.post('http://localhost:8000/api/auth/register/', testData);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.organization_id).toContain('Must be a valid UUID.');
      }
    });
  });
}); 