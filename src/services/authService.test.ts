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
} from "./authService";
import { pb } from "@/integrations/pocketbase/client";

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
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
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
    it("should sign in user", async () => {
      const result = await signInWithEmail("test@example.com", "password");
      expect(result.user).not.toBeNull();
      expect(result.token).not.toBeNull();
      expect(pb.collection).toHaveBeenCalledWith("users");
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

  describe("MFA placeholders", () => {
    it("should handle setupMFA", async () => {
      const result = await setupMFA();
      expect(result.data).not.toBeNull();
    });

    it("should handle isMFAEnabled", async () => {
      const result = await isMFAEnabled();
      expect(result).toBe(false);
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
