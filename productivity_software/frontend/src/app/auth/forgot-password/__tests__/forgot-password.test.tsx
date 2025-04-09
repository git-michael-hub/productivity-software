import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import ForgotPassword from '../page';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    render(<ForgotPassword />);
    
    // Check for heading
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });

  it('validates email input', async () => {
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    
    // Try submitting with empty email
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
    
    // Try with invalid email format
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
    });
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
  });

  it('handles successful password reset request', async () => {
    // Mock successful API response
    mockedAxios.post.mockResolvedValueOnce({});
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    
    // Fill in and submit the form
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });
    
    // Check that the API was called with correct data
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/password-reset/'),
      { email: 'test@example.com' }
    );
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Password reset email sent/i)).toBeInTheDocument();
      expect(screen.getByText(/Return to Login/i)).toBeInTheDocument();
    });
  });

  it('handles API error during password reset request', async () => {
    // Mock API error response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: { detail: 'User not found' }
      }
    });
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    
    // Fill in and submit the form
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.click(submitButton);
    });
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/No user found with this email address/i)).toBeInTheDocument();
    });
  });

  it('handles network error during password reset request', async () => {
    // Mock network error
    mockedAxios.post.mockRejectedValueOnce({ request: {} });
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    
    // Fill in and submit the form
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
}); 