
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGitHub,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
  resetPassword,
  updatePassword,
  setupMFA,
  verifyTOTPCode,
  confirmMFASetup,
  disableMFA,
  verifyMFALogin,
  verifyBackupCode,
  isMFAEnabled,
  getRemainingBackupCodes,
} from './authService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

const mockUser = { id: '123', email: 'test@example.com' };
const mockSession = { access_token: 'abc-123', user: mockUser };

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('should sign up a user with email and password', async () => {
      const mockResponse = { data: { user: mockUser, session: mockSession }, error: null };
      (supabase.auth.signUp as any).mockResolvedValue(mockResponse);

      const result = await signUpWithEmail('test@example.com', 'password123', 'Test User');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
          },
        },
      });
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Sign up failed' };
      const mockResponse = { data: { user: null, session: null }, error: mockError };
      (supabase.auth.signUp as any).mockResolvedValue(mockResponse);

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in a user with email and password', async () => {
      const mockResponse = { data: { user: mockUser, session: mockSession }, error: null };
      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Sign in failed' };
      const mockResponse = { data: { user: null, session: null }, error: mockError };
      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithGitHub', () => {
    it('should initiate GitHub OAuth sign in', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ data: {}, error: null });
      await signInWithGitHub();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    });
  });

  describe('signInWithGoogle', () => {
    it('should initiate Google OAuth sign in', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ data: {}, error: null });
      await signInWithGoogle();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    });
  });

  describe('signOut', () => {
    it('should sign out the user', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });
      const { error } = await signOut();
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(error).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
      const user = await getCurrentUser();
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });
  });

  describe('getCurrentSession', () => {
    it('should return the current session', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession } });
      const session = await getCurrentSession();
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(session).toEqual(mockSession);
    });
  });

  describe('onAuthStateChange', () => {
    it('should register a callback for auth state changes', () => {
      const callback = vi.fn();
      onAuthStateChange(callback);
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('resetPassword', () => {
    it('should send a password reset email', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ data: {}, error: null });
      await resetPassword('test@example.com');
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    });
  });

  describe('updatePassword', () => {
    it('should update the user password', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ data: {}, error: null });
      await updatePassword('newPassword123');
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });
  });

  describe('setupMFA', () => {
    it('should generate TOTP secret and backup codes', async () => {
      const mockResponse = {
        data: {
          totp_secret: 'test-secret-123',
          backup_codes: ['code1', 'code2', 'code3', 'code4', 'code5'],
        },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await setupMFA();

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: { action: 'setup' },
      });
      expect(result.data?.secret).toBe('test-secret-123');
      expect(result.data?.backupCodes).toHaveLength(5);
    });

    it('should handle setup errors', async () => {
      const mockError = { message: 'Setup failed' };
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await setupMFA();

      expect(result.error).toBeDefined();
    });
  });

  describe('verifyTOTPCode', () => {
    it('should verify a valid TOTP code', async () => {
      const mockResponse = {
        data: { valid: true },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await verifyTOTPCode('123456');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: {
          action: 'verify-totp',
          code: '123456',
        },
      });
      expect(result.data?.valid).toBe(true);
    });

    it('should reject an invalid TOTP code', async () => {
      const mockResponse = {
        data: { valid: false },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await verifyTOTPCode('000000');

      expect(result.data?.valid).toBe(false);
    });

    it('should verify with a provided secret', async () => {
      const mockResponse = {
        data: { valid: true },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      await verifyTOTPCode('123456', 'test-secret-123');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: {
          action: 'verify-totp',
          code: '123456',
          secret: 'test-secret-123',
        },
      });
    });
  });

  describe('confirmMFASetup', () => {
    it('should confirm MFA setup with valid code', async () => {
      const mockResponse = {
        data: { success: true },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await confirmMFASetup('123456', 'test-secret-123', [
        'backup1',
        'backup2',
        'backup3',
        'backup4',
        'backup5',
      ]);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: {
          action: 'confirm',
          totp_code: '123456',
          totp_secret: 'test-secret-123',
          backup_codes: ['backup1', 'backup2', 'backup3', 'backup4', 'backup5'],
        },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should handle invalid confirmation code', async () => {
      const mockResponse = {
        data: { success: false, message: 'Invalid code' },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await confirmMFASetup('000000', 'test-secret-123', ['code1']);

      expect(result.data?.success).toBe(false);
    });
  });

  describe('disableMFA', () => {
    it('should disable MFA for the user', async () => {
      const mockResponse = {
        data: { success: true },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await disableMFA();

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: { action: 'disable' },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should handle disable errors', async () => {
      const mockError = { message: 'Disable failed' };
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await disableMFA();

      expect(result.error).toBeDefined();
    });
  });

  describe('verifyMFALogin', () => {
    it('should verify TOTP code during login', async () => {
      const mockResponse = {
        data: { valid: true },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await verifyMFALogin('123456');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: {
          action: 'verify-totp',
          code: '123456',
        },
      });
      expect(result.data?.valid).toBe(true);
    });

    it('should reject invalid MFA login code', async () => {
      const mockResponse = {
        data: { valid: false },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await verifyMFALogin('000000');

      expect(result.data?.valid).toBe(false);
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify a valid backup code', async () => {
      const mockResponse = {
        data: { valid: true },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await verifyBackupCode('backup-code-123');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('mfa-handler', {
        body: {
          action: 'verify-backup-code',
          code: 'backup-code-123',
        },
      });
      expect(result.data?.valid).toBe(true);
    });

    it('should reject an invalid or used backup code', async () => {
      const mockResponse = {
        data: { valid: false, message: 'Backup code already used' },
        error: null,
      };
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await verifyBackupCode('backup-code-123');

      expect(result.data?.valid).toBe(false);
    });
  });

  describe('isMFAEnabled', () => {
    it('should return false when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });
      
      const result = await isMFAEnabled();
      expect(result).toBe(false);
    });

    it('should return true if MFA is enabled', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { mfa_enabled: true }, error: null }),
      });
      (supabase.from as any) = mockFrom;
      
      const result = await isMFAEnabled();
      expect(result).toBe(true);
    });

    it('should return false if MFA is disabled', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });
      (supabase.from as any) = mockFrom;
      
      const result = await isMFAEnabled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      (supabase.auth.getUser as any).mockRejectedValue(new Error('Auth error'));
      
      const result = await isMFAEnabled();
      expect(result).toBe(false);
    });
  });

  describe('getRemainingBackupCodes', () => {
    it('should return the count of remaining backup codes', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      
      const mockSelect = vi.fn();
      const mockEq = vi.fn();
      const mockSingle = vi.fn();
      
      // First call - get backup codes
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValue({ 
              data: { backup_codes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'] }, 
              error: null 
            }),
          }),
        }),
      });
      
      // Second call - get used codes
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ 
          data: [{ id: '1' }, { id: '2' }], 
          error: null 
        }),
      });
      
      (supabase.from as any) = vi.fn(() => ({
        select: mockSelect,
      }));
      
      const result = await getRemainingBackupCodes();
      expect(result).toBe(3); // 5 total - 2 used = 3 remaining
    });

    it('should return null if user has no MFA setup', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });
      (supabase.from as any) = mockFrom;
      
      const result = await getRemainingBackupCodes();
      expect(result).toBeNull();
    });

    it('should return null when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });
      
      const result = await getRemainingBackupCodes();
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (supabase.auth.getUser as any).mockRejectedValue(new Error('Auth error'));
      
      const result = await getRemainingBackupCodes();
      expect(result).toBeNull();
    });
  });
});
