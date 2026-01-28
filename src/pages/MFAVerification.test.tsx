import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MFAVerification from './MFAVerification';
import * as authService from '@/services/authService';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(() => ({ pathname: '/mfa-verify' })),
}));

vi.mock('@/services/authService', () => ({
  verifyMFALogin: vi.fn(),
  verifyBackupCode: vi.fn(),
  getRemainingBackupCodes: vi.fn(),
  getCurrentUser: vi.fn(),
  getMFAFactors: vi.fn(),
  createMFAChallenge: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/GlassMorphicCard', () => ({
  default: ({ children }: any) => <div data-testid="glass-card">{children}</div>,
}));

vi.mock('@/components/ErrorBanner', () => ({
  default: ({ message }: any) => <div>{message}</div>,
}));

describe('MFAVerification Component', () => {
  const mockNavigate = vi.fn();
  const mockFactorId = 'factor-123';
  const mockChallengeId = 'challenge-456';

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (authService.getCurrentUser as any).mockResolvedValue({
      id: 'test-user',
      email: 'test@example.com',
    });
    (authService.getMFAFactors as any).mockResolvedValue([
      { id: mockFactorId, factor_type: 'totp', status: 'verified' }
    ]);
    (authService.createMFAChallenge as any).mockResolvedValue({
      data: { challengeId: mockChallengeId },
      error: null,
    });
  });

  describe('Page Rendering', () => {
    it('should display Two-Factor Authentication title after loading', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      });
    });

    it('should display Authenticator and Backup Code tabs', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Authenticator/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
    });

    it('should display support contact link', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        const link = screen.getByRole('link', { name: /support@nannyai.dev/i });
        expect(link).toHaveAttribute('href', 'mailto:support@nannyai.dev');
      });
    });
  });

  describe('TOTP Code Input', () => {
    it('should only accept numeric characters', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });
      const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
      
      await user.type(input, 'abc123xyz');
      expect(input.value).toBe('123');
    });

    it('should limit to 6 digits', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });
      const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
      
      await user.type(input, '1234567890');
      expect(input.value).toBe('123456');
    });

    it('should disable verify button when code incomplete', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      expect(buttons[0]).toBeDisabled();
    });

    it('should enable verify button with 6 digits', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });
      const input = screen.getByPlaceholderText('000000');
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      
      await user.type(input, '123456');
      expect(buttons[0]).not.toBeDisabled();
    });
  });

  describe('Backup Code Input', () => {
    it('should convert to uppercase', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      const input = screen.getByPlaceholderText(/ABC12345/i) as HTMLInputElement;
      await user.type(input, 'abc12345');
      expect(input.value).toBe('ABC12345');
    });

    it('should disable verify button when empty', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      expect(buttons[buttons.length - 1]).toBeDisabled();
    });

    it('should enable verify button when filled', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      const input = screen.getByPlaceholderText(/ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      
      await user.type(input, 'ABC12345');
      expect(buttons[buttons.length - 1]).not.toBeDisabled();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with Authenticator tab active', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Authenticator/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Authenticator/i });
      expect(tab).toHaveAttribute('data-state', 'active');
    });

    it('should switch to Backup Code tab', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      
      await user.click(tab);
      expect(tab).toHaveAttribute('data-state', 'active');
    });

    it('should display backup code specific text when active', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      
      await user.click(tab);
      expect(screen.getByText(/one-time use only/i)).toBeInTheDocument();
    });
  });

  describe('API Calls', () => {
    it('should call verifyMFALogin with code, challengeId, and factorId', async () => {
      const user = userEvent.setup();
      (authService.verifyMFALogin as any).mockResolvedValue({
        data: { valid: true },
        error: null,
      });
      
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });
      const input = screen.getByPlaceholderText('000000');
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      
      await user.type(input, '123456');
      await user.click(buttons[0]);
      
      expect(authService.verifyMFALogin).toHaveBeenCalledWith('123456', mockChallengeId, mockFactorId);
    });

    it('should call verifyBackupCode with code, challengeId, and factorId', async () => {
      const user = userEvent.setup();
      (authService.verifyBackupCode as any).mockResolvedValue({
        data: { valid: true, remaining: 7 },
        error: null,
      });
      
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      const input = screen.getByPlaceholderText(/ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      
      await user.type(input, 'ABC12345');
      await user.click(buttons[buttons.length - 1]);
      
      expect(authService.verifyBackupCode).toHaveBeenCalledWith('ABC12345', mockChallengeId, mockFactorId);
    });

    it('should display backup code input as uppercase', async () => {
      const user = userEvent.setup();
      (authService.verifyBackupCode as any).mockResolvedValue({
        data: { valid: true, remaining: 7 },
        error: null,
      });
      
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      const input = screen.getByPlaceholderText(/ABC12345/i) as HTMLInputElement;
      await user.type(input, 'abc12345');
      
      expect(input.value).toBe('ABC12345');
    });

    it('should initialize MFA by getting factors and creating challenge', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        expect(authService.getMFAFactors).toHaveBeenCalled();
        expect(authService.createMFAChallenge).toHaveBeenCalledWith(mockFactorId);
      });
    });
  });

  describe('Help Features', () => {
    it('should show Help button on backup tab', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      expect(screen.getByRole('button', { name: /Show Help/i })).toBeInTheDocument();
    });

    it('should toggle help info display', async () => {
      const user = userEvent.setup();
      render(<MFAVerification />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
      });
      const tab = screen.getByRole('tab', { name: /Backup Code/i });
      await user.click(tab);
      
      const btn = screen.getByRole('button', { name: /Show Help/i });
      await user.click(btn);
      
      expect(screen.getByText(/How to use backup codes/i)).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should check authentication on load', async () => {
      render(<MFAVerification />);
      await waitFor(() => {
        expect(authService.getCurrentUser).toHaveBeenCalled();
      });
    });

    it('should redirect to login if not authenticated', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(null);
      render(<MFAVerification />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to dashboard if no MFA factors', async () => {
      (authService.getMFAFactors as any).mockResolvedValue([]);
      render(<MFAVerification />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
