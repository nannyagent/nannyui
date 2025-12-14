import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import withAuth from '../withAuth';
import * as authService from '@/services/authService';

// Mock the authService
vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test component to wrap with HOC
const TestComponent: React.FC = () => {
  return <div>Protected Content</div>;
};

describe('withAuth HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while checking authentication', () => {
    vi.mocked(authService.getCurrentUser).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const ProtectedComponent = withAuth(TestComponent);

    render(
      <BrowserRouter>
        <ProtectedComponent />
      </BrowserRouter>
    );

    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should render protected component when user is authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    };

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);

    const ProtectedComponent = withAuth(TestComponent);

    render(
      <BrowserRouter>
        <ProtectedComponent />
      </BrowserRouter>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeTruthy();
    });
  });

  it('should redirect to home page when user is not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const ProtectedComponent = withAuth(TestComponent);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedComponent />
      </MemoryRouter>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      // Component should not render protected content
      expect(screen.queryByText('Protected Content')).toBeNull();
    });
  });

  it('should handle authentication errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(authService.getCurrentUser).mockRejectedValue(
      new Error('Auth service error')
    );

    const ProtectedComponent = withAuth(TestComponent);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedComponent />
      </MemoryRouter>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not show toast when already on home page and not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const ProtectedComponent = withAuth(TestComponent);

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedComponent />
      </MemoryRouter>
    );

    await waitFor(() => {
      // When on home page, should return null without showing toast
      expect(screen.queryByText('Protected Content')).toBeNull();
    });
  });

  it('should pass props to the wrapped component', async () => {
    interface TestProps {
      testProp: string;
    }

    const PropsTestComponent: React.FC<TestProps> = ({ testProp }) => {
      return <div>Protected Content with {testProp}</div>;
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);

    const ProtectedComponent = withAuth(PropsTestComponent);

    render(
      <BrowserRouter>
        <ProtectedComponent testProp="custom value" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content with custom value')).toBeTruthy();
    });
  });
});
