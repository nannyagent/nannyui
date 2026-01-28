import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Copy, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { setupMFA, verifyTOTPCode } from '@/services/authService';
import QRCode from 'qrcode';
import { Input } from '@/components/ui/input';

interface MFASetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  onSuccess?: () => Promise<void>;
}

interface MFASetupData {
  factorId: string;
  secret: string;
  backupCodes: string[];
  qrUrl: string;
  qrCode?: string;
}

export const MFASetupDialog: React.FC<MFASetupDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaData, setMFAData] = useState<MFASetupData | null>(null);
  const [qrCodeUrl, setQRCodeUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('instructions');
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [verifyingTotp, setVerifyingTotp] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpVerified, setTotpVerified] = useState(false);

  useEffect(() => {
    const generateMFASetup = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await setupMFA();

        if (error) {
          setError(error.message || 'Failed to setup MFA');
          return;
        }

        // Map the API response to our interface
        const setupData: MFASetupData = {
          factorId: data.factorId || '',
          secret: data.secret || '',
          backupCodes: data.backupCodes || [],
          qrUrl: data.qrUrl || '',
          qrCode: data.qrCode,
        };
        setMFAData(setupData);

        // Generate QR code from the TOTP URI, or use the pre-generated one
        try {
          // If backend provides a base64 QR code, use it directly
          if (setupData.qrCode) {
            setQRCodeUrl(setupData.qrCode);
          } else if (setupData.qrUrl) {
              const qrUrl = await QRCode.toDataURL(setupData.qrUrl, {
              width: 200,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });
            setQRCodeUrl(qrUrl);
          }
        } catch {
          // Still proceed even if QR code generation fails
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (open && !mfaData) {
      generateMFASetup();
    }
  }, [open, mfaData]);

  const copyToClipboard = (text: string, codeId?: string) => {
    navigator.clipboard.writeText(text);
    if (codeId) {
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const copyAllBackupCodes = () => {
    if (mfaData?.backupCodes) {
      const codesText = mfaData.backupCodes.join('\n');
      copyToClipboard(codesText);
      setBackupCodesCopied(true);
      setTimeout(() => setBackupCodesCopied(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (mfaData?.backupCodes) {
      const content = `NannyAI Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${mfaData.backupCodes.join('\n')}\n\nKeep these codes in a safe place. Each code can be used once if you lose access to your authenticator app.`;
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', 'nannyai_mfa_backup_codes.txt');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const verifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setTotpError('Please enter a valid 6-digit code');
      return;
    }

    if (!mfaData?.factorId) {
      setTotpError('MFA setup incomplete. Please try again.');
      return;
    }

    setVerifyingTotp(true);
    setTotpError(null);

    try {
      // Verify the TOTP code with the factor ID
      const { data, error } = await verifyTOTPCode(totpCode, mfaData.factorId);

      if (error) {
        setTotpError(error.message || 'Invalid TOTP code. Please try again.');
        return;
      }

      if (data?.valid) {
        // Update mfaData with backup codes from the verify response
        if (data.backupCodes && data.backupCodes.length > 0) {
          setMFAData(prev => prev ? {
            ...prev,
            backupCodes: data.backupCodes,
          } : null);
        }

        setTotpVerified(true);
        setTotpCode('');
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          await onSuccess();
        }
      } else {
        setTotpError('Invalid TOTP code. Please check and try again.');
      }
    } catch (err) {
      setTotpError(err instanceof Error ? err.message : 'An error occurred while verifying the code');
    } finally {
      setVerifyingTotp(false);
    }
  };

  const handleTotpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(value);
    if (value.length !== 6) {
      setTotpError(null);
    }
  };

  const handleTotpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && totpCode.length === 6) {
      verifyTOTP();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
      setMFAData(null);
      setQRCodeUrl('');
      setCopiedCode(null);
      setActiveTab('instructions');
      setBackupCodesCopied(false);
      setTotpCode('');
      setTotpError(null);
      setTotpVerified(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Enable Multi-Factor Authentication (MFA)
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account using an authenticator app
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && !mfaData ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Setting up MFA...</p>
          </div>
        ) : mfaData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
              <TabsTrigger value="verify">Verify</TabsTrigger>
              <TabsTrigger value="backup">Backup Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold text-blue-900">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Download an Authenticator App</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Download one of these free authenticator apps on your phone:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                      <li>Google Authenticator (iOS/Android)</li>
                      <li>Microsoft Authenticator (iOS/Android)</li>
                      <li>Authy (iOS/Android)</li>
                      <li>FreeOTP (iOS/Android)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold text-blue-900">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Scan QR Code</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Open your authenticator app and scan the QR code shown in the "QR Code" tab, or manually enter the secret key.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold text-blue-900">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Save Backup Codes</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Save your backup codes in a secure location. Each code can be used once if you lose access to your authenticator app.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-semibold text-yellow-900 mb-1">Important Security Notes</h4>
                      <ul className="text-yellow-800 space-y-1 ml-4 list-disc">
                        <li>Store backup codes securely (NOT on your computer)</li>
                        <li>If you lose access to both your authenticator app AND backup codes, contact support@nannyai.dev</li>
                        <li>Keep your authenticator app secure and don't share it with anyone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Use your authenticator app to scan this QR code. If you can't scan it, you can manually enter the secret key below.
                  </p>
                </div>

                {qrCodeUrl ? (
                  <div className="flex justify-center p-4 bg-white border border-border rounded-lg">
                    <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="flex justify-center p-4 bg-gray-100 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">QR Code could not be generated</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Secret Key (Manual Entry)</label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
                      {mfaData.secret || 'Secret not available - please use QR code'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => mfaData.secret && copyToClipboard(mfaData.secret, 'secret')}
                      className="flex-shrink-0"
                      disabled={!mfaData.secret}
                    >
                      {copiedCode === 'secret' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verify" className="space-y-4 py-4">
              <div className="space-y-4">
                {!totpVerified ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Enter the 6-digit code from your authenticator app to verify and complete MFA setup.
                      </p>
                    </div>

                    {totpError && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{totpError}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">6-Digit Code</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        value={totpCode}
                        onChange={handleTotpInputChange}
                        onKeyPress={handleTotpKeyPress}
                        className="text-center text-2xl tracking-widest font-mono"
                        disabled={verifyingTotp}
                      />
                      <p className="text-xs text-muted-foreground">
                        {totpCode.length}/6 digits entered
                      </p>
                    </div>

                    <Button
                      onClick={verifyTOTP}
                      disabled={totpCode.length !== 6 || verifyingTotp}
                      className="w-full"
                    >
                      {verifyingTotp ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify & Enable MFA
                        </>
                      )}
                    </Button>

                    <div className="bg-gray-50 border border-border rounded-md p-3">
                      <p className="text-xs text-muted-foreground">
                        <strong>Tip:</strong> If your authenticator app shows a different code, wait a few seconds for it to update. Each code is only valid for 30 seconds.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-green-100 rounded-full p-4 mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-green-900 mb-1">MFA Successfully Enabled</h4>
                    <p className="text-sm text-green-700 text-center">
                      Your account is now protected with multi-factor authentication. You'll be asked to enter a code from your authenticator app when you sign in.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4 py-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-semibold text-red-900 mb-1">Backup Codes Are Critical</h4>
                    <p className="text-red-800 mb-2">
                      Save these codes in a safe, offline location. Each code can only be used once and will grant access to your account if you lose your authenticator.
                    </p>
                    <p className="text-red-800 font-semibold">
                      If you lose both your authenticator app and these codes, contact support@nannyai.dev to regain access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {mfaData.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-100 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => copyToClipboard(code, `code-${index}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{code}</span>
                      {copiedCode === `code-${index}` && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={copyAllBackupCodes}
                  className="flex-1"
                >
                  {backupCodesCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      All Codes Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All Codes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={downloadBackupCodes}>
                  Download Codes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || verifyingTotp}
            className="flex-1"
          >
            {totpVerified ? 'Close' : 'Cancel'}
          </Button>
          {mfaData && totpVerified && (
            <Button disabled className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              MFA Enabled Successfully
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
