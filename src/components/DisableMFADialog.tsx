import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { disableMFA } from '@/services/authService';

interface DisableMFADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DisableMFADialog: React.FC<DisableMFADialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleDisableMFA = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: disableError } = await disableMFA();

      if (disableError) {
        setError(disableError.message || 'Failed to disable MFA');
        return;
      }

      setConfirmed(true);
      
      // Wait a moment before closing to show success message
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        // Reset state when closing
        setTimeout(() => {
          setConfirmed(false);
          setError(null);
        }, 300);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading && !confirmed) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disable Multi-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Remove MFA protection from your account
          </DialogDescription>
        </DialogHeader>

        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-red-100 rounded-full p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-red-900 mb-1">MFA Disabled</h4>
            <p className="text-sm text-red-700 text-center">
              Multi-factor authentication has been removed from your account. Your account is now less secure.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-semibold text-yellow-900 mb-2">Warning</h4>
                  <p className="text-yellow-800 mb-2">
                    Disabling MFA will make your account less secure. Anyone who gains access to your password could compromise your account.
                  </p>
                  <p className="text-yellow-800 font-semibold">
                    Are you sure you want to disable MFA?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Keep MFA Enabled
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisableMFA}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Disabling...
                  </>
                ) : (
                  'Disable MFA'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
