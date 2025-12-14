import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';
import { updatePassword } from '@/services/authService';
import { validatePassword, getPasswordRequirements } from '@/utils/passwordValidator';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordValidation = validatePassword(newPassword);
  
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isFormValid = passwordValidation.isValid && passwordsMatch && newPassword && confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || 'Password does not meet requirements');
      return;
    }

    setLoading(true);
    try {
      // Call the Supabase auth update password method with current password verification
      const { error } = await updatePassword(newPassword, currentPassword);

      if (error) {
        setError(error.message || 'Failed to change password');
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetForm();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update your password to keep your account secure. Your password must meet all the requirements listed below.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Password Changed Successfully!</h3>
            <p className="text-sm text-muted-foreground">Your password has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Requirements</h4>
              <ul className="space-y-1">
                {getPasswordRequirements().map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs">
                    {newPassword && passwordValidation.requirements[
                      Object.keys(passwordValidation.requirements)[index] as keyof typeof passwordValidation.requirements
                    ] ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 border border-blue-300 rounded-full flex-shrink-0" />
                    )}
                    <span className={newPassword && passwordValidation.requirements[
                      Object.keys(passwordValidation.requirements)[index] as keyof typeof passwordValidation.requirements
                    ] ? 'text-green-700' : 'text-blue-700'}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !isFormValid}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
