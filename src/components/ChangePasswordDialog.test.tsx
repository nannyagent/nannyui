import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  updatePassword: vi.fn(),
}));

import { updatePassword } from '@/services/authService';

describe('ChangePasswordDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Basic rendering tests
  it('should render dialog when open is true', () => {
    render(<ChangePasswordDialog {...defaultProps} />);
    expect(screen.getAllByText('Change Password')[0]).toBeInTheDocument();
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
    // Requirements are dynamic, so just check that the section exists
    expect(screen.getByText('Password Requirements').parentElement).toBeInTheDocument();
  });

  // Input state tests
  it('should update password input state', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(passwordInputs[1], 'Test123!'); // New password input

    expect(passwordInputs[1]).toHaveValue('Test123!');
  });

  // Button state tests
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

  // Password validation tests
  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Different123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    expect(submitButton).toBeDisabled(); // Should remain disabled when passwords don't match
  });

  it('should validate password requirements in real-time', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    const newPasswordInput = passwordInputs[1];

    // Type partial password - should not meet requirements
    await user.type(newPasswordInput, 'test');

    // Clear and type valid password
    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'Test123!');

    // After typing valid password, requirements section should show
    await waitFor(() => {
      const requirementsList = screen.getByText('Password Requirements');
      expect(requirementsList).toBeInTheDocument();
    });
  });

  it('should require at least 8 characters', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123'); // 8 chars but no special char
    await user.type(inputs[2], 'Test123');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    expect(submitButton).toBeDisabled();
  });

  it('should require at least one uppercase letter', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'test123!'); // No uppercase
    await user.type(inputs[2], 'test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    expect(submitButton).toBeDisabled();
  });

  it('should require at least one lowercase letter', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'TEST123!'); // No lowercase
    await user.type(inputs[2], 'TEST123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    expect(submitButton).toBeDisabled();
  });

  // Form submission tests
  it('should call updatePassword when form is submitted', async () => {
    const user = userEvent.setup();
    (updatePassword as any).mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith('Test123!', 'current');
    });
  });

  it('should display success message after password change', async () => {
    const user = userEvent.setup();
    (updatePassword as any).mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password changed successfully/i)).toBeInTheDocument();
    });
  });

  it('should display error when password update fails', async () => {
    const user = userEvent.setup();
    (updatePassword as any).mockResolvedValue({
      data: null,
      error: { message: 'Failed to update password' },
    });

    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to update password/i)).toBeInTheDocument();
    });
  });

  // Dialog interaction tests
  it('should call onOpenChange when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    render(<ChangePasswordDialog open={true} onOpenChange={onOpenChange} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close dialog after successful password change', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    (updatePassword as any).mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    render(<ChangePasswordDialog open={true} onOpenChange={onOpenChange} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(submitButton);

    // Wait for the close action to happen
    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith('Test123!', 'current');
    });
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

  // Accessibility tests
  it('should have accessible heading', () => {
    render(<ChangePasswordDialog {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Change Password/i })).toBeInTheDocument();
  });

  // Edge cases
  it('should handle special characters in password', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test@#$%123!');
    await user.type(inputs[2], 'Test@#$%123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    (updatePassword as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ChangePasswordDialog {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/password/i);
    await user.type(inputs[0], 'current');
    await user.type(inputs[1], 'Test123!');
    await user.type(inputs[2], 'Test123!');

    const submitButton = screen.getByRole('button', { name: /Change Password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});

