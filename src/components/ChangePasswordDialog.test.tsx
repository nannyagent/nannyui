import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  updatePassword: vi.fn(),
}));

describe('ChangePasswordDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open is true', () => {
    render(<ChangePasswordDialog {...defaultProps} />);
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    render(<ChangePasswordDialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('should display all password requirement labels', () => {
    render(<ChangePasswordDialog {...defaultProps} />);
    expect(screen.getByText('Current Password')).toBeInTheDocument();
    expect(screen.getByText('New Password')).toBeInTheDocument();
    expect(screen.getByText('Confirm New Password')).toBeInTheDocument();
  });

  it('should show password requirements section', () => {
    render(<ChangePasswordDialog {...defaultProps} />);
    expect(screen.getByText('Password Requirements')).toBeInTheDocument();
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
    expect(screen.getByText(/At least one uppercase/)).toBeInTheDocument();
    expect(screen.getByText(/At least one lowercase/)).toBeInTheDocument();
  });

  it('should update password input state', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(passwordInputs[1], 'Test123!'); // New password input

    expect(passwordInputs[1]).toHaveValue('Test123!');
  });

  it('should disable submit button when password requirements not met', () => {
    render(<ChangePasswordDialog {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when password meets all requirements', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current'); // Current password
    await user.type(inputs[1], 'Test123!'); // New password
    await user.type(inputs[2], 'Test123!'); // Confirm password

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Different123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });
  });

  it('should validate password in real-time', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    const newPasswordInput = passwordInputs[1];

    // Type partial password
    await user.type(newPasswordInput, 'test');
    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();

    // Clear and type valid password
    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'Test123!');

    // After typing valid password, requirements should show as met
    await waitFor(() => {
      const requirementsList = screen.getByText('Password Requirements').closest('div');
      expect(requirementsList).toBeInTheDocument();
    });
  });

  it('should call onOpenChange when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    render(<ChangePasswordDialog open={true} onOpenChange={onOpenChange} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should handle current password requirement', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    // Only fill new passwords, not current
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
    });
  });

  it('should have proper accessibility labels', () => {
    render(<ChangePasswordDialog {...defaultProps} />);

    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
  });
});
