import { describe, it, expect, vi, beforeEach } from "vitest";
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
  getMFAFactors,
  createMFAChallenge,
  regenerateBackupCodes,
  getMFAAssuranceLevel,
  getUserAuthProviders,
  isOAuthUser,
} from "./authService";
import { pb } from "@/integrations/pocketbase/client";

// Mock fetchWithTimeout utility
const mockFetchWithTimeout = vi.fn();
vi.mock("@/utils/fetchUtils", () => ({
  fetchWithTimeout: (...args: unknown[]) => mockFetchWithTimeout(...args),
}));

// Mock dependencies
vi.mock("@/integrations/pocketbase/client", () => ({
  pb: {
    collection: vi.fn(),
    authStore: {
      clear: vi.fn(),
      model: { id: "user-123", email: "test@example.com" },
      record: { id: "user-123", email: "test@example.com" },
      isValid: true,
      token: "token-123",
      onChange: vi.fn(),
    },
  },
  getPocketBaseUrl: () => 'http://localhost:8090',
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset fetchWithTimeout mock to default (no MFA factors)
    mockFetchWithTimeout.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totp: [] }),
    });
    
    // Reset collection mock to default success state
    (pb.collection as any).mockReturnValue({
      create: vi.fn().mockResolvedValue({ id: "user-123", email: "test@example.com" }),
      authWithPassword: vi.fn().mockResolvedValue({
        record: { id: "user-123", email: "test@example.com" },
        token: "token-123",
      }),
      authWithOAuth2: vi.fn().mockResolvedValue({
        record: { id: "user-123", email: "test@example.com" },
        token: "token-123",
      }),
      requestPasswordReset: vi.fn().mockResolvedValue(true),
      update: vi.fn().mockResolvedValue({ id: "user-123" }),
      listExternalAuths: vi.fn().mockResolvedValue([]),
    });
  });

  describe("signUpWithEmail", () => {
    it("should sign up user", async () => {
      const result = await signUpWithEmail("test@example.com", "password", "Test User");
      expect(result.user).not.toBeNull();
      expect(pb.collection).toHaveBeenCalledWith("users");
    });
  });

  describe("signInWithEmail", () => {
    it("should sign in user without MFA", async () => {
      const result = await signInWithEmail("test@example.com", "password");
      expect(result.user).not.toBeNull();
      expect(result.token).not.toBeNull();
      expect(result.mfaRequired).toBe(false);
      expect(pb.collection).toHaveBeenCalledWith("users");
    });

    it("should sign in user with MFA required", async () => {
      // Mock fetchWithTimeout to return verified TOTP factor
      mockFetchWithTimeout.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          totp: [{ id: "factor-123", status: "verified" }],
        }),
      });

      const result = await signInWithEmail("test@example.com", "password");
      expect(result.user).not.toBeNull();
      expect(result.token).not.toBeNull();
      expect(result.mfaRequired).toBe(true);
      
      // Verify the MFA factors API endpoint was called with correct parameters
      expect(mockFetchWithTimeout).toHaveBeenCalledWith(
        expect.stringContaining('/api/mfa/factors'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer token-123'
          })
        })
      );
    });
  });

  describe("signOut", () => {
    it("should clear auth store", async () => {
      await signOut();
      expect(pb.authStore.clear).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user", async () => {
      const user = await getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.id).toBe("user-123");
    });
  });

  describe("getCurrentSession", () => {
    it("should return current session", async () => {
      const session = await getCurrentSession();
      expect(session).not.toBeNull();
      expect(session).toBe("token-123");
    });
  });

  describe("getUserAuthProviders", () => {
    it("should return empty array when no external auths", async () => {
      (pb.collection as any).mockReturnValue({
        listExternalAuths: vi.fn().mockResolvedValue([]),
      });

      const providers = await getUserAuthProviders();
      expect(providers).toEqual([]);
    });

    it("should return provider names when external auths exist", async () => {
      (pb.collection as any).mockReturnValue({
        listExternalAuths: vi.fn().mockResolvedValue([
          { provider: 'github' },
          { provider: 'google' },
        ]),
      });

      const providers = await getUserAuthProviders();
      expect(providers).toEqual(['github', 'google']);
    });

    it("should return empty array on error", async () => {
      (pb.collection as any).mockReturnValue({
        listExternalAuths: vi.fn().mockRejectedValue(new Error("Failed")),
      });

      const providers = await getUserAuthProviders();
      expect(providers).toEqual([]);
    });
  });

  describe("isOAuthUser", () => {
    it("should return false when no external auths", async () => {
      (pb.collection as any).mockReturnValue({
        listExternalAuths: vi.fn().mockResolvedValue([]),
      });

      const result = await isOAuthUser();
      expect(result).toBe(false);
    });

    it("should return true when external auths exist", async () => {
      (pb.collection as any).mockReturnValue({
        listExternalAuths: vi.fn().mockResolvedValue([
          { provider: 'github' },
        ]),
      });

      const result = await isOAuthUser();
      expect(result).toBe(true);
    });
  });

  describe("MFA functions", () => {
    beforeEach(() => {
      mockFetchWithTimeout.mockReset();
    });

    it("should handle setupMFA success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          factor_id: 'factor-123',
          totp_secret: 'TOTP_SECRET',
          totp_uri: 'otpauth://totp/test',
          qr_code_base64: 'data:image/png;base64,abc',
        }),
      });

      const result = await setupMFA('My Phone');
      expect(result.data).not.toBeNull();
      expect(result.data?.factorId).toBe('factor-123');
      expect(result.data?.secret).toBe('TOTP_SECRET');
    });

    it("should handle setupMFA error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to setup MFA' }),
      });

      const result = await setupMFA();
      expect(result.error).not.toBeNull();
    });

    it("should handle verifyTOTPCode success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          codes: ['CODE1', 'CODE2'],
        }),
      });

      const result = await verifyTOTPCode('123456', 'factor-123');
      expect(result.data?.valid).toBe(true);
      expect(result.data?.backupCodes).toHaveLength(2);
    });

    it("should handle verifyTOTPCode error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid code' }),
      });

      const result = await verifyTOTPCode('000000', 'factor-123');
      expect(result.error).not.toBeNull();
    });

    it("should handle confirmMFASetup (wrapper for verifyTOTPCode)", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ codes: [] }),
      });

      const result = await confirmMFASetup('123456', 'factor-123');
      expect(result.data).not.toBeNull();
    });

    it("should handle disableMFA success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await disableMFA('factor-123', '123456');
      expect(result.data?.success).toBe(true);
    });

    it("should handle disableMFA error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid code' }),
      });

      const result = await disableMFA('factor-123', '000000');
      expect(result.error).not.toBeNull();
    });

    it("should handle isMFAEnabled when factors exist", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          totp: [{ id: 'factor-123', status: 'verified' }],
        }),
      });

      const result = await isMFAEnabled();
      expect(result).toBe(true);
    });

    it("should handle isMFAEnabled when no factors", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totp: [] }),
      });

      const result = await isMFAEnabled();
      expect(result).toBe(false);
    });

    it("should handle getMFAFactors success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          totp: [{ id: 'factor-123', factor_type: 'totp', status: 'verified' }],
        }),
      });

      const result = await getMFAFactors();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('factor-123');
    });

    it("should handle getMFAFactors error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
      });

      const result = await getMFAFactors();
      expect(result).toEqual([]);
    });

    it("should handle verifyMFALogin success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          aal: 'aal2',
        }),
      });

      const result = await verifyMFALogin('123456', 'challenge-123', 'factor-123');
      expect(result.data?.valid).toBe(true);
      expect(result.data?.assuranceLevel).toBe('aal2');
    });

    it("should handle verifyMFALogin error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid code' }),
      });

      const result = await verifyMFALogin('000000', 'challenge-123', 'factor-123');
      expect(result.error).not.toBeNull();
    });

    it("should handle verifyBackupCode success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          aal: 'aal2',
        }),
      });

      const result = await verifyBackupCode('BACKUP-CODE', 'challenge-123', 'factor-123');
      expect(result.data?.valid).toBe(true);
      expect(result.data?.assuranceLevel).toBe('aal2');
    });

    it("should handle verifyBackupCode error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid backup code' }),
      });

      const result = await verifyBackupCode('INVALID', 'challenge-123', 'factor-123');
      expect(result.error).not.toBeNull();
    });

    it("should handle createMFAChallenge success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ challenge_id: 'challenge-123' }),
      });

      const result = await createMFAChallenge('factor-123');
      expect(result.data?.challengeId).toBe('challenge-123');
    });

    it("should handle createMFAChallenge error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Factor not found' }),
      });

      const result = await createMFAChallenge('invalid-factor');
      expect(result.error).not.toBeNull();
    });

    it("should handle regenerateBackupCodes success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          codes: ['NEW-CODE-1', 'NEW-CODE-2'],
        }),
      });

      const result = await regenerateBackupCodes('123456');
      expect(result.data?.backupCodes).toHaveLength(2);
    });

    it("should handle regenerateBackupCodes error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid TOTP code' }),
      });

      const result = await regenerateBackupCodes('000000');
      expect(result.error).not.toBeNull();
    });

    it("should handle getMFAAssuranceLevel success", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current_level: 'aal1',
          next_level: 'aal2',
          mfa_enabled: true,
        }),
      });

      const result = await getMFAAssuranceLevel();
      expect(result.data?.currentLevel).toBe('aal1');
      expect(result.data?.mfaEnabled).toBe(true);
    });

    it("should handle getMFAAssuranceLevel error", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
      });

      const result = await getMFAAssuranceLevel();
      expect(result.error).not.toBeNull();
    });

    it("should handle getRemainingBackupCodes", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          codes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5', 'CODE6', 'CODE7', 'CODE8'],
        }),
      });

      const result = await getRemainingBackupCodes();
      expect(result).toBe(8);
    });
  });

  describe("Error handling", () => {
    it("should handle signUpWithEmail error", async () => {
      (pb.collection as any).mockReturnValue({
        create: vi.fn().mockRejectedValue(new Error("Email taken")),
      });
      const result = await signUpWithEmail("test@example.com", "password");
      expect(result.error).toBe("Email taken");
    });

    it("should handle signInWithEmail error", async () => {
      (pb.collection as any).mockReturnValue({
        authWithPassword: vi.fn().mockRejectedValue(new Error("Invalid credentials")),
      });
      const result = await signInWithEmail("test@example.com", "password");
      expect(result.error).toBe("Invalid credentials");
    });

    it("should handle signInWithGitHub error", async () => {
      (pb.collection as any).mockReturnValue({
        authWithOAuth2: vi.fn().mockRejectedValue(new Error("OAuth failed")),
      });
      const result = await signInWithGitHub();
      expect(result.error).toBe("OAuth failed");
    });
  });

  describe("Password Management", () => {
    it("should request password reset", async () => {
      const result = await resetPassword("test@example.com");
      expect(result.error).toBeNull();
    });

    it("should update password", async () => {
      const result = await updatePassword("newPass");
      expect(result.error).toBeNull();
      expect(pb.collection).toHaveBeenCalledWith("users");
    });
  });
});
