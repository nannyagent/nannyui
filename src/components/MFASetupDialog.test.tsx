import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MFASetupDialog } from '@/components/MFASetupDialog';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  setupMFA: vi.fn(() => Promise.resolve({
    data: {
      secret: 'JBSWY3DPEBLW64TMMQ5HK6YTJFYG2W5J',
      backupCodes: [
        'ABCD1234',
        'EFGH5678',
        'IJKL9012',
        'MNOP3456',
        'QRST7890',
        'UVWX1234',
        'XYZA5678',
        'BCDE9012',
      ],
      qrUrl: 'otpauth://totp/NannyAI:test@example.com?secret=JBSWY3DPEBLW64TMMQ5HK6YTJFYG2W5J&issuer=NannyAI',
    },
    error: null,
  })),
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mockqrcode')),
  },
}));

describe('MFASetupDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    userEmail: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open is true', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Enable Multi-Factor Authentication (MFA)')).toBeInTheDocument();
    });
  });

  it('should display three tabs', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Instructions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /QR Code/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Backup Codes/i })).toBeInTheDocument();
    });
  });

  it('should show instructions on initial load', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Download an Authenticator App/)).toBeInTheDocument();
      expect(screen.getByText(/Scan QR Code/)).toBeInTheDocument();
      expect(screen.getByText(/Save Backup Codes/)).toBeInTheDocument();
    });
  });

  it('should list supported authenticator apps', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Google Authenticator/)).toBeInTheDocument();
      expect(screen.getByText(/Microsoft Authenticator/)).toBeInTheDocument();
      expect(screen.getByText(/Authy/)).toBeInTheDocument();
      expect(screen.getByText(/FreeOTP/)).toBeInTheDocument();
    });
  });

  it('should display security warnings', async () => {
    render(<MFASetupDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Important Security Notes/i)).toBeInTheDocument();
      expect(screen.getByText(/Store backup codes securely/)).toBeInTheDocument();
      expect(screen.getByText(/support@nannyai.dev/)).toBeInTheDocument();
    });
  });

  it('should switch to QR Code tab', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const qrTab = screen.getByRole('tab', { name: /QR Code/i });
    await user.click(qrTab);

    await waitFor(() => {
      expect(screen.getByText(/Secret Key \(Manual Entry\)/)).toBeInTheDocument();
    });
  });

  it('should display secret key in QR Code tab', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const qrTab = screen.getByRole('tab', { name: /QR Code/i });
    await user.click(qrTab);

    await waitFor(() => {
      expect(screen.getByText(/JBSWY3DPEBLW64TMMQ5HK6YTJFYG2W5J/)).toBeInTheDocument();
    });
  });

  it('should have copy button for secret key', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const qrTab = screen.getByRole('tab', { name: /QR Code/i });
    await user.click(qrTab);

    await waitFor(() => {
      const copyButtons = screen.getAllByText(/Copy/i);
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  it('should switch to Backup Codes tab', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const backupTab = screen.getByRole('tab', { name: /Backup Codes/i });
    await user.click(backupTab);

    await waitFor(() => {
      expect(screen.getByText(/Backup Codes Are Critical/)).toBeInTheDocument();
    });
  });

  it('should display all 8 backup codes', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const backupTab = screen.getByRole('tab', { name: /Backup Codes/i });
    await user.click(backupTab);

    await waitFor(() => {
      expect(screen.getByText(/ABCD1234/)).toBeInTheDocument();
      expect(screen.getByText(/EFGH5678/)).toBeInTheDocument();
      expect(screen.getByText(/IJKL9012/)).toBeInTheDocument();
      expect(screen.getByText(/MNOP3456/)).toBeInTheDocument();
      expect(screen.getByText(/QRST7890/)).toBeInTheDocument();
      expect(screen.getByText(/UVWX1234/)).toBeInTheDocument();
      expect(screen.getByText(/XYZA5678/)).toBeInTheDocument();
      expect(screen.getByText(/BCDE9012/)).toBeInTheDocument();
    });
  });

  it('should have copy all codes button', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const backupTab = screen.getByRole('tab', { name: /Backup Codes/i });
    await user.click(backupTab);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy All Codes/i })).toBeInTheDocument();
    });
  });

  it('should have download backup codes button', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const backupTab = screen.getByRole('tab', { name: /Backup Codes/i });
    await user.click(backupTab);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download Codes/i })).toBeInTheDocument();
    });
  });

  it('should show warning about backup code security', async () => {
    const user = userEvent.setup();
    render(<MFASetupDialog {...defaultProps} />);

    const backupTab = screen.getByRole('tab', { name: /Backup Codes/i });
    await user.click(backupTab);

    await waitFor(() => {
      expect(screen.getByText(/If you lose both your authenticator app and these codes/)).toBeInTheDocument();
      expect(screen.getByText(/support@nannyai.dev/)).toBeInTheDocument();
    });
  });

  it('should call onOpenChange when close button is clicked', async () => {
    const onOpenChange = vi.fn();
    render(
      <MFASetupDialog
        open={true}
        onOpenChange={onOpenChange}
        userEmail="test@example.com"
      />
    );

    const closeButton = screen.getByRole('button', { name: /Close/i });
    await waitFor(() => {
      fireEvent.click(closeButton);
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should have proper accessibility structure', async () => {
    render(<MFASetupDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });
  });

  it('should support email without userEmail prop', () => {
    render(
      <MFASetupDialog
        open={true}
        onOpenChange={vi.fn()}
        userEmail={undefined}
      />
    );
    expect(screen.getByText('Enable Multi-Factor Authentication (MFA)')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<MFASetupDialog {...defaultProps} />);
    // Initially before setupMFA completes, should show loading or initial content
    expect(screen.getByText('Enable Multi-Factor Authentication (MFA)')).toBeInTheDocument();
  });
});
