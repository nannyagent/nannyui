
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { onAuthStateChange } from '@/services/authService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/services/authService', () => ({
  onAuthStateChange: vi.fn(),
}));

const mockUser = { id: '123', email: 'test@example.com' };
const mockSession = { access_token: 'abc-123', user: mockUser };

const TestComponent = () => {
  const { user, session, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <div data-testid="session">{session ? session.access_token : 'No Session'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: null } });
    (onAuthStateChange as vi.Mock).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  it('should provide loading state initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should provide session and user after loading', async () => {
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: mockSession } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('abc-123');
    });
  });

  it('should update the context on auth state change', async () => {
    let authCallback: (event: string, session: any) => void = () => {};
    (onAuthStateChange as vi.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      authCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('abc-123');
    });

    act(() => {
      authCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('session')).toHaveTextContent('No Session');
    });
  });

  it.skip('should throw an error if useAuth is used outside of AuthProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      function TestComponent() {
        useAuth();
        return <div>Test</div>;
      }
      render(<TestComponent />);
    }).toThrow();
    
    consoleErrorSpy.mockRestore();
  });

  it('should unsubscribe from auth state changes on unmount', async () => {
    const unsubscribe = vi.fn();
    (onAuthStateChange as vi.Mock).mockReturnValue({ data: { subscription: { unsubscribe } } });

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
