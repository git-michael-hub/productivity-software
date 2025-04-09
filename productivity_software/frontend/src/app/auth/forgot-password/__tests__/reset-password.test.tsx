import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import ResetPassword from '../reset/page';
import { useSearchParams, useRouter } from 'next/navigation';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('ResetPassword Component', () => {
  const mockSearchParams = new URLSearchParams();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => mockSearchParams.get(param),
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('shows validation error when token is missing', async () => {
    // Simulate missing token in URL
    mockSearchParams.delete('token');
    
    render(<ResetPassword />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/No reset token found in URL/i)).toBeInTheDocument();
      expect(screen.getByText(/Request New Reset Link/i)).toBeInTheDocument();
    });
  });

  it('renders the reset password form with valid token', async () => {
    // Simulate valid token in URL
    mockSearchParams.set('token', 'valid-token');
    mockSearchParams.set('user_id', '123');
    
    render(<ResetPassword />);
    
    // Wait for token validation
    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    // Simulate valid token in URL
    mockSearchParams.set('token', 'valid-token');
    
    render(<ResetPassword />);
    
    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    
    // Test too short password
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // Test missing uppercase
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();
    });
  });

  it('validates passwords match', async () => {
    // Simulate valid token in URL
    mockSearchParams.set('token', 'valid-token');
    
    render(<ResetPassword />);
    
    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    
    // Enter non-matching passwords
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmInput, { target: { value: 'Password456' } });
      fireEvent.click(submitButton);
    });
    
    // Check for mismatch error
    await waitFor(() => {
      expect(screen.getByText(/Passwords must match/i)).toBeInTheDocument();
    });
  });

  it('handles successful password reset', async () => {
    // Simulate valid token in URL
    mockSearchParams.set('token', 'valid-token');
    mockSearchParams.set('user_id', '123');
    
    // Mock successful API response
    mockedAxios.post.mockResolvedValueOnce({});
    
    render(<ResetPassword />);
    
    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    
    // Fill and submit form
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
      fireEvent.click(submitButton);
    });
    
    // Check API was called with correct data
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/password/reset/confirm/'),
      { token: 'valid-token', password: 'NewPassword123', user_id: '123' }
    );
    
    // Check success message appears
    await waitFor(() => {
      expect(screen.getByText(/Your password has been successfully reset/i)).toBeInTheDocument();
      expect(screen.getByText(/Go to Login/i)).toBeInTheDocument();
    });
  });

  it('handles API error during password reset', async () => {
    // Simulate valid token in URL
    mockSearchParams.set('token', 'valid-token');
    
    // Mock API error response for invalid token
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Invalid or expired token' }
      }
    });
    
    render(<ResetPassword />);
    
    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    
    // Fill and submit form
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
      fireEvent.click(submitButton);
    });
    
    // Check error message appears
    await waitFor(() => {
      expect(screen.getByText(/Your password reset link has expired/i)).toBeInTheDocument();
    });
  });
}); 