import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, Key, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { useToast } from '@/hooks/use-toast';
import { verifyMFALogin, verifyBackupCode, getCurrentUser, getMFAFactors, createMFAChallenge } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MFAVerification = () => {
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [verifyingTotp, setVerifyingTotp] = useState(false);
  const [verifyingBackup, setVerifyingBackup] = useState(false);
  const [totpError, setTotpError] = useState('');
  const [backupError, setBackupError] = useState('');
  const [totpVerified, setTotpVerified] = useState(false);
  const [backupVerified, setBackupVerified] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState<number | null>(null);
  const [showBackupCodeInfo, setShowBackupCodeInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('totp');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize MFA: check auth, get factors, create challenge
    const initMFA = async () => {
      try {
        setLoading(true);
        setInitError(null);

        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Get MFA factors
        const factors = await getMFAFactors();
        if (!factors || factors.length === 0) {
          // No MFA factors - user shouldn't be here
          navigate('/dashboard');
          return;
        }

        const factor = factors[0];
        setFactorId(factor.id);

        // Create a challenge for this factor
        const { data: challengeData, error: challengeError } = await createMFAChallenge(factor.id);
        if (challengeError || !challengeData?.challengeId) {
          setInitError('Failed to create MFA challenge. Please try logging in again.');
          return;
        }

        setChallengeId(challengeData.challengeId);
      } catch {
        setInitError('Failed to initialize MFA verification. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    initMFA();
  }, [navigate]);

  const handleTotpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(value);
    setTotpError('');
  };

  const handleBackupCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setBackupCode(value);
    setBackupError('');
  };

  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setTotpError('Please enter a valid 6-digit code');
      return;
    }

    if (!factorId || !challengeId) {
      setTotpError('MFA session expired. Please login again.');
      navigate('/login');
      return;
    }

    setVerifyingTotp(true);
    setTotpError('');

    try {
      // Verify the TOTP code with factor_id and challenge_id
      const { data, error } = await verifyMFALogin(totpCode, challengeId, factorId);

      if (error) {
        setTotpError(error.message || 'Invalid TOTP code. Please try again.');
        return;
      }

      if (data?.valid) {
        setTotpVerified(true);
        toast({
          title: 'Success',
          description: 'TOTP verified successfully!',
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setTotpError('Invalid TOTP code. Please try again.');
      }
    } catch {
      setTotpError('Failed to verify TOTP. Please try again.');
    } finally {
      setVerifyingTotp(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (!backupCode.trim()) {
      setBackupError('Please enter a backup code');
      return;
    }

    if (!factorId || !challengeId) {
      setBackupError('MFA session expired. Please login again.');
      navigate('/login');
      return;
    }

    setVerifyingBackup(true);
    setBackupError('');

    try {
      // Verify backup code with factor_id and challenge_id
      const { data, error } = await verifyBackupCode(backupCode, challengeId, factorId);

      if (error) {
        setBackupError(error.message || 'Invalid or already used backup code. Please try again.');
        return;
      }

      if (data?.valid) {
        setBackupVerified(true);
        setRemainingCodes(data.remaining ?? null);
        toast({
          title: 'Success',
          description: 'Backup code verified successfully!',
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setBackupError('Invalid backup code');
      }
    } catch {
      setBackupError('Failed to verify backup code. Please try again.');
    } finally {
      setVerifyingBackup(false);
    }
  };

  const handleTotpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && totpCode.length === 6) {
      handleVerifyTotp();
    }
  };

  const handleBackupKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && backupCode.trim()) {
      handleVerifyBackupCode();
    }
  };

  const handleRetryLogin = () => {
    navigate('/login');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <GlassMorphicCard className="w-full max-w-md mx-auto">
            <div className="py-8 px-4 sm:px-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Preparing MFA verification...</p>
            </div>
          </GlassMorphicCard>
        </main>
      </div>
    );
  }

  // Show error state
  if (initError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <GlassMorphicCard className="w-full max-w-md mx-auto">
            <div className="py-8 px-4 sm:px-6 text-center">
              <div className="bg-red-100 rounded-full p-4 mx-auto w-fit mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold mb-2">MFA Verification Error</h2>
              <p className="text-muted-foreground mb-4">{initError}</p>
              <Button onClick={handleRetryLogin}>Return to Login</Button>
            </div>
          </GlassMorphicCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-20 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(100, 116, 255, 0.4), rgba(100, 116, 255, 0.05))',
        }}
      />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <GlassMorphicCard className="w-full mx-auto">
            <div className="py-8 px-4 sm:px-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <h1 className="text-2xl font-bold text-center mb-2">
                  Two-Factor Authentication
                </h1>
                <p className="text-center text-muted-foreground mb-6">
                  Enter your authenticator code or use a backup code to verify your identity
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="totp">Authenticator</TabsTrigger>
                    <TabsTrigger value="backup">Backup Code</TabsTrigger>
                  </TabsList>

                  <TabsContent value="totp" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Enter 6-digit code
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        value={totpCode}
                        onChange={handleTotpInputChange}
                        onKeyPress={handleTotpKeyPress}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        disabled={verifyingTotp}
                      />
                      {totpError && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {totpError}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleVerifyTotp}
                      disabled={totpCode.length !== 6 || verifyingTotp || totpVerified}
                      className="w-full"
                      size="lg"
                    >
                      {verifyingTotp ? 'Verifying...' : totpVerified ? 'Verified ✓' : 'Verify'}
                    </Button>

                    {totpVerified && (
                      <div className="flex items-center gap-2 text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Authentication successful! Redirecting...
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground text-center mt-4">
                      <p>Can't access your authenticator app?</p>
                      <button
                        onClick={() => setActiveTab('backup')}
                        className="text-primary hover:underline font-medium mt-1"
                      >
                        Use backup code instead
                      </button>
                    </div>
                  </TabsContent>

                  <TabsContent value="backup" className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex gap-2">
                        <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-blue-900">Using Backup Codes</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Backup codes are one-time use only. Each code can only be used once for authentication.
                          </p>
                          {remainingCodes !== null && (
                            <p className="text-xs text-blue-700 mt-2 font-semibold">
                              {remainingCodes} codes remaining
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Enter backup code
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., ABC12345"
                        value={backupCode}
                        onChange={handleBackupCodeInputChange}
                        onKeyPress={handleBackupKeyPress}
                        className="font-mono"
                        disabled={verifyingBackup}
                      />
                      {backupError && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {backupError}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleVerifyBackupCode}
                      disabled={!backupCode.trim() || verifyingBackup || backupVerified}
                      className="w-full"
                      size="lg"
                    >
                      {verifyingBackup ? 'Verifying...' : backupVerified ? 'Verified ✓' : 'Verify'}
                    </Button>

                    {backupVerified && (
                      <div className="flex items-center gap-2 text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Authentication successful! Redirecting...
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground text-center mt-4">
                      <button
                        onClick={() => setShowBackupCodeInfo(!showBackupCodeInfo)}
                        className="text-primary hover:underline font-medium"
                      >
                        {showBackupCodeInfo ? 'Hide' : 'Show'} Help
                      </button>
                    </div>

                    {showBackupCodeInfo && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-2 mt-4">
                        <p className="font-medium">💡 How to use backup codes:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-1">
                          <li>Enter any of your backup codes above</li>
                          <li>Codes are formatted like: ABC12345</li>
                          <li>Each code can only be used once</li>
                          <li>Keep remaining codes in a safe place</li>
                        </ol>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 pt-6 border-t"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-red-900 mb-2">
                        Lost access to both authenticator and backup codes?
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        If you've lost both your authenticator app and all backup codes, you'll need to contact our support team to regain access to your account.
                      </p>
                      <a
                        href="mailto:support@nannyai.dev"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 hover:text-red-800 underline"
                      >
                        <Lock className="w-4 h-4" />
                        Contact support@nannyai.dev
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </GlassMorphicCard>
        </div>
      </main>
    </div>
  );
};

export default MFAVerification;
