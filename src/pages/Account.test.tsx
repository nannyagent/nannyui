import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Account } from './Account';
import * as authService from '@/services/authService';

// Mock components
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('@/components/ChangePasswordDialog', () => ({
  ChangePasswordDialog: ({ open, onOpenChange }: any) => (
    open ? <div data-testid="change-password-dialog">Change Password Dialog <button onClick={() => onOpenChange(false)}>Close</button></div> : null
  )
}));

vi.mock('@/components/MFASetupDialog', () => ({
  MFASetupDialog: ({ open, onOpenChange, onSuccess }: any) => (
    open ? <div data-testid="mfa-setup-dialog">MFA Setup Dialog <button onClick={() => { onSuccess(); onOpenChange(false); }}>Success</button></div> : null
  )
}));

vi.mock('@/components/DisableMFADialog', () => ({
  DisableMFADialog: ({ open, onOpenChange, onSuccess }: any) => (
    open ? <div data-testid="disable-mfa-dialog">Disable MFA Dialog <button onClick={() => { onSuccess(); onOpenChange(false); }}>Success</button></div> : null
  )
}));

// Mock auth service
vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
  getCurrentSession: vi.fn(),
  isMFAEnabled: vi.fn(),
  getUserAuthProviders: vi.fn(),
}));

describe('Account', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    created: '2023-01-01T00:00:00Z',
    updated: '2023-01-02T00:00:00Z',
    collectionId: 'users',
    collectionName: 'users',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authService.getCurrentUser as any).mockResolvedValue(mockUser);
    (authService.getCurrentSession as any).mockResolvedValue('token-123');
    (authService.isMFAEnabled as any).mockResolvedValue(false);
    (authService.getUserAuthProviders as any).mockResolvedValue([]);
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading account data...')).toBeInTheDocument();
  });

  it('renders user data after loading', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Test User')[0]).toBeInTheDocument();
      expect(screen.getAllByText('test@example.com')[0]).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    (authService.getCurrentUser as any).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/There was an issue loading your profile information/i)).toBeInTheDocument();
    });
  });

  it('opens change password dialog', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Change Password'));
    expect(screen.getByTestId('change-password-dialog')).toBeInTheDocument();
  });

  it('opens MFA setup dialog when MFA is disabled', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Enable MFA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enable MFA'));
    expect(screen.getByTestId('mfa-setup-dialog')).toBeInTheDocument();
  });

  it('opens Disable MFA dialog when MFA is enabled', async () => {
    (authService.isMFAEnabled as any).mockResolvedValue(true);

    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Disable MFA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Disable MFA'));
    expect(screen.getByTestId('disable-mfa-dialog')).toBeInTheDocument();
  });

  it('refreshes data after MFA setup success', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Enable MFA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enable MFA'));
    
    // Mock MFA enabled for the refresh
    (authService.isMFAEnabled as any).mockResolvedValue(true);
    
    fireEvent.click(screen.getByText('Success')); // Click success button in mock dialog

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(2);
      expect(authService.isMFAEnabled).toHaveBeenCalledTimes(2);
    });
  });

  it('hides MFA buttons for OAuth/SSO users', async () => {
    (authService.getUserAuthProviders as any).mockResolvedValue(['github']);

    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/MFA is managed by your OAuth provider/i)).toBeInTheDocument();
    });

    // Enable MFA button should not be present for OAuth users
    expect(screen.queryByText('Enable MFA')).not.toBeInTheDocument();
    // Change Password button should also not be present for OAuth users
    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('shows correct provider name for OAuth users', async () => {
    (authService.getUserAuthProviders as any).mockResolvedValue(['google']);

    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Enable 2FA in your Google account settings/i)).toBeInTheDocument();
    });
  });
});
