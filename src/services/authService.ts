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
      user: authData.record as unknown as UserRecord,
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
 * PocketBase handles the entire OAuth2 flow
 */
export const signInWithGitHub = async () => {
  try {
    // Use PocketBase SDK's authWithOAuth2 method
    // This opens a popup or redirect to GitHub, then returns auth data
    const authData = await pb.collection('users').authWithOAuth2({
      provider: 'github',
    });

    // Successfully authenticated - return the auth data
    return { 
      data: {
        user: authData.record as unknown as UserRecord,
        token: authData.token,
      }, 
      error: null 
    };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to sign in with GitHub' };
  }
};

/**
 * Sign in with Google OAuth
 * PocketBase handles the entire OAuth2 flow
 */
export const signInWithGoogle = async () => {
  try {
    // Use PocketBase SDK's authWithOAuth2 method
    const authData = await pb.collection('users').authWithOAuth2({
      provider: 'google',
    });

    // Successfully authenticated - return the auth data
    return { 
      data: {
        user: authData.record as unknown as UserRecord,
        token: authData.token,
      }, 
      error: null 
    };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to sign in with Google' };
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
    return pb.authStore.record as unknown as UserRecord;
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
 */
export const resetPassword = async (email: string) => {
  try {
    // Placeholder for password reset functionality
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string, _currentPassword?: string) => {
  try {
    const user = await getCurrentUser();
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
 */
export const setupMFA = async () => {
  try {
    // Placeholder for MFA setup
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
export const verifyTOTPCode = async (_code: string, _secret?: string) => {
  try {
    // Placeholder for TOTP verification
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Confirm MFA setup
 */
export const confirmMFASetup = async (_code: string, _totp_secret?: string, _backup_codes?: string[]) => {
  try {
    // Placeholder for MFA confirmation
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
    // Placeholder for MFA disabling
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Check if MFA is enabled for the current user
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
 * Get MFA backup codes for the current user
 */
export const getMFABackupCodes = async (): Promise<string[] | null> => {
  try {
    // Placeholder for backup codes retrieval
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Verify backup code for MFA login
 */
export const verifyBackupCode = async (_code: string) => {
  try {
    // Placeholder for backup code verification
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Get count of remaining backup codes
 */
export const getRemainingBackupCodes = async (): Promise<number | null> => {
  try {
    // Placeholder for remaining backup codes count
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Verify TOTP code during MFA login
 */
export const verifyMFALogin = async (_code: string) => {
  try {
    // Placeholder for MFA login verification
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};


