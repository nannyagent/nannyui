import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRecentInvestigationsFromAPI,
  getInvestigation,
  getInferenceById,
  createInvestigationFromAPI,
  getPriorityColor,
  getStatusColor,
  formatInvestigationTime,
  isInvestigationRunning,
  isInvestigationCompleted,
  isInvestigationFailed,
  getUserInvestigations,
  getInvestigationsPaginated,
} from "./investigationService";
import { pb } from "@/lib/pocketbase";

// Mock the dependencies
vi.mock("@/lib/pocketbase", () => ({
  pb: {
    authStore: {
      model: { id: "user-123" },
      isValid: true,
    },
    collection: vi.fn().mockReturnValue({
      getList: vi.fn().mockResolvedValue({
        items: [],
        totalItems: 0,
        page: 1,
        perPage: 10,
        totalPages: 0,
      }),
      getOne: vi.fn().mockResolvedValue({
        id: "inv-123",
        created: "2023-01-01",
        updated: "2023-01-01",
      }),
      create: vi.fn().mockResolvedValue({
        id: "inv-new",
        status: "pending",
      }),
    }),
    files: {
      getUrl: vi.fn().mockReturnValue("http://localhost:8090/api/files/..."),
    },
    send: vi.fn().mockResolvedValue({
      id: "inv-123",
      created: "2023-01-01",
      updated: "2023-01-01",
    }),
  },
}));

describe("investigationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRecentInvestigationsFromAPI", () => {
    it("should return investigations", async () => {
      const result = await getRecentInvestigationsFromAPI(5);
      expect(result).toEqual([]);
      expect(pb.collection).toHaveBeenCalledWith("investigations");
      expect(pb.collection("investigations").getList).toHaveBeenCalledWith(1, 5, {
        sort: "-id",
        expand: "agent_id",
        filter: 'user_id = "user-123"',
      });
    });

    it("should handle errors gracefully", async () => {
      (pb.collection as any).mockReturnValueOnce({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await getRecentInvestigationsFromAPI(5);
      expect(result).toEqual([]);
    });
  });

  describe("getInvestigation", () => {
    it("should return investigation when found", async () => {
      const result = await getInvestigation("inv-123");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("inv-123");
      expect(pb.send).toHaveBeenCalledWith('/api/investigations?id=inv-123', { method: 'GET' });
    });

    it("should return null on error", async () => {
      (pb.send as any).mockRejectedValueOnce(new Error("Not found"));

      const result = await getInvestigation("inv-123");
      expect(result).toBeNull();
    });
  });

  describe("getInferenceById", () => {
    it("should return inference when found", async () => {
      (pb.collection as any).mockReturnValueOnce({
        getOne: vi.fn().mockResolvedValue({
          id: "inf-123",
          function_name: "test",
          created: "2023-01-01",
        }),
      });

      const result = await getInferenceById("inf-123");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("inf-123");
    });

    it("should return null when not found", async () => {
      (pb.collection as any).mockReturnValueOnce({
        getOne: vi.fn().mockRejectedValue(new Error("Not found")),
      });

      const result = await getInferenceById("inf-123");
      expect(result).toBeNull();
    });
  });

  describe("createInvestigationFromAPI", () => {
    it("should throw error when not authenticated", async () => {
      // Mock authStore.model to be null
      const originalModel = pb.authStore.model;
      Object.defineProperty(pb.authStore, "model", { value: null, configurable: true });

      await expect(
        createInvestigationFromAPI({
          agent_id: "agent-123",
          issue: "Test",
          priority: "low",
          initiated_by: "user-123",
          application_group: "test-app",
        })
      ).rejects.toThrow("User not authenticated");

      // Restore model
      Object.defineProperty(pb.authStore, "model", { value: originalModel, configurable: true });
    });

    it("should create investigation successfully", async () => {
      const result = await createInvestigationFromAPI({
        agent_id: "agent-123",
        issue: "Test",
        priority: "low",
        initiated_by: "user-123",
        application_group: "test-app",
      });

      expect(result.investigation_id).toBe("inv-new");
      expect(pb.collection).toHaveBeenCalledWith("investigations");
    });
  });

  describe("utility functions", () => {
    describe("getPriorityColor", () => {
      it("should return correct color classes for each priority", () => {
        expect(getPriorityColor("critical")).toBe("bg-red-100 text-red-800");
        expect(getPriorityColor("high")).toBe("bg-orange-100 text-orange-800");
        expect(getPriorityColor("medium")).toBe("bg-yellow-100 text-yellow-800");
        expect(getPriorityColor("low")).toBe("bg-blue-100 text-blue-800");
      });
    });

    describe("getStatusColor", () => {
      it("should return correct color classes for each status", () => {
        expect(getStatusColor("completed")).toBe("bg-green-100 text-green-800");
        expect(getStatusColor("failed")).toBe("bg-red-100 text-red-800");
        expect(getStatusColor("in_progress")).toBe("bg-blue-100 text-blue-800");
        expect(getStatusColor("pending")).toBe("bg-gray-100 text-gray-800");
      });
    });

    describe("formatInvestigationTime", () => {
      it("should format time correctly", () => {
        const time = "2024-01-01T12:00:00Z";
        const result = formatInvestigationTime(time);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("should return formatted date for invalid time", () => {
        const result = formatInvestigationTime("invalid-time");
        expect(result).toBe("Invalid Date");
      });
    });

    describe("status checkers", () => {
      it("isInvestigationRunning should return true for active status", () => {
        expect(isInvestigationRunning("active")).toBe(true);
        expect(isInvestigationRunning("completed")).toBe(false);
        expect(isInvestigationRunning("failed")).toBe(false);
      });

      it("isInvestigationCompleted should return true for completed statuses", () => {
        expect(isInvestigationCompleted("completed")).toBe(true);
        expect(isInvestigationCompleted("active")).toBe(false);
      });

      it("isInvestigationFailed should return true for failed statuses", () => {
        expect(isInvestigationFailed("failed")).toBe(true);
        expect(isInvestigationFailed("timeout")).toBe(true);
        expect(isInvestigationFailed("error")).toBe(true);
        expect(isInvestigationFailed("completed")).toBe(false);
      });
    });
  });

  describe("getUserInvestigations", () => {
    it("should fetch user investigations successfully", async () => {
      const result = await getUserInvestigations(10);
      expect(Array.isArray(result)).toBe(true);
      expect(pb.collection).toHaveBeenCalledWith("investigations");
    });
  });

  describe("getInvestigationsPaginated", () => {
    it("should handle basic function structure", async () => {
      const result = await getInvestigationsPaginated(1, 10);
      expect(result.investigations).toEqual([]);
      expect(pb.collection).toHaveBeenCalledWith("investigations");
    });
  });
});
