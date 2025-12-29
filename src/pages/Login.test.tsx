import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';
import * as authService from '@/services/authService';

// Mock components
vi.mock('@/components/LoginHeader', () => ({ default: () => <div data-testid="login-header">Header</div> }));
vi.mock('@/components/GlassMorphicCard', () => ({ default: ({ children }: any) => <div data-testid="glass-card">{children}</div> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/components/ErrorBanner', () => ({ default: () => <div data-testid="error-banner">Error</div> }));

// Mock auth service
vi.mock('@/services/authService', () => ({
  signInWithGitHub: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  getCurrentUser: vi.fn(),
  isMFAEnabled: vi.fn(),
}));

// Mock hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authService.getCurrentUser as any).mockResolvedValue(null);
  });

  it('renders login options', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
  });

  it('redirects if already logged in', async () => {
    (authService.getCurrentUser as any).mockResolvedValue({ id: '1' });
    (authService.isMFAEnabled as any).mockResolvedValue(false);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles email login flow', async () => {
    (authService.signInWithEmail as any).mockResolvedValue({ user: { id: '1' }, error: null });
    (authService.isMFAEnabled as any).mockResolvedValue(false);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Click "Sign in with Email"
    fireEvent.click(screen.getByText('Sign in with Email'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authService.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
