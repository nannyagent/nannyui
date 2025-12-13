import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MFAVerification from './MFAVerification';
import * as authService from '@/services/authService';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(() => ({ pathname: '/mfa-verify' })),
}));

vi.mock('@/services/authService', () => ({
  verifyMFALogin: vi.fn(),
  verifyBackupCode: vi.fn(),
  getRemainingBackupCodes: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/GlassMorphicCard', () => ({
  default: ({ children }: any) => <div data-testid="glass-card">{children}</div>,
}));

vi.mock('@/components/ErrorBanner', () => ({
  default: ({ message }: any) => <div data-testid="error-banner">{message}</div>,
}));

describe('MFAVerification', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (authService.getCurrentUser as any).mockResolvedValue({ id: 'test-user', email: 'test@example.com' });
  });

  describe('Initial Rendering', () => {
    it('should render the MFA verification page', () => {
      render(<MFAVerification />);
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    it('should display authenticator and backup code tabs', () => {
      render(<MFAVerification />);
      expect(screen.getByRole('tab', { name: /Authenticator/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
    });

    it('should have authenticator tab active by default', async () => {
      render(<MFAVerification />);
      const authenticatorTab = screen.getByRole('tab', { name: /Authenticator/i });
      expect(authenticatorTab).toHaveAttribute('data-state', 'active');
    });

    it('should redirect to login if user is not authenticated', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(null);
      render(<MFAVerification />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('TOTP Verification', () => {
    it('should accept only numeric input in TOTP field', async () => {
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
      
      await userEvent.type(input, 'abc123def');
      expect(input.value).toBe('123');
    });

    it('should limit TOTP input to 6 digits', async () => {
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
      
      await userEvent.type(input, '1234567890');
      expect(input.value).toBe('123456');
    });

    it('should disable verify button when code is incomplete', () => {
      render(<MFAVerification />);
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      expect(verifyButton).toBeDisabled();
    });

    it('should enable verify button when code is 6 digits', async () => {
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      expect(verifyButton).not.toBeDisabled();
    });

    it('should call verifyMFALogin with correct code', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      expect(authService.verifyMFALogin).toHaveBeenCalledWith('123456');
    });

    it('should show success message on valid TOTP', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verified ✓')).toBeInTheDocument();
      });
    });

    it('should show error message on invalid TOTP', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ 
        data: { valid: false, error: 'Invalid code' }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '000000');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid code')).toBeInTheDocument();
      });
    });

    it('should handle TOTP verification error', async () => {
      const error = new Error('Network error');
      (authService.verifyMFALogin as any).mockResolvedValue({ data: null, error });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear error message when user types', async () => {
      (authService.verifyMFALogin as any)
        .mockResolvedValueOnce({ data: { valid: false }, error: null })
        .mockResolvedValueOnce({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      let input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      // First attempt - fail
      await userEvent.type(input, '000000');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
      
      // Clear and type again
      input = screen.getByPlaceholderText('000000');
      await userEvent.clear(input);
      await userEvent.type(input, '123456');
      
      // Error should be cleared
      expect(screen.queryByText('Invalid TOTP code. Please try again.')).not.toBeInTheDocument();
    });
  });

  describe('Backup Code Verification', () => {
    it('should accept backup code input', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i) as HTMLInputElement;
      await userEvent.type(input, 'abc12345');
      
      expect(input.value).toBe('ABC12345');
    });

    it('should disable verify button when backup code is empty', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      expect(backupVerifyButton).toBeDisabled();
    });

    it('should enable verify button when backup code is entered', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      await userEvent.type(input, 'ABC12345');
      
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      expect(backupVerifyButton).not.toBeDisabled();
    });

    it('should call verifyBackupCode with correct code', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      expect(authService.verifyBackupCode).toHaveBeenCalledWith('ABC12345');
    });

    it('should show success message on valid backup code', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verified ✓')).toBeInTheDocument();
      });
    });

    it('should show error on invalid backup code', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: false }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'INVALID');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid backup code')).toBeInTheDocument();
      });
    });

    it('should display remaining codes count after successful verification', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 3 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/3 codes remaining/i)).toBeInTheDocument();
      });
    });

    it('should show help information when help button is clicked', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const helpButton = screen.getByRole('button', { name: /Show Help/i });
      expect(helpButton).toBeInTheDocument();
      
      await userEvent.click(helpButton);
      expect(screen.getByText(/How to use backup codes/i)).toBeInTheDocument();
    });

    it('should clear error message when user types', async () => {
      (authService.verifyBackupCode as any)
        .mockResolvedValueOnce({ data: { valid: false }, error: null })
        .mockResolvedValueOnce({ data: { valid: true, remaining: 7 }, error: null });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      let input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      // First attempt - fail
      await userEvent.type(input, 'INVALID');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid backup code')).toBeInTheDocument();
      });
      
      // Clear and type again
      input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      await userEvent.clear(input);
      await userEvent.type(input, 'ABC12345');
      
      // Error should be cleared
      expect(screen.queryByText('Invalid backup code')).not.toBeInTheDocument();
    });
  });

  describe('UI/UX Features', () => {
    it('should show support contact in emergency section', () => {
      render(<MFAVerification />);
      const supportLink = screen.getByRole('link', { name: /support@nannyai.dev/i });
      expect(supportLink).toHaveAttribute('href', 'mailto:support@nannyai.dev');
    });

    it('should display different helper text for each method', async () => {
      render(<MFAVerification />);
      
      expect(screen.getByText(/Can't access your authenticator app/i)).toBeInTheDocument();
      
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      expect(screen.getByText(/one-time use only/i)).toBeInTheDocument();
    });

    it('should trim and uppercase backup codes', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, '  abc12345  ');
      await userEvent.click(backupVerifyButton);
      
      expect(authService.verifyBackupCode).toHaveBeenCalledWith('ABC12345');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ 
        data: null, 
        error: new Error('Network error') 
      });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle session expiration', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(null);
      
      render(<MFAVerification />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});

describe('MFAVerification', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (authService.getCurrentUser as any).mockResolvedValue({ id: 'test-user', email: 'test@example.com' });
  });

  describe('Initial Rendering', () => {
    it('should render the MFA verification page', () => {
      render(<MFAVerification />);
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    it('should display authenticator and backup code tabs', () => {
      render(<MFAVerification />);
      expect(screen.getByRole('tab', { name: /Authenticator/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Backup Code/i })).toBeInTheDocument();
    });

    it('should have authenticator tab active by default', async () => {
      render(<MFAVerification />);
      const authenticatorTab = screen.getByRole('tab', { name: /Authenticator/i });
      expect(authenticatorTab).toHaveAttribute('data-state', 'active');
    });

    it('should redirect to login if user is not authenticated', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(null);
      render(<MFAVerification />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('TOTP Verification', () => {
    it('should accept only numeric input in TOTP field', async () => {
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
      
      await userEvent.type(input, 'abc123def');
      expect(input.value).toBe('123');
    });

    it('should limit TOTP input to 6 digits', async () => {
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
      
      await userEvent.type(input, '1234567890');
      expect(input.value).toBe('123456');
    });

    it('should disable verify button when code is incomplete', () => {
      render(<MFAVerification />);
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      expect(verifyButton).toBeDisabled();
    });

    it('should enable verify button when code is 6 digits', async () => {
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      expect(verifyButton).not.toBeDisabled();
    });

    it('should call verifyMFALogin with correct code', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      expect(authService.verifyMFALogin).toHaveBeenCalledWith('123456');
    });

    it('should show success message on valid TOTP', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verified ✓')).toBeInTheDocument();
      });
    });

    it('should show error message on invalid TOTP', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ 
        data: { valid: false, error: 'Invalid code' }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '000000');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid code')).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard after successful verification', async () => {
      vi.useFakeTimers();
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      vi.advanceTimersByTime(1500);
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      vi.useRealTimers();
    });

    it('should handle TOTP verification error', async () => {
      const error = new Error('Network error');
      (authService.verifyMFALogin as any).mockResolvedValue({ data: null, error });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
    });

    it('should verify TOTP on Enter key press', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      
      await userEvent.type(input, '123456');
      await userEvent.keyboard('{Enter}');
      
      expect(authService.verifyMFALogin).toHaveBeenCalledWith('123456');
    });

    it('should not verify on Enter key if code is incomplete', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      
      await userEvent.type(input, '12345');
      await userEvent.keyboard('{Enter}');
      
      expect(authService.verifyMFALogin).not.toHaveBeenCalled();
    });

    it('should clear error message when user types', async () => {
      (authService.verifyMFALogin as any)
        .mockResolvedValueOnce({ data: { valid: false }, error: null })
        .mockResolvedValueOnce({ data: { valid: true }, error: null });
      
      render(<MFAVerification />);
      let input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      // First attempt - fail
      await userEvent.type(input, '000000');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
      
      // Clear and type again
      input = screen.getByPlaceholderText('000000');
      await userEvent.clear(input);
      await userEvent.type(input, '123456');
      
      // Error should be cleared
      expect(screen.queryByText('Invalid TOTP code. Please try again.')).not.toBeInTheDocument();
    });
  });

  describe('Backup Code Verification', () => {
    it('should switch to backup code tab', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      
      await userEvent.click(backupTab);
      expect(backupTab).toHaveAttribute('data-state', 'active');
    });

    it('should accept backup code input', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i) as HTMLInputElement;
      await userEvent.type(input, 'abc12345');
      
      expect(input.value).toBe('ABC12345');
    });

    it('should disable verify button when backup code is empty', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      expect(backupVerifyButton).toBeDisabled();
    });

    it('should enable verify button when backup code is entered', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      await userEvent.type(input, 'ABC12345');
      
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      expect(backupVerifyButton).not.toBeDisabled();
    });

    it('should call verifyBackupCode with correct code', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      expect(authService.verifyBackupCode).toHaveBeenCalledWith('ABC12345');
    });

    it('should show success message on valid backup code', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verified ✓')).toBeInTheDocument();
      });
    });

    it('should show error on invalid backup code', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: false }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'INVALID');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid backup code')).toBeInTheDocument();
      });
    });

    it('should display remaining codes count after successful verification', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 3 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/3 codes remaining/i)).toBeInTheDocument();
      });
    });

    it('should verify backup code on Enter key', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.keyboard('{Enter}');
      
      expect(authService.verifyBackupCode).toHaveBeenCalledWith('ABC12345');
    });

    it('should redirect to dashboard after successful backup code verification', async () => {
      vi.useFakeTimers();
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, 'ABC12345');
      await userEvent.click(backupVerifyButton);
      
      vi.advanceTimersByTime(1500);
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      vi.useRealTimers();
    });

    it('should show help information when help button is clicked', async () => {
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const helpButton = screen.getByRole('button', { name: /Show Help/i });
      expect(helpButton).toBeInTheDocument();
      
      await userEvent.click(helpButton);
      expect(screen.getByText(/How to use backup codes/i)).toBeInTheDocument();
    });

    it('should clear error message when user types', async () => {
      (authService.verifyBackupCode as any)
        .mockResolvedValueOnce({ data: { valid: false }, error: null })
        .mockResolvedValueOnce({ data: { valid: true, remaining: 7 }, error: null });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      let input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      // First attempt - fail
      await userEvent.type(input, 'INVALID');
      await userEvent.click(backupVerifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid backup code')).toBeInTheDocument();
      });
      
      // Clear and type again
      input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      await userEvent.clear(input);
      await userEvent.type(input, 'ABC12345');
      
      // Error should be cleared
      expect(screen.queryByText('Invalid backup code')).not.toBeInTheDocument();
    });
  });

  describe('UI/UX Features', () => {
    it('should show support contact in emergency section', () => {
      render(<MFAVerification />);
      const supportLink = screen.getByRole('link', { name: /support@nannyai.dev/i });
      expect(supportLink).toHaveAttribute('href', 'mailto:support@nannyai.dev');
    });

    it('should allow switching between tabs', async () => {
      render(<MFAVerification />);
      
      // Start on authenticator tab
      expect(screen.getByRole('tab', { name: /Authenticator/i })).toHaveAttribute('data-state', 'active');
      
      // Switch to backup code tab
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      expect(backupTab).toHaveAttribute('data-state', 'active');
      
      // Switch back to authenticator tab
      const authenticatorTab = screen.getByRole('tab', { name: /Authenticator/i });
      await userEvent.click(authenticatorTab);
      expect(authenticatorTab).toHaveAttribute('data-state', 'active');
    });

    it('should display different helper text for each method', async () => {
      render(<MFAVerification />);
      
      expect(screen.getByText(/Can't access your authenticator app/i)).toBeInTheDocument();
      
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      expect(screen.getByText(/one-time use only/i)).toBeInTheDocument();
    });

    it('should disable verify button during verification', async () => {
      (authService.verifyMFALogin as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { valid: true }, error: null }), 100))
      );
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      expect(verifyButton).toBeDisabled();
    });

    it('should trim and uppercase backup codes', async () => {
      (authService.verifyBackupCode as any).mockResolvedValue({ 
        data: { valid: true, remaining: 7 }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      const input = screen.getByPlaceholderText(/e.g., ABC12345/i);
      const buttons = screen.getAllByRole('button', { name: /Verify/i });
      const backupVerifyButton = buttons[buttons.length - 1];
      
      await userEvent.type(input, '  abc12345  ');
      await userEvent.click(backupVerifyButton);
      
      expect(authService.verifyBackupCode).toHaveBeenCalledWith('ABC12345');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ 
        data: null, 
        error: new Error('Network error') 
      });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      await userEvent.type(input, '123456');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle session expiration', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(null);
      
      render(<MFAVerification />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should clear errors when switching tabs', async () => {
      (authService.verifyMFALogin as any).mockResolvedValue({ 
        data: { valid: false }, 
        error: null 
      });
      
      render(<MFAVerification />);
      const input = screen.getByPlaceholderText('000000');
      const verifyButton = screen.getAllByRole('button', { name: /Verify/i })[0];
      
      // Create error
      await userEvent.type(input, '000000');
      await userEvent.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid TOTP code. Please try again.')).toBeInTheDocument();
      });
      
      // Switch tabs
      const backupTab = screen.getByRole('tab', { name: /Backup Code/i });
      await userEvent.click(backupTab);
      
      // Error should not be visible
      expect(screen.queryByText('Invalid TOTP code. Please try again.')).not.toBeInTheDocument();
    });
  });
});
