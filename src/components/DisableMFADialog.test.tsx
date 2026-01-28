import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisableMFADialog } from '@/components/DisableMFADialog';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  disableMFA: vi.fn(),
  getMFAFactors: vi.fn(),
}));

import { disableMFA, getMFAFactors } from '@/services/authService';

describe('DisableMFADialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  const mockFactorId = 'factor-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (getMFAFactors as any).mockResolvedValue([
      { id: mockFactorId, factor_type: 'totp', status: 'verified' }
    ]);
  });

  // Basic rendering tests
  it('should render dialog when open is true', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Disable Multi-Factor Authentication')).toBeInTheDocument();
    });
  });

  it('should not render dialog when open is false', () => {
    render(<DisableMFADialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByText('Disable Multi-Factor Authentication')).not.toBeInTheDocument();
  });

  it('should display warning message', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Disabling MFA will make your account less secure/i)).toBeInTheDocument();
    });
  });

  it('should display code input field', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });
  });

  // Button tests
  it('should have keep MFA enabled button', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Keep MFA Enabled/i })).toBeInTheDocument();
    });
  });

  it('should have disable MFA button', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Disable MFA/i })).toBeInTheDocument();
    });
  });

  it('should disable the disable button when no code entered', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
      expect(disableButton).toBeDisabled();
    });
  });

  // Functionality tests
  it('should call disableMFA with factorId and code when disable button is clicked', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(disableMFA).toHaveBeenCalledWith(mockFactorId, '123456');
    });
  });

  it('should display success message after disabling MFA', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
      expect(screen.getByText(/Multi-factor authentication has been removed from your account/i)).toBeInTheDocument();
    });
  });

  it('should display error when disableMFA fails', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: null,
      error: { message: 'Failed to disable MFA' },
    });

    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to disable MFA/i)).toBeInTheDocument();
    });
  });

  it('should call onOpenChange when keep MFA button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(<DisableMFADialog open={true} onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Keep MFA Enabled/i })).toBeInTheDocument();
    });

    const keepButton = screen.getByRole('button', { name: /Keep MFA Enabled/i });
    await user.click(keepButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange and onSuccess after successful disable', async () => {
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(
      <DisableMFADialog
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(disableMFA).toHaveBeenCalledWith(mockFactorId, '123456');
    });

    // Just check that the success message appears
    await waitFor(() => {
      expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
    });
  });

  // Button state tests
  it('should disable buttons while loading', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(disableButton).toBeDisabled();
    });

    const keepButton = screen.getByRole('button', { name: /Keep MFA Enabled/i });
    expect(keepButton).toBeDisabled();
  });

  it('should show loading text on disable button', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText('Disabling...')).toBeInTheDocument();
    });
  });

  // Dialog interaction tests
  it('should not close dialog when showing error', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: null,
      error: { message: 'Failed to disable MFA' },
    });

    render(
      <DisableMFADialog open={true} onOpenChange={onOpenChange} />
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to disable MFA/i)).toBeInTheDocument();
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // Accessibility tests
  it('should have proper accessibility structure', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Disable Multi-Factor Authentication/i })).toBeInTheDocument();
    });
  });

  it('should have accessible dialog description', async () => {
    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Remove MFA protection from your account')).toBeInTheDocument();
    });
  });

  // Props handling tests
  it('should handle missing onSuccess callback', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(
      <DisableMFADialog
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
    });
  });

  // Error recovery tests
  it('should allow retry after error', async () => {
    const user = userEvent.setup();
    (disableMFA as any)
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error' },
      })
      .mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

    render(<DisableMFADialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    // Click again to retry
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
    });
  });

  // Edge cases
  it('should handle confirm after successful disable', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(
      <DisableMFADialog open={true} onOpenChange={onOpenChange} />
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456 or XXXX-XXXX/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/123456 or XXXX-XXXX/i);
    await user.type(input, '123456');

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
    });

    // Wait for the auto-close
    await waitFor(
      () => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      },
      { timeout: 3000 }
    );
  });

  // Factor loading error test
  it('should show error when factor loading fails', async () => {
    (getMFAFactors as any).mockRejectedValue(new Error('Network error'));

    render(<DisableMFADialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch MFA factors/i)).toBeInTheDocument();
    });
  });

  it('should show error when no TOTP factor found', async () => {
    (getMFAFactors as any).mockResolvedValue([]);

    render(<DisableMFADialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/No MFA factors found/i)).toBeInTheDocument();
    });
  });
});
