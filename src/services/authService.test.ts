
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
      (supabase.auth.signUp as vi.Mock).mockResolvedValue(mockResponse);

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
      (supabase.auth.signUp as vi.Mock).mockResolvedValue(mockResponse);

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in a user with email and password', async () => {
      const mockResponse = { data: { user: mockUser, session: mockSession }, error: null };
      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue(mockResponse);

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
      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue(mockResponse);

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithGitHub', () => {
    it('should initiate GitHub OAuth sign in', async () => {
      (supabase.auth.signInWithOAuth as vi.Mock).mockResolvedValue({ data: {}, error: null });
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
      (supabase.auth.signInWithOAuth as vi.Mock).mockResolvedValue({ data: {}, error: null });
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
      (supabase.auth.signOut as vi.Mock).mockResolvedValue({ error: null });
      const { error } = await signOut();
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(error).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({ data: { user: mockUser } });
      const user = await getCurrentUser();
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });
  });

  describe('getCurrentSession', () => {
    it('should return the current session', async () => {
      (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: mockSession } });
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
      (supabase.auth.resetPasswordForEmail as vi.Mock).mockResolvedValue({ data: {}, error: null });
      await resetPassword('test@example.com');
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    });
  });

  describe('updatePassword', () => {
    it('should update the user password', async () => {
      (supabase.auth.updateUser as vi.Mock).mockResolvedValue({ data: {}, error: null });
      await updatePassword('newPassword123');
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });
  });
});
