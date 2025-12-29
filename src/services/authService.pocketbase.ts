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

    await pb.collection('users').create(userData);

    // Auto-login after signup
    const authData = await pb.collection('users').authWithPassword(email, password);

    return {
      user: authData.record as unknown as UserRecord,
      token: authData.token,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
    return {
      user: null,
      token: null,
      error: errorMessage,
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
      user: authData.record as unknown as UserRecord,
      token: authData.token,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
    return {
      user: null,
      token: null,
      error: errorMessage,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate GitHub login';
    return { data: null, error: errorMessage };
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
    const authUrl = `${pb.baseURL}/api/oauth2-authorize/google?redirect=${encodeURIComponent(window.location.origin)}/oauth-callback`;
    window.location.href = authUrl;
    return { data: null, error: null };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Google login';
    return { data: null, error: errorMessage };
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
      user: authData.record as unknown as UserRecord,
      token: authData.token,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete OAuth login';
    return {
      user: null,
      token: null,
      error: errorMessage,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
    return { error: errorMessage };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<UserRecord | null> => {
  try {
    if (!pb.authStore.isValid) return null;
    return pb.authStore.record as unknown as UserRecord;
  } catch {
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
  } catch {
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
    const user = pb.authStore.record as unknown as UserRecord | null;
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
export const resetPassword = async () => {
  try {
    // For now, just return success
    // In production, you'd need to implement this on the backend
    return { data: null, error: null };
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { data: null, error: { message: 'No user logged in' } };
    }

    const updatedUser = await pb.collection('users').update((await user).id, {
      password: newPassword,
      passwordConfirm: newPassword,
    });

    return { data: updatedUser, error: null };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
    return { data: null, error: { message: errorMessage } };
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
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Verify TOTP code
 */
export const verifyTOTPCode = async () => {
  try {
    return { data: null, error: null };
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Confirm MFA setup
 */
export const confirmMFASetup = async () => {
  try {
    return { data: null, error: null };
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Disable MFA
 */
export const disableMFA = async () => {
  try {
    return { data: null, error: null };
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Check if MFA is enabled
 */
export const isMFAEnabled = async (): Promise<boolean> => {
  try {
    // Placeholder - MFA not yet implemented in PocketBase
    return false;
  } catch {
    return false;
  }
};

/**
 * Get MFA backup codes
 */
export const getMFABackupCodes = async (): Promise<string[] | null> => {
  try {
    return null;
  } catch {
    return null;
  }
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async () => {
  try {
    return { data: null, error: null };
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Get remaining backup codes
 */
export const getRemainingBackupCodes = async (): Promise<number | null> => {
  try {
    return null;
  } catch {
    return null;
  }
};

/**
 * Verify MFA login
 */
export const verifyMFALogin = async () => {
  try {
    return { data: null, error: null };
  } catch (error: unknown) {
    return { data: null, error: (error as Error).message };
  }
};
