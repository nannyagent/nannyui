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
        record: { id: "user-123" },
        isValid: true,
      },
      files: {
        getURL: vi.fn().mockReturnValue("http://localhost/file.json"),
      },
      filter: vi.fn((expr, params) => {
        let res = expr;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                res = res.replace(new RegExp(`{:\\s*${key}}`, 'g'), `"${value}"`);
            });
        }
        return res;
      }),
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

    it("should create check operation with lxcId", async () => {
      const result = await runPatchCheck("agent-123", "lxc-123");
      expect(result).toBe("new-record-123");
      expect(pb.collection("patch_operations").create).toHaveBeenCalledWith({
        agent_id: "agent-123",
        user_id: "user-123",
        script_id: "script-123",
        mode: "dry-run",
        status: "pending",
        lxc_id: "lxc-123",
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

    it("should create update operation with lxcId", async () => {
      const result = await applyPatches("agent-123", ["pkg1"], "lxc-123");
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
        lxc_id: "lxc-123",
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
      const result = await checkAgentWebSocketConnection();
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
      const createMock = vi.fn().mockResolvedValue({});
      (pb.collection as any).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: [] }),
        create: createMock,
      });

      const result = await saveCronSchedule("agent-123", "0 0 * * *", true);
      expect(result).toBe(true);
      expect(createMock).toHaveBeenCalledWith({
        agent_id: "agent-123",
        cron_expression: "0 0 * * *",
        is_active: true,
      });
    });

    it("should update existing schedule", async () => {
      const updateMock = vi.fn().mockResolvedValue({});
      (pb.collection as any).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: [{ id: "sched-123" }] }),
        update: updateMock,
      });

      const result = await saveCronSchedule("agent-123", "0 0 * * *", false);
      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith("sched-123", {
        agent_id: "agent-123",
        cron_expression: "0 0 * * *",
        is_active: false,
      });
    });

    it("should handle lxcId", async () => {
      const createMock = vi.fn().mockResolvedValue({});
      (pb.collection as any).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: [] }),
        create: createMock,
      });

      const result = await saveCronSchedule("agent-123", "0 0 * * *", true, "lxc-123");
      expect(result).toBe(true);
      expect(createMock).toHaveBeenCalledWith({
        agent_id: "agent-123",
        cron_expression: "0 0 * * *",
        is_active: true,
        lxc_id: "lxc-123",
      });
    });
  });

  describe("getPackageExceptions", () => {
    it("should return exceptions", async () => {
      const mockExceptions = [{ id: "ex-1", package_name: "pkg1", is_active: true }];
      (pb.collection as any).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: mockExceptions }),
      });

      const result = await getPackageExceptions("agent-123");
      expect(result).toEqual(mockExceptions);
    });
  });

  describe("addPackageException", () => {
    it("should add exception", async () => {
      const createMock = vi.fn().mockResolvedValue({});
      (pb.collection as any).mockReturnValue({
        create: createMock,
      });

      const result = await addPackageException("agent-123", "pkg1", "reason", true);
      expect(result).toEqual({});
      expect(createMock).toHaveBeenCalledWith({
        agent_id: "agent-123",
        package_name: "pkg1",
        reason: "reason",
        user_id: "user-123",
        is_active: true,
      });
    });
  });

  describe("removePackageException", () => {
    it("should remove exception", async () => {
      const deleteMock = vi.fn().mockResolvedValue(true);
      (pb.collection as any).mockReturnValue({
        delete: deleteMock,
      });

      const result = await removePackageException("ex-123");
      expect(result).toBe(true);
      expect(deleteMock).toHaveBeenCalledWith("ex-123");
    });
  });
});
