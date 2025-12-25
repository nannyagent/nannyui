import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { pb } from '@/integrations/pocketbase/client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the PocketBase client
vi.mock('@/integrations/pocketbase/client', () => {
  const onChangeMock = vi.fn();
  return {
    pb: {
      authStore: {
        isValid: false,
        record: null,
        token: null,
        onChange: onChangeMock,
      },
    },
  };
});

// Test component to consume the context
const TestComponent = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return <div>{user ? `User: ${user.email}` : 'No User'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset authStore state
    (pb.authStore as any).isValid = false;
    (pb.authStore as any).record = null;
    (pb.authStore as any).token = null;
  });

  it('provides user when authenticated initially', async () => {
    // Setup initial authenticated state
    (pb.authStore as any).isValid = true;
    (pb.authStore as any).record = { id: '123', email: 'test@example.com' };
    (pb.authStore as any).token = 'fake-token';

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
  });

  it('provides no user when not authenticated initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });

  it('updates state when auth changes', async () => {
    let changeCallback: (token: string, record: any) => void = () => {};
    
    // Capture the callback passed to onChange
    (pb.authStore.onChange as any).mockImplementation((cb: any) => {
      changeCallback = cb;
      return () => {}; // return unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });

    // Simulate auth change (login)
    act(() => {
      changeCallback('new-token', { id: '456', email: 'new@example.com' });
    });

    await waitFor(() => {
      expect(screen.getByText('User: new@example.com')).toBeInTheDocument();
    });

    // Simulate auth change (logout)
    act(() => {
      changeCallback('', null);
    });

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });
});
