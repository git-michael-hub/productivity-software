/**
 * Registration Form Component Test
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AuthProvider } from '../../contexts/AuthContext';
import Register from '../../app/auth/register/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock API calls
const mockApi = new MockAdapter(axios);

describe('Register Form Component', () => {
  beforeEach(() => {
    // Mock successful registration
    mockApi.onPost('http://localhost:8000/api/auth/register/').reply(201, { 
      detail: 'Registration successful. Please check your email to verify your account.' 
    });
    
    // Mock organizations API endpoint
    mockApi.onGet(/\/organizations\//).reply(200, {
      results: [
        { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Organization 1' },
        { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Organization 2' }
      ]
    });
  });
  
  afterEach(() => {
    mockApi.reset();
    jest.clearAllMocks();
  });
  
  test('renders the registration form with all fields', async () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    
    // Wait for form to load and for organizations to be fetched
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
    });
  });
  
  test('Organization field is optional and works with empty selection', async () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    
    // Fill out the required fields with valid data
    await waitFor(() => screen.getByLabelText(/first name/i));
    userEvent.type(screen.getByLabelText(/first name/i), 'Test');
    userEvent.type(screen.getByLabelText(/last name/i), 'User');
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    userEvent.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    
    // Do not select an organization (leave it empty)
    const organizationSelect = screen.getByLabelText(/organization/i);
    expect(organizationSelect.value).toBe('');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /register/i });
    userEvent.click(submitButton);
    
    // Check that the registration API was called with the right data
    await waitFor(() => {
      expect(mockApi.history.post.length).toBe(1);
      const requestData = JSON.parse(mockApi.history.post[0].data);
      expect(requestData.organization_id).toBeNull(); // Should be null, not empty string
    });
  });
  
  test('Organization field accepts valid UUID', async () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    
    // Fill out all fields
    await waitFor(() => screen.getByLabelText(/first name/i));
    userEvent.type(screen.getByLabelText(/first name/i), 'Test');
    userEvent.type(screen.getByLabelText(/last name/i), 'User');
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    userEvent.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    
    // Wait for organizations to load
    await waitFor(() => {
      const organizationSelect = screen.getByLabelText(/organization/i);
      expect(organizationSelect.options.length).toBeGreaterThan(1);
    });
    
    // Select a valid organization
    const organizationSelect = screen.getByLabelText(/organization/i);
    fireEvent.change(organizationSelect, { target: { value: '123e4567-e89b-12d3-a456-426614174000' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /register/i });
    userEvent.click(submitButton);
    
    // Check that the registration API was called with the right data
    await waitFor(() => {
      expect(mockApi.history.post.length).toBe(1);
      const requestData = JSON.parse(mockApi.history.post[0].data);
      expect(requestData.organization_id).toBe('123e4567-e89b-12d3-a456-426614174000'); // Valid UUID
    });
  });
  
  test('Shows validation error when API returns organization_id validation error', async () => {
    // Mock API to return validation error for organization_id
    mockApi.onPost('http://localhost:8000/api/auth/register/').reply(400, {
      organization_id: ['Must be a valid UUID.']
    });
    
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    
    // Fill out all required fields
    await waitFor(() => screen.getByLabelText(/first name/i));
    userEvent.type(screen.getByLabelText(/first name/i), 'Test');
    userEvent.type(screen.getByLabelText(/last name/i), 'User');
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    userEvent.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /register/i });
    userEvent.click(submitButton);
    
    // Check that error message appears
    await waitFor(() => {
      expect(screen.getByText(/organization_id: Must be a valid UUID/i)).toBeInTheDocument();
    });
  });
}); 