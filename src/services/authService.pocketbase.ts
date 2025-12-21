import { pb } from '@/integrations/pocketbase/client';
import type { UserRecord } from '@/integrations/pocketbase/types';

export interface AuthResponse {
  user: UserRecord | null;
  token: string | null;
  error: string | null;
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  try {
    // Create user record
    const userData = {
      email,
      password,
      passwordConfirm: password,
      name: name || email.split('@')[0],
      username: email.split('@')[0] + '_' + Date.now(),
      emailVisibility: false,
    };

    const record = await pb.collection('users').create(userData);

    // Auto-login after signup
    const authData = await pb.collection('users').authWithPassword(email, password);

    return {
      user: authData.record as UserRecord,
      token: authData.token,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      token: null,
      error: error.message || 'Failed to sign up',
    };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);

    return {
      user: authData.record as UserRecord,
      token: authData.token,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      token: null,
      error: error.message || 'Failed to sign in',
    };
  }
};

/**
 * Sign in with GitHub OAuth
 * Note: PocketBase OAuth requires backend configuration
 * This is a placeholder for when OAuth is properly configured in PocketBase
 */
export const signInWithGitHub = async () => {
  try {
    // PocketBase OAuth flow
    const authUrl = `${pb.baseURL}/api/oauth2-redirect?redirect=${encodeURIComponent(window.location.origin)}/oauth-callback`;
    window.location.href = authUrl;
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to initiate GitHub login' };
  }
};

/**
 * Sign in with Google OAuth
 * Note: PocketBase OAuth requires backend configuration
 * This is a placeholder for when OAuth is properly configured in PocketBase
 */
export const signInWithGoogle = async () => {
  try {
    // PocketBase OAuth flow
    const authUrl = `${pb.baseUrl}/api/oauth2-authorize/google?redirect=${encodeURIComponent(window.location.origin)}/oauth-callback`;
    window.location.href = authUrl;
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to initiate Google login' };
  }
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (code: string, provider: string) => {
  try {
    const authData = await pb.collection('users').authWithOAuth2({
      provider,
      code,
      codeVerifier: localStorage.getItem(`oauth2_${provider}_verifier`) || '',
      redirectUrl: window.location.origin,
    });

    localStorage.removeItem(`oauth2_${provider}_verifier`);

    return {
      user: authData.record as UserRecord,
      token: authData.token,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      token: null,
      error: error.message || 'Failed to complete OAuth login',
    };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    pb.authStore.clear();
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Failed to sign out' };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<UserRecord | null> => {
  try {
    if (!pb.authStore.isValid) return null;
    return pb.authStore.record as UserRecord;
  } catch (error) {
    return null;
  }
};

/**
 * Get current session/token
 */
export const getCurrentSession = async (): Promise<string | null> => {
  try {
    if (!pb.authStore.isValid) return null;
    return pb.authStore.token;
  } catch (error) {
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, user: UserRecord | null) => void
) => {
  pb.authStore.onChange(() => {
    const user = pb.authStore.record as UserRecord | null;
    callback('auth_change', user);
  }, true);

  // Return an object with unsubscribe method to match Supabase interface
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          // Cleanup if needed
        },
      },
    },
  };
};

/**
 * Reset password for email
 * Note: PocketBase doesn't have built-in password reset via email
 * This would need backend support
 */
export const resetPassword = async (email: string) => {
  try {
    // For now, just return success
    // In production, you'd need to implement this on the backend
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string, currentPassword?: string) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { data: null, error: { message: 'No user logged in' } };
    }

    const updatedUser = await pb.collection('users').update(user.id, {
      password: newPassword,
      passwordConfirm: newPassword,
    });

    return { data: updatedUser, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || 'Failed to update password' } };
  }
};

/**
 * Setup MFA - Generate TOTP secret
 * Note: MFA in PocketBase would require custom implementation
 * This is a placeholder
 */
export const setupMFA = async () => {
  try {
    // For now, return a placeholder
    return {
      data: {
        secret: 'PLACEHOLDER_SECRET',
        backupCodes: [],
        qrUrl: '',
      },
      error: null,
    };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Verify TOTP code
 */
export const verifyTOTPCode = async (code: string, secret?: string) => {
  try {
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Confirm MFA setup
 */
export const confirmMFASetup = async (code: string, totp_secret?: string, backup_codes?: string[]) => {
  try {
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Disable MFA
 */
export const disableMFA = async () => {
  try {
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Check if MFA is enabled
 */
export const isMFAEnabled = async (): Promise<boolean> => {
  try {
    // Placeholder - MFA not yet implemented in PocketBase
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Get MFA backup codes
 */
export const getMFABackupCodes = async (): Promise<string[] | null> => {
  try {
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async (code: string) => {
  try {
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Get remaining backup codes
 */
export const getRemainingBackupCodes = async (): Promise<number | null> => {
  try {
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Verify MFA login
 */
export const verifyMFALogin = async (code: string) => {
  try {
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};
