import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createRebootOperation,
  getRebootOperation,
  getRebootHistory,
  listAllRebootOperations,
  getRebootSchedules,
  saveRebootSchedule,
  deleteRebootSchedule,
  toggleRebootSchedule,
  listAllRebootSchedules,
  checkAgentRebootStatus,
  triggerAgentReboot,
} from "./rebootService";
import { getProxmoxLxcId } from "./lxcUtils";
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
      filter: vi.fn((expr, params) => {
        let res = expr;
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            res = res.replace(new RegExp(`{:\\s*${key}}`, "g"), `"${value}"`);
          });
        }
        return res;
      }),
      collection: vi.fn(() => defaultCollection),
    },
  };
});

describe("rebootService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProxmoxLxcId", () => {
    it("should return proxmox lxc id when found", async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [{ id: "proxmox-lxc-123" }],
      });

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        getList: mockGetList,
      });

      const result = await getProxmoxLxcId("agent-123", "lxc-456");
      expect(result).toBe("proxmox-lxc-123");
    });

    it("should return null when not found", async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [],
      });

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        getList: mockGetList,
      });

      const result = await getProxmoxLxcId("agent-123", "lxc-456");
      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await getProxmoxLxcId("agent-123", "lxc-456");
      expect(result).toBeNull();
    });
  });

  describe("createRebootOperation", () => {
    it("should create reboot operation", async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        id: "reboot-123",
        status: "pending",
      });

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        create: mockCreate,
      });

      const result = await createRebootOperation("agent-123", "Test reason");
      expect(result).toEqual({
        rebootId: "reboot-123",
        status: "pending",
      });
      expect(pb.collection).toHaveBeenCalledWith("reboot_operations");
    });

    it("should create reboot operation with lxc", async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [{ id: "proxmox-lxc-123" }],
      });
      const mockCreate = vi.fn().mockResolvedValue({
        id: "reboot-123",
        status: "pending",
      });

      (pb.collection as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ getList: mockGetList })
        .mockReturnValueOnce({ create: mockCreate });

      const result = await createRebootOperation("agent-123", "Test reason", "lxc-456");
      expect(result).toEqual({
        rebootId: "reboot-123",
        status: "pending",
      });
    });

    it("should throw error when user not authenticated", async () => {
      const originalRecord = pb.authStore.record;
      (pb.authStore as { record: null | { id: string } }).record = null;

      await expect(createRebootOperation("agent-123", "reason")).rejects.toThrow(
        "User not authenticated"
      );

      (pb.authStore as { record: null | { id: string } }).record = originalRecord;
    });
  });

  describe("getRebootOperation", () => {
    it("should return reboot operation", async () => {
      const mockGetOne = vi.fn().mockResolvedValue({
        id: "reboot-123",
        status: "completed",
        created: "2023-01-01",
        updated: "2023-01-01",
      });

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getOne: mockGetOne,
      });

      const result = await getRebootOperation("reboot-123");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("reboot-123");
    });

    it("should return null on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getOne: vi.fn().mockRejectedValue(new Error("Not found")),
      });

      const result = await getRebootOperation("invalid-id");
      expect(result).toBeNull();
    });
  });

  describe("getRebootHistory", () => {
    it("should return reboot history for agent", async () => {
      const mockItems = [
        { id: "reboot-1", status: "completed", created: "2023-01-01", updated: "2023-01-01" },
        { id: "reboot-2", status: "failed", created: "2023-01-02", updated: "2023-01-02" },
      ];

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: mockItems }),
      });

      const result = await getRebootHistory("agent-123");
      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await getRebootHistory("agent-123");
      expect(result).toEqual([]);
    });

    it("should filter by lxc when provided", async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [] });
      
      (pb.collection as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ getList: vi.fn().mockResolvedValue({ items: [{ id: "proxmox-lxc-123" }] }) })
        .mockReturnValueOnce({ getList: mockGetList });

      await getRebootHistory("agent-123", 10, "lxc-456");
      expect(mockGetList).toHaveBeenCalled();
    });
  });

  describe("listAllRebootOperations", () => {
    it("should return paginated operations", async () => {
      const mockItems = [
        { id: "reboot-1", status: "completed", created: "2023-01-01", updated: "2023-01-01", expand: { agent_id: { hostname: "host-1" } } },
      ];

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: mockItems, totalItems: 1 }),
      });

      const result = await listAllRebootOperations(1, 10);
      expect(result.operations).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should return empty on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await listAllRebootOperations();
      expect(result).toEqual({ operations: [], total: 0 });
    });
  });

  describe("getRebootSchedules", () => {
    it("should return schedules for agent", async () => {
      const mockItems = [
        { id: "sched-1", cron_expression: "0 0 * * *", is_active: true },
      ];

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: mockItems }),
      });

      const result = await getRebootSchedules("agent-123");
      expect(result).toHaveLength(1);
    });

    it("should return empty array on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await getRebootSchedules("agent-123");
      expect(result).toEqual([]);
    });
  });

  describe("saveRebootSchedule", () => {
    it("should create new schedule when not exists", async () => {
      const createMock = vi.fn().mockResolvedValue({});
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: [] }),
        create: createMock,
      });

      const result = await saveRebootSchedule("agent-123", "0 0 * * *", "Test reason", true);
      expect(result).toBe(true);
      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        agent_id: "agent-123",
        cron_expression: "0 0 * * *",
        reason: "Test reason",
        is_active: true,
        user_id: "user-123",
      }));
    });

    it("should update existing schedule", async () => {
      const updateMock = vi.fn().mockResolvedValue({});
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: [{ id: "sched-123" }] }),
        update: updateMock,
      });

      const result = await saveRebootSchedule("agent-123", "0 0 * * *", "Updated reason", false);
      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith("sched-123", expect.objectContaining({
        cron_expression: "0 0 * * *",
        reason: "Updated reason",
        is_active: false,
      }));
    });

    it("should return false on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await saveRebootSchedule("agent-123", "0 0 * * *");
      expect(result).toBe(false);
    });
  });

  describe("deleteRebootSchedule", () => {
    it("should delete schedule", async () => {
      const deleteMock = vi.fn().mockResolvedValue(true);
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: deleteMock,
      });

      const result = await deleteRebootSchedule("sched-123");
      expect(result).toBe(true);
      expect(deleteMock).toHaveBeenCalledWith("sched-123");
    });

    it("should return false on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: vi.fn().mockRejectedValue(new Error("Not found")),
      });

      const result = await deleteRebootSchedule("invalid-id");
      expect(result).toBe(false);
    });
  });

  describe("toggleRebootSchedule", () => {
    it("should toggle schedule active state", async () => {
      const updateMock = vi.fn().mockResolvedValue({});
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        update: updateMock,
      });

      const result = await toggleRebootSchedule("sched-123", false);
      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith("sched-123", { is_active: false });
    });

    it("should return false on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockRejectedValue(new Error("Not found")),
      });

      const result = await toggleRebootSchedule("invalid-id", true);
      expect(result).toBe(false);
    });
  });

  describe("listAllRebootSchedules", () => {
    it("should return paginated schedules", async () => {
      const mockItems = [
        { id: "sched-1", cron_expression: "0 0 * * *", is_active: true, expand: { agent_id: { hostname: "host-1" } } },
      ];

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockResolvedValue({ items: mockItems, totalItems: 1 }),
      });

      const result = await listAllRebootSchedules(1, 10);
      expect(result.schedules).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should return empty on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await listAllRebootSchedules();
      expect(result).toEqual({ schedules: [], total: 0 });
    });
  });

  describe("checkAgentRebootStatus", () => {
    it("should return true when agent connected", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getOne: vi.fn().mockResolvedValue({ websocket_connected: true }),
      });

      const result = await checkAgentRebootStatus("agent-123");
      expect(result).toBe(true);
    });

    it("should return false when agent disconnected", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getOne: vi.fn().mockResolvedValue({ websocket_connected: false }),
      });

      const result = await checkAgentRebootStatus("agent-123");
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getOne: vi.fn().mockRejectedValue(new Error("Not found")),
      });

      const result = await checkAgentRebootStatus("invalid-id");
      expect(result).toBe(false);
    });
  });

  describe("triggerAgentReboot", () => {
    it("should trigger reboot and return true", async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        create: vi.fn().mockResolvedValue({ id: "reboot-123", status: "pending" }),
      });

      const result = await triggerAgentReboot("agent-123", "Test reason");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      const originalRecord = pb.authStore.record;
      (pb.authStore as { record: null | { id: string } }).record = null;

      const result = await triggerAgentReboot("agent-123");
      expect(result).toBe(false);

      (pb.authStore as { record: null | { id: string } }).record = originalRecord;
    });
  });
});
