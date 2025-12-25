
import React, { useState, useEffect } from 'react';
import { User, Mail, Github, Calendar, Clock, CheckCircle, XCircle, Key, Shield, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { MFASetupDialog } from '@/components/MFASetupDialog';
import { DisableMFADialog } from '@/components/DisableMFADialog';
import withAuth from '@/utils/withAuth';
import { getCurrentUser, getCurrentSession, isMFAEnabled } from '@/services/authService';
import type { UserRecord } from '@/integrations/pocketbase/types';

const Account = () => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isMFASetupOpen, setIsMFASetupOpen] = useState(false);
  const [isDisableMFAOpen, setIsDisableMFAOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    // Fetch user and session data from PocketBase
    const fetchAccountData = async () => {
      setLoading(true);
      try {
        const [currentUser, currentToken, mfaStatus] = await Promise.all([
          getCurrentUser(),
          getCurrentSession(),
          isMFAEnabled()
        ]);

        if (currentUser && currentToken) {
          setUser(currentUser);
          setToken(currentToken);
          setMfaEnabled(mfaStatus);
          setHasError(false);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error fetching user data from PocketBase:", error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccountData();
  }, []);

  const handleMFASetupSuccess = async () => {
    // Refresh user data and MFA status to get updated status
    try {
      const [currentUser, mfaStatus] = await Promise.all([
        getCurrentUser(),
        isMFAEnabled()
      ]);
      if (currentUser) {
        setUser(currentUser);
        setMfaEnabled(mfaStatus);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Helper functions to format data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'User';
  const provider = 'email'; // PocketBase doesn't have provider metadata yet

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <TransitionWrapper className="flex-1 p-6">
              <div className="container pb-8">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading account data...</p>
                </div>
              </div>
            </div>
          </TransitionWrapper>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper className="flex-1 p-6">
            <div className="container pb-8">
              {hasError && (
                <ErrorBanner 
                  message="There was an issue loading your profile information. Some data may not be current."
                  onDismiss={() => setHasError(false)}
                />
              )}
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Account</h1>
              <p className="text-muted-foreground mt-2">
                View your profile and authentication details.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <GlassMorphicCard className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  
                  <h2 className="mt-4 text-xl font-semibold">{displayName}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  
                  <div className="mt-6 py-4 border-t border-b border-border/40">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="capitalize">Email</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-left space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-xs">{user?.id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Email Verified:</span>
                      {user?.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </GlassMorphicCard>
                
                <GlassMorphicCard className="mt-6">
                  <h3 className="font-medium mb-4">Account Timeline</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-xs text-muted-foreground">{formatDate(user?.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Sign In</p>
                        <p className="text-xs text-muted-foreground">{formatDate(user?.last_sign_in_at)}</p>
                      </div>
                    </div>
                    {user?.email_confirmed_at && (
                      <div className="flex items-start">
                        <Mail className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Email Confirmed</p>
                          <p className="text-xs text-muted-foreground">{formatDate(user?.email_confirmed_at)}</p>
                        </div>
                      </div>
                    )}
                    {user?.phone && (
                      <div className="flex items-start">
                        <Smartphone className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Phone Number</p>
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                          {user?.phone_confirmed_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Confirmed: {formatDate(user.phone_confirmed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassMorphicCard>
              </div>
              
              <div className="lg:col-span-2">
                <GlassMorphicCard>
                  <h3 className="font-medium mb-6">User Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-sm">{displayName}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Email Address
                      </label>
                      <p className="text-sm">{user?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-sm">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Authentication Provider
                      </label>
                      <p className="text-sm capitalize">{provider}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Account Created
                      </label>
                      <p className="text-sm">{formatDate(user?.created_at)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Last Sign In
                      </label>
                      <p className="text-sm">{formatDate(user?.last_sign_in_at)}</p>
                    </div>
                    {user?.email_confirmed_at && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Email Confirmed At
                        </label>
                        <p className="text-sm">{formatDate(user.email_confirmed_at)}</p>
                      </div>
                    )}
                    {user?.phone_confirmed_at && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Phone Confirmed At
                        </label>
                        <p className="text-sm">{formatDate(user.phone_confirmed_at)}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        User ID
                      </label>
                      <p className="text-xs font-mono break-all">{user?.id}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Role (App Metadata)
                      </label>
                      <p className="text-sm">{user?.role || 'authenticated'}</p>
                    </div>
                  </div>
                </GlassMorphicCard>
                
                <GlassMorphicCard className="mt-6">
                  <h3 className="font-medium mb-6">Current Session</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Access Token (Last 20 chars)
                        </label>
                        <p className="text-xs font-mono break-all">
                          ...{token ? token.slice(-20) : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Token Type
                        </label>
                        <p className="text-sm">Bearer</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Token Status
                        </label>
                        <div className="flex items-center">
                          {token ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-sm">Not Active</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard className="mt-6">
                  <h3 className="font-medium mb-6">Security & Authentication</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Multi-Factor Authentication (MFA)</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mfaEnabled ? 'MFA is enabled on your account' : 'Add an extra layer of security to your account'}
                            </p>
                          </div>
                          <div className="ml-4 flex gap-2">
                            {mfaEnabled ? (
                              <button onClick={() => setIsDisableMFAOpen(true)} className="py-1.5 px-4 text-sm border border-red-300 rounded-md text-red-600 hover:bg-red-50 transition-colors">
                                Disable MFA
                              </button>
                            ) : (
                              <button onClick={() => setIsMFASetupOpen(true)} className="py-1.5 px-4 text-sm border border-primary rounded-md text-primary hover:bg-primary/10 transition-colors">
                                Enable MFA
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {provider === 'email' && (
                      <div className="border-t border-border/40 pt-6 flex items-start">
                        <div className="flex-shrink-0">
                          <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Password</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Update your password to keep your account secure
                              </p>
                            </div>
                            <button onClick={() => setIsChangePasswordOpen(true)} className="ml-4 py-1.5 px-4 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors">
                              Change Password
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-border/40 pt-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium">Email Verification</h4>
                          <div className="flex items-center mt-2">
                            {user?.email_confirmed_at ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm text-muted-foreground">
                                  Email verified on {formatDate(user.email_confirmed_at)}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-yellow-500 mr-2" />
                                <span className="text-sm text-muted-foreground">Email not verified</span>
                                <button className="ml-4 text-sm text-primary hover:underline">
                                  Resend verification email
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {user?.phone && (
                      <div className="border-t border-border/40 pt-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium">Phone Verification</h4>
                            <div className="flex items-center mt-2">
                              {user?.phone_confirmed_at ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="text-sm text-muted-foreground">
                                    Phone verified on {formatDate(user.phone_confirmed_at)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-yellow-500 mr-2" />
                                  <span className="text-sm text-muted-foreground">Phone not verified</span>
                                  <button className="ml-4 text-sm text-primary hover:underline">
                                    Verify phone number
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </GlassMorphicCard>
              </div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
      </div>
      <Footer />

      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen}
      />

      <MFASetupDialog 
        open={isMFASetupOpen} 
        onOpenChange={setIsMFASetupOpen}
        userEmail={user?.email}
        onSuccess={handleMFASetupSuccess}
      />

      <DisableMFADialog
        open={isDisableMFAOpen}
        onOpenChange={setIsDisableMFAOpen}
        onSuccess={handleMFASetupSuccess}
      />
    </div>
  );
};

const AccountPage = withAuth(Account);
export default AccountPage;
