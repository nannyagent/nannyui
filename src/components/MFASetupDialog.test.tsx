import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MFASetupDialog } from '@/components/MFASetupDialog';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  setupMFA: vi.fn(),
  verifyTOTPCode: vi.fn(),
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockQRCode'),
  },
}));

import { setupMFA, verifyTOTPCode } from '@/services/authService';

describe('MFASetupDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    userEmail: 'test@example.com',
  };

  const mockMFAData = {
    factorId: 'test-factor-id-123',
    secret: 'JBSWY3DPEBLW64TMMQ======',
    backupCodes: [
      'ABC123DEF456',
      'GHI789JKL012',
      'MNO345PQR678',
      'STU901VWX234',
      'YZA567BCD890',
      'EFG123HIJ456',
    ],
    qrUrl: 'otpauth://totp/test@example.com?secret=JBSWY3DPEBLW64TMMQ%3D%3D%3D%3D&issuer=NannyAI',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (setupMFA as any).mockResolvedValue({
      data: mockMFAData,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // Basic rendering tests
  it('should render dialog when open is true', () => {
    render(<MFASetupDialog {...defaultProps} />);
    expect(screen.getByText('Enable Multi-Factor Authentication (MFA)')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    render(<MFASetupDialog open={false} onOpenChange={vi.fn()} userEmail="test@example.com" />);
    expect(screen.queryByText('Enable Multi-Factor Authentication (MFA)')).not.toBeInTheDocument();
  });

  it('should call setupMFA when dialog opens', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(setupMFA).toHaveBeenCalled();
    });
  });

  // Tab navigation tests
  it('should display all four tabs after data loads', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Instructions' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'QR Code' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Backup Codes' })).toBeInTheDocument();
    });
  });

  it('should show Instructions tab by default', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Download an Authenticator App')).toBeInTheDocument();
      expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
      expect(screen.getByText('Save Backup Codes')).toBeInTheDocument();
    });
  });

  it('should switch to QR Code tab when clicked', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'QR Code' })).toBeInTheDocument();
    });

    const qrTab = screen.getByRole('tab', { name: 'QR Code' });
    await user.click(qrTab);

    expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument();
    expect(screen.getByText('Secret Key (Manual Entry)')).toBeInTheDocument();
  });

  // QR Code and Secret Key tests
  it('should display QR code image', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'QR Code' })).toBeInTheDocument();
    });

    const qrTab = screen.getByRole('tab', { name: 'QR Code' });
    await user.click(qrTab);

    expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument();
  });

  it('should display secret key for manual entry', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'QR Code' })).toBeInTheDocument();
    });

    const qrTab = screen.getByRole('tab', { name: 'QR Code' });
    await user.click(qrTab);

    expect(screen.getByText(mockMFAData.secret)).toBeInTheDocument();
  });

  it('should copy secret key to clipboard', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'QR Code' })).toBeInTheDocument();
    });

    const qrTab = screen.getByRole('tab', { name: 'QR Code' });
    await user.click(qrTab);

    const copyButton = screen.getByRole('button', { name: /Copy$/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument();
    });
  });

  // TOTP Verification tests
  it('should switch to Verify tab', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
  });

  it('should require 6-digit code for verification', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000');
    const verifyButton = screen.getByRole('button', { name: /Verify & Enable MFA/i });

    expect(verifyButton).toBeDisabled();

    // Enter partial code
    await user.type(input, '12345');
    expect(verifyButton).toBeDisabled();

    // Complete the code
    await user.type(input, '6');
    expect(verifyButton).not.toBeDisabled();
  });

  it('should only accept numeric input for TOTP code', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
    await user.type(input, 'abc123');

    expect(input.value).toBe('123');
  });

  it('should verify TOTP code successfully', async () => {
    const user = userEvent.setup();
    (verifyTOTPCode as any).mockResolvedValue({
      data: { valid: true, backupCodes: mockMFAData.backupCodes },
      error: null,
    });

    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000');
    await user.type(input, '123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable MFA/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(verifyTOTPCode).toHaveBeenCalledWith('123456', mockMFAData.factorId);
    });

    await waitFor(() => {
      expect(screen.getByText('MFA Successfully Enabled')).toBeInTheDocument();
    });
  });

  it('should handle invalid TOTP code', async () => {
    const user = userEvent.setup();
    (verifyTOTPCode as any).mockResolvedValue({
      data: { valid: false },
      error: null,
    });

    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000');
    await user.type(input, '000000');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable MFA/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid TOTP code/i)).toBeInTheDocument();
    });
  });

  it('should allow pressing Enter to verify code', async () => {
    const user = userEvent.setup();
    (verifyTOTPCode as any).mockResolvedValue({
      data: { valid: true, backupCodes: mockMFAData.backupCodes },
      error: null,
    });

    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000');
    await user.type(input, '123456');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(verifyTOTPCode).toHaveBeenCalled();
    });
  });

  // Backup Codes tests
  it('should display backup codes', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Backup Codes' })).toBeInTheDocument();
    });

    const backupTab = screen.getByRole('tab', { name: 'Backup Codes' });
    await user.click(backupTab);

    mockMFAData.backupCodes.forEach(code => {
      expect(screen.getByText(code)).toBeInTheDocument();
    });
  });

  it('should copy all backup codes', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Backup Codes' })).toBeInTheDocument();
    });

    const backupTab = screen.getByRole('tab', { name: 'Backup Codes' });
    await user.click(backupTab);

    const copyAllButton = screen.getByRole('button', { name: /Copy All Codes/i });
    await user.click(copyAllButton);

    await waitFor(() => {
      expect(screen.getByText('All Codes Copied')).toBeInTheDocument();
    });
  });

  it('should download backup codes as file', async () => {
    const user = userEvent.setup();
    const createElementSpy = vi.spyOn(document, 'createElement');
    
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Backup Codes' })).toBeInTheDocument();
    });

    const backupTab = screen.getByRole('tab', { name: 'Backup Codes' });
    await user.click(backupTab);

    const downloadButton = screen.getByRole('button', { name: /Download Codes/i });
    await user.click(downloadButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  // Error handling tests
  it('should display error when setupMFA fails', async () => {
    (setupMFA as any).mockResolvedValue({
      data: null,
      error: { message: 'Failed to setup MFA' },
    });

    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to setup MFA')).toBeInTheDocument();
    });
  });

  it('should display error when TOTP verification fails', async () => {
    const user = userEvent.setup();
    (verifyTOTPCode as any).mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000');
    await user.type(input, '123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable MFA/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  // Dialog closing tests
  it('should close dialog when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    
    render(<MFASetupDialog open={true} onOpenChange={onOpenChange} userEmail="test@example.com" />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // Accessibility tests
  it('should have proper accessibility labels', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Instructions' })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Enable Multi-Factor Authentication/ })).toBeInTheDocument();
  });

  it('should display success message after TOTP verification', async () => {
    const user = userEvent.setup();
    (verifyTOTPCode as any).mockResolvedValue({
      data: { valid: true, backupCodes: mockMFAData.backupCodes },
      error: null,
    });

    render(<MFASetupDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Verify' })).toBeInTheDocument();
    });

    const verifyTab = screen.getByRole('tab', { name: 'Verify' });
    await user.click(verifyTab);

    const input = screen.getByPlaceholderText('000000');
    await user.type(input, '123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable MFA/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('MFA Successfully Enabled')).toBeInTheDocument();
      expect(screen.getByText(/Your account is now protected with multi-factor authentication/)).toBeInTheDocument();
    });
  });
});

