import { supabase } from '@/lib/supabase';
import type { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { data, error };
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { data, error };
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Get current session
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

/**
 * Reset password for email
 */
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { data, error };
};

/**
 * Update user password (with current password verification)
 */
export const updatePassword = async (newPassword: string, currentPassword?: string) => {
  // If current password is provided, verify it first
  if (currentPassword) {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { data: null, error: { message: 'User email not found' } as AuthError };
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { data: null, error: { message: 'Current password is incorrect' } as AuthError };
    }
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
};

/**
 * Setup MFA - Generate TOTP secret and backup codes
 */
export const setupMFA = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('mfa-handler', {
      body: {
        action: 'setup',
      },
    });

    if (error) {
      return { data: null, error };
    }

    // Transform response to match expected interface
    if (data?.totp_secret && data?.backup_codes) {
      // Get current user for email (for QR code generation)
      let email: string;
      try {
        const user = await getCurrentUser();
        if (!user?.email) {
          throw new Error('User email is required for MFA setup');
        }
        email = user.email;
      } catch (e) {
        // Log error if getCurrentUser fails for debugging purposes
        console.error('Failed to fetch current user during MFA setup:', e);
        return { data: null, error: e as AuthError };
      }

      const qrUrl = `otpauth://totp/NannyUI:${email}?secret=${data.totp_secret}&issuer=NannyUI`;
      const result = { 
        data: { 
          secret: data.totp_secret,
          backupCodes: data.backup_codes || [],
          qrUrl,
        }, 
        error: null 
      };
      return result;
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Verify TOTP code - Can be used to confirm MFA setup
 */
export const verifyTOTPCode = async (code: string, secret?: string) => {
  const { data, error } = await supabase.functions.invoke('mfa-handler', {
    body: {
      action: 'verify-totp',
      code,
      secret,
    },
  });

  return { data, error };
};

interface ConfirmMFASetupBody {
  action: 'confirm';
  totp_code: string;
  totp_secret?: string;
  backup_codes?: string[];
}

/**
 * Confirm MFA setup - Verify the TOTP code and enable MFA
 */
export const confirmMFASetup = async (code: string, totp_secret?: string, backup_codes?: string[]) => {
  const body: ConfirmMFASetupBody = {
    action: 'confirm',
    totp_code: code,
  };

  // Only include totp_secret if provided
  if (totp_secret) {
    body.totp_secret = totp_secret;
  }

  // Only include backup_codes if provided
  if (backup_codes) {
    body.backup_codes = backup_codes;
  }

  const { data, error } = await supabase.functions.invoke('mfa-handler', {
    body,
  });

  return { data, error };
};

/**
 * Disable MFA - Remove TOTP-based MFA from the account
 */
export const disableMFA = async () => {
  const { data, error } = await supabase.functions.invoke('mfa-handler', {
    body: {
      action: 'disable',
    },
  });

  return { data, error };
};

/**
 * Check if MFA is enabled for the current user
 */
export const isMFAEnabled = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_mfa_settings')
      .select('mfa_enabled')
      .eq('user_id', user.id)
      .eq('mfa_enabled', true)
      .single();

    if (error) {
      // No MFA settings found or not enabled
      return false;
    }

    return data?.mfa_enabled ?? false;
  } catch (error) {
    console.error('Error checking MFA status:', error);
    return false;
  }
};

/**
 * Get MFA backup codes for the current user
 */
export const getMFABackupCodes = async (): Promise<string[] | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_mfa_settings')
      .select('backup_codes')
      .eq('user_id', user.id)
      .eq('mfa_enabled', true)
      .single();

    if (error) {
      return null;
    }

    return data?.backup_codes ?? null;
  } catch (error) {
    console.error('Error fetching backup codes:', error);
    return null;
  }
};

/**
 * Verify backup code for MFA login
 */
export const verifyBackupCode = async (code: string) => {
  const { data, error } = await supabase.functions.invoke('mfa-handler', {
    body: {
      action: 'verify-backup-code',
      code,
    },
  });

  return { data, error };
};

/**
 * Get count of remaining backup codes
 */
export const getRemainingBackupCodes = async (): Promise<number | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Get total backup codes
    const { data: mfaSettings, error: mfaError } = await supabase
      .from('user_mfa_settings')
      .select('backup_codes')
      .eq('user_id', user.id)
      .eq('mfa_enabled', true)
      .single();

    if (mfaError || !mfaSettings) {
      return null;
    }

    const totalBackupCodes = mfaSettings.backup_codes?.length ?? 0;

    // Get used backup codes count
    const { data: usedCodes, error: usedError } = await supabase
      .from('user_mfa_backup_codes_used')
      .select('id')
      .eq('user_id', user.id);

    if (usedError) {
      return null;
    }

    const usedCount = usedCodes?.length ?? 0;
    return Math.max(0, totalBackupCodes - usedCount);
  } catch (error) {
    console.error('Error getting remaining backup codes:', error);
    return null;
  }
};

/**
 * Verify TOTP code during MFA login
 */
export const verifyMFALogin = async (code: string) => {
  const { data, error } = await supabase.functions.invoke('mfa-handler', {
    body: {
      action: 'verify-totp',
      code,
    },
  });

  return { data, error };
};

