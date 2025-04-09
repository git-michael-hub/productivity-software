import '@testing-library/jest-dom';
import { render, act, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

// Test component that uses auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{auth.isAuthenticated ? 'logged-in' : 'logged-out'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mock.reset();
  });

  it('provides authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
  });

  it('handles successful login', async () => {
    mock.onPost('/api/auth/login/').reply(200, {
      access: 'fake-access-token',
      refresh: 'fake-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com'
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in');
    });
  });

  it('handles login failure', async () => {
    mock.onPost('/api/auth/login/').reply(401, {
      detail: 'Invalid credentials'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
    });
  });

  it('handles logout', async () => {
    mock.onPost('/api/auth/logout/').reply(200);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      userEvent.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
    });
  });

  it('refreshes token when expired', async () => {
    const expiredToken = 'expired-token';
    const newToken = 'new-token';

    mock.onPost('/api/auth/token/refresh/').reply(200, {
      access: newToken
    });

    localStorage.setItem('auth_tokens', JSON.stringify({
      access: expiredToken,
      refresh: 'refresh-token'
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
      expect(tokens.access).toBe(newToken);
    });
  });
}); 