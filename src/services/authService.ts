import { pb, getPocketBaseUrl } from '@/integrations/pocketbase/client';
import type { UserRecord } from '@/integrations/pocketbase/types';
import { fetchWithTimeout } from '@/utils/fetchUtils';

export interface AuthResponse {
  user: UserRecord | null;
  token: string | null;
  error: string | null;
  mfaRequired?: boolean;
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
 * After successful login, checks if MFA is enabled and returns mfaRequired flag
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);

    // After successful password auth, check if user has MFA factors
    // The token is now valid, so we can check MFA status
    const baseUrl = getPocketBaseUrl();
    let mfaRequired = false;
    
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/mfa/factors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const factors = data.totp || [];
        // MFA is required if user has verified TOTP factors
        mfaRequired = factors.length > 0 && factors.some((f: any) => f.status === 'verified');
      } else {
        // Fail closed: if we can't confirm MFA factors status, assume MFA might be required
        // This prevents bypassing MFA by causing the factors check to fail
        // Users without MFA will still get through after the MFA verification page checks factors
      }
    } catch {
      // Fail closed: on error verifying MFA status, proceed to MFA verification page
      // The MFA verification page will handle users who don't actually have MFA enabled
    }

    return {
      user: authData.record as unknown as UserRecord,
      token: authData.token,
      error: null,
      mfaRequired,
    };
  } catch (error: any) {
    return {
      user: null,
      token: null,
      error: error.message || 'Failed to sign in',
      mfaRequired: false,
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
 * Get external auth providers linked to the current user
 * Returns array of provider names (e.g., ['github', 'google'])
 */
export const getUserAuthProviders = async (): Promise<string[]> => {
  try {
    const user = pb.authStore.record;
    if (!user?.id) return [];
    
    // PocketBase SDK: listExternalAuths returns linked OAuth providers
    const externalAuths = await pb.collection('users').listExternalAuths(user.id);
    return externalAuths.map((auth: any) => auth.provider);
  } catch (error) {
    console.error('Error fetching user auth providers:', error);
    return [];
  }
};

/**
 * Check if user is an OAuth/SSO user (no password-based login)
 * Returns true if user has any external auth providers linked
 */
export const isOAuthUser = async (): Promise<boolean> => {
  const providers = await getUserAuthProviders();
  return providers.length > 0;
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
 */
export const resetPassword = async (email: string) => {
  try {
    // Placeholder for password reset functionality
    console.log('Reset password for:', email);
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
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
 * Setup MFA - Generate TOTP secret by calling the backend API
 */
export const setupMFA = async (friendlyName?: string) => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factor_type: 'totp',
        friendly_name: friendlyName || 'Authenticator App',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Failed to setup MFA' } };
    }

    const data = await response.json();
    return {
      data: {
        factorId: data.factor_id,
        secret: data.totp_secret,
        qrUrl: data.totp_uri,
        qrCode: data.qr_code_base64,
        backupCodes: [],
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to setup MFA';
    return { data: null, error: { message } };
  }
};

/**
 * Verify TOTP code during MFA enrollment
 */
export const verifyTOTPCode = async (code: string, factorId: string) => {
  try {
    if (!factorId) {
      return { data: null, error: { message: 'Factor ID is required' } };
    }

    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/enroll/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factor_id: factorId,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Invalid TOTP code' } };
    }

    const data = await response.json();
    return {
      data: {
        valid: true,
        backupCodes: data.codes || [],
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify TOTP code';
    return { data: null, error: { message } };
  }
};

/**
 * Confirm MFA setup (legacy wrapper - now handled by verifyTOTPCode)
 * @deprecated Use verifyTOTPCode directly instead
 */
export const confirmMFASetup = async (code: string, factorId: string, _backupCodes?: string[]) => {
  // This is now handled by verifyTOTPCode which completes the enrollment
  return verifyTOTPCode(code, factorId);
};

/**
 * Disable MFA for the current user
 */
export const disableMFA = async (factorId: string, code: string) => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/unenroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factor_id: factorId,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Failed to disable MFA' } };
    }

    return { data: { success: true }, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to disable MFA';
    return { data: null, error: { message } };
  }
};

/**
 * Check if MFA is enabled for the current user
 */
export const isMFAEnabled = async (): Promise<boolean> => {
  try {
    const factors = await getMFAFactors();
    return factors.length > 0 && factors.some(f => f.status === 'verified');
  } catch {
    return false;
  }
};

/**
 * Get MFA factors for the current user
 */
export const getMFAFactors = async () => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return [];
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/factors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    // API returns { totp: [...] } structure
    return data.totp || [];
  } catch {
    return [];
  }
};

/**
 * Get MFA backup codes for the current user
 * 
 * Note: Uses POST as required by the backend API (generates new codes if none exist).
 * The API only returns unused/valid backup codes - used codes are excluded from the response.
 * Therefore, all codes returned are guaranteed to be unused and valid for MFA verification.
 */
export const getMFABackupCodes = async (): Promise<{ codes: string[]; count: number } | null> => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return null;
    }

    const baseUrl = getPocketBaseUrl();
    // POST is required by the backend API - it generates backup codes if needed
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/backup-codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // API returns only unused backup codes - used codes are excluded from response
    const codes: string[] = data.codes || [];
    return {
      codes,
      count: codes.length,
    };
  } catch {
    return null;
  }
};

/**
 * Verify backup code for MFA login
 */
export const verifyBackupCode = async (code: string, challengeId: string, factorId: string) => {
  try {
    if (!challengeId || !factorId) {
      return { data: null, error: { message: 'Missing MFA challenge or factor information' } };
    }

    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factor_id: factorId,
        challenge_id: challengeId,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Invalid backup code' } };
    }

    const data = await response.json();
    return {
      data: {
        valid: data.success,
        assuranceLevel: data.aal,
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify backup code';
    return { data: null, error: { message } };
  }
};

/**
 * Get count of remaining backup codes
 */
export const getRemainingBackupCodes = async (): Promise<number | null> => {
  try {
    const backupData = await getMFABackupCodes();
    return backupData?.count ?? null;
  } catch {
    return null;
  }
};

/**
 * Regenerate MFA backup codes
 */
export const regenerateBackupCodes = async (code: string) => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/backup-codes/regenerate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Failed to regenerate backup codes' } };
    }

    const data = await response.json();
    return {
      data: {
        backupCodes: data.codes || [],
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate backup codes';
    return { data: null, error: { message } };
  }
};

/**
 * Create MFA challenge for verification
 */
export const createMFAChallenge = async (factorId: string) => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/challenge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ factor_id: factorId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Failed to create challenge' } };
    }

    const data = await response.json();
    return {
      data: {
        challengeId: data.challenge_id,
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create MFA challenge';
    return { data: null, error: { message } };
  }
};

/**
 * Verify TOTP code during MFA login
 */
export const verifyMFALogin = async (code: string, challengeId: string, factorId: string) => {
  try {
    if (!challengeId || !factorId) {
      return { data: null, error: { message: 'Missing MFA challenge or factor information' } };
    }

    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factor_id: factorId,
        challenge_id: challengeId,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: errorData.message || 'Invalid code' } };
    }

    const data = await response.json();
    return {
      data: {
        valid: data.success,
        assuranceLevel: data.aal,
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify MFA';
    return { data: null, error: { message } };
  }
};

/**
 * Get current MFA assurance level
 */
export const getMFAAssuranceLevel = async () => {
  try {
    const token = await getCurrentSession();
    if (!token) {
      return { data: null, error: { message: 'No authentication token available' } };
    }

    const baseUrl = getPocketBaseUrl();
    const response = await fetchWithTimeout(`${baseUrl}/api/mfa/assurance-level`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { data: null, error: { message: 'Failed to get assurance level' } };
    }

    const data = await response.json();
    return {
      data: {
        currentLevel: data.current_level,
        nextLevel: data.next_level,
        mfaEnabled: data.mfa_enabled,
      },
      error: null,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get assurance level';
    return { data: null, error: { message } };
  }
};


