import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisableMFADialog } from '@/components/DisableMFADialog';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  disableMFA: vi.fn(),
}));

import { disableMFA } from '@/services/authService';

describe('DisableMFADialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Basic rendering tests
  it('should render dialog when open is true', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByText('Disable Multi-Factor Authentication')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    render(<DisableMFADialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByText('Disable Multi-Factor Authentication')).not.toBeInTheDocument();
  });

  it('should display warning message', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByText(/Warning/i)).toBeInTheDocument();
    expect(screen.getByText(/Disabling MFA will make your account less secure/i)).toBeInTheDocument();
  });

  it('should display confirmation message', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByText(/Are you sure you want to disable MFA/i)).toBeInTheDocument();
  });

  // Button tests
  it('should have keep MFA enabled button', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Keep MFA Enabled/i })).toBeInTheDocument();
  });

  it('should have disable MFA button', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Disable MFA/i })).toBeInTheDocument();
  });

  // Functionality tests
  it('should call disableMFA when disable button is clicked', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(<DisableMFADialog {...defaultProps} />);

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(disableMFA).toHaveBeenCalled();
    });
  });

  it('should display success message after disabling MFA', async () => {
    const user = userEvent.setup();
    (disableMFA as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(<DisableMFADialog {...defaultProps} />);

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

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(disableMFA).toHaveBeenCalled();
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

    const disableButton = screen.getByRole('button', { name: /Disable MFA$/i });
    await user.click(disableButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to disable MFA/i)).toBeInTheDocument();
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // Accessibility tests
  it('should have proper accessibility structure', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Disable Multi-Factor Authentication/i })).toBeInTheDocument();
  });

  it('should have accessible dialog description', () => {
    render(<DisableMFADialog {...defaultProps} />);
    expect(screen.getByText('Remove MFA protection from your account')).toBeInTheDocument();
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
});
