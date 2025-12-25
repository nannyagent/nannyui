import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPatchStatus,
  runPatchCheck,
  applyPatches,
  getPatchHistory,
  checkAgentWebSocketConnection,
  triggerAgentReboot,
  saveCronSchedule,
  getPackageExceptions,
  addPackageException,
  removePackageException,
} from "./patchManagementService";
import { pb } from "@/lib/pocketbase";

// Mock dependencies
vi.mock("@/lib/pocketbase", () => {
  const defaultCollection = {
    getList: vi.fn().mockResolvedValue({
      items: [],
      totalItems: 0,
      page: 1,
      perPage: 10,
      totalPages: 0,
    }),
    getOne: vi.fn().mockResolvedValue({
      id: "record-123",
      status: "completed",
      created: "2023-01-01",
      updated: "2023-01-01",
    }),
    create: vi.fn().mockResolvedValue({
      id: "new-record-123",
      status: "pending",
    }),
    update: vi.fn().mockResolvedValue({
      id: "record-123",
    }),
    delete: vi.fn().mockResolvedValue(true),
  };

  return {
    pb: {
      authStore: {
        model: { id: "user-123" },
        isValid: true,
      },
      collection: vi.fn((name) => {
        if (name === 'agents') {
          return {
            ...defaultCollection,
            getOne: vi.fn().mockResolvedValue({
              id: "agent-123",
              platform_family: "debian",
            }),
          };
        }
        if (name === 'scripts') {
          return {
            ...defaultCollection,
            getList: vi.fn().mockResolvedValue({
              items: [{ id: "script-123" }],
              totalItems: 1,
            }),
          };
        }
        return defaultCollection;
      }),
      files: {
        getUrl: vi.fn().mockReturnValue("http://localhost:8090/api/files/..."),
      },
    },
  };
});

global.fetch = vi.fn();

describe("patchManagementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPatchStatus", () => {
    it("should return patch status when found", async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [{
          id: "op-123",
          stdout_file: "output.json",
          created: "2023-01-01",
        }],
      });

      (pb.collection as any).mockReturnValueOnce({
        getList: mockGetList,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: [] }),
      });

      const result = await getPatchStatus("agent-123");
      expect(result).not.toBeNull();
      expect(result?.last_checked).toBe("2023-01-01");
      expect(mockGetList).toHaveBeenCalledWith(1, 1, {
        sort: "-id",
        filter: 'agent_id = "agent-123" && mode = "dry-run" && status = "completed"',
      });
    });

    it("should return null when no operation found", async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [],
      });

      (pb.collection as any).mockReturnValueOnce({
        getList: mockGetList,
      });

      const result = await getPatchStatus("agent-123");
      expect(result).toBeNull();
    });
  });

  describe("runPatchCheck", () => {
    it("should create check operation", async () => {
      const result = await runPatchCheck("agent-123");
      expect(result).toBe("new-record-123");
      expect(pb.collection("patch_operations").create).toHaveBeenCalledWith({
        agent_id: "agent-123",
        user_id: "user-123",
        script_id: "script-123",
        mode: "dry-run",
        status: "pending",
      });
    });
  });

  describe("applyPatches", () => {
    it("should create update operation", async () => {
      const result = await applyPatches("agent-123", ["pkg1"]);
      expect(result).toBe("new-record-123");
      expect(pb.collection("patch_operations").create).toHaveBeenCalledWith({
        agent_id: "agent-123",
        user_id: "user-123",
        script_id: "script-123",
        mode: "apply",
        status: "pending",
        metadata: {
          packages: ["pkg1"],
        },
      });
    });
  });

  describe("getPatchHistory", () => {
    it("should return history", async () => {
      const result = await getPatchHistory("agent-123");
      expect(result).toEqual([]);
      expect(pb.collection).toHaveBeenCalledWith("patch_operations");
    });
  });

  describe("checkAgentWebSocketConnection", () => {
    it("should return true always", async () => {
      const result = await checkAgentWebSocketConnection("agent-123");
      expect(result).toBe(true);
    });
  });

  describe("triggerAgentReboot", () => {
    it("should create reboot command", async () => {
      const result = await triggerAgentReboot("agent-123");
      expect(result).toBe(true);
      expect(pb.collection).toHaveBeenCalledWith("agent_commands");
    });
  });

  describe("saveCronSchedule", () => {
    it("should create new schedule if not exists", async () => {
      (pb.collection as any).mockReturnValueOnce({
        getList: vi.fn().mockResolvedValue({
          items: [],
        }),
        create: vi.fn().mockResolvedValue({}),
      });

      const result = await saveCronSchedule("agent-123", "0 0 * * *");
      expect(result).toBe(true);
      expect(pb.collection).toHaveBeenCalledWith("patch_schedules");
    });

    it("should update existing schedule", async () => {
      (pb.collection as any).mockReturnValueOnce({
        getList: vi.fn().mockResolvedValue({
          items: [{ id: "sched-123" }],
        }),
        update: vi.fn().mockResolvedValue({}),
      });

      const result = await saveCronSchedule("agent-123", "0 0 * * *");
      expect(result).toBe(true);
    });
  });

  describe("package exceptions", () => {
    it("should get exceptions", async () => {
      const result = await getPackageExceptions("agent-123");
      expect(result).toEqual([]);
    });

    it("should add exception", async () => {
      const result = await addPackageException("agent-123", "pkg1", "reason");
      expect(result).not.toBeNull();
    });

    it("should remove exception", async () => {
      const result = await removePackageException("exc-123");
      expect(result).toBe(true);
    });
  });
});
