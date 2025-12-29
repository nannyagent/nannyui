import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProxmoxCluster, getProxmoxNodes, getProxmoxLxcs, getProxmoxQemus } from './proxmoxService';
import { pb } from '@/lib/pocketbase';

// Mock the pocketbase client
vi.mock('@/lib/pocketbase', () => ({
  pb: {
    filter: vi.fn((expr, params) => {
      let res = expr;
      if (params) {
          Object.entries(params).forEach(([key, value]) => {
              res = res.replace(new RegExp(`{:\\s*${key}}`, 'g'), `"${value}"`);
          });
      }
      return res;
    }),
    collection: vi.fn(() => ({
      getList: vi.fn(),
      getFullList: vi.fn(),
    })),
  },
}));

describe('proxmoxService', () => {
  const mockAgentId = 'agent-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProxmoxCluster', () => {
    it('should return cluster data when found', async () => {
      const mockNode = { cluster_id: 'cluster-123' };
      const mockCluster = { id: 'cluster-rec-1', px_cluster_id: 'cluster-123', cluster_name: 'pve-cluster' };

      // Mock getting node
      const getListMock = vi.fn()
        .mockResolvedValueOnce({ items: [mockNode] }) // First call for node
        .mockResolvedValueOnce({ items: [mockCluster] }); // Second call for cluster

      (pb.collection as any).mockReturnValue({ getList: getListMock });

      const result = await getProxmoxCluster(mockAgentId);

      expect(pb.collection).toHaveBeenCalledWith('proxmox_nodes');
      expect(pb.collection).toHaveBeenCalledWith('proxmox_cluster');
      expect(getListMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCluster);
    });

    it('should return null if no nodes found', async () => {
      const getListMock = vi.fn().mockResolvedValueOnce({ items: [] });
      (pb.collection as any).mockReturnValue({ getList: getListMock });

      const result = await getProxmoxCluster(mockAgentId);

      expect(result).toBeNull();
      expect(getListMock).toHaveBeenCalledTimes(1);
    });

    it('should return null if node has no cluster_id', async () => {
      const mockNode = { cluster_id: null };
      const getListMock = vi.fn().mockResolvedValueOnce({ items: [mockNode] });
      (pb.collection as any).mockReturnValue({ getList: getListMock });

      const result = await getProxmoxCluster(mockAgentId);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const getListMock = vi.fn().mockRejectedValue(new Error('DB Error'));
      (pb.collection as any).mockReturnValue({ getList: getListMock });

      const result = await getProxmoxCluster(mockAgentId);

      expect(result).toBeNull();
    });
  });

  describe('getProxmoxNodes', () => {
    it('should return nodes list', async () => {
      const mockNodes = [{ id: 'node-1', name: 'pve1' }, { id: 'node-2', name: 'pve2' }];
      const getFullListMock = vi.fn().mockResolvedValue(mockNodes);
      (pb.collection as any).mockReturnValue({ getFullList: getFullListMock });

      const result = await getProxmoxNodes(mockAgentId);

      expect(pb.collection).toHaveBeenCalledWith('proxmox_nodes');
      expect(getFullListMock).toHaveBeenCalledWith({
        filter: `agent_id = "${mockAgentId}"`,
        sort: 'name',
      });
      expect(result).toEqual(mockNodes);
    });

    it('should return empty array on error', async () => {
      const getFullListMock = vi.fn().mockRejectedValue(new Error('DB Error'));
      (pb.collection as any).mockReturnValue({ getFullList: getFullListMock });

      const result = await getProxmoxNodes(mockAgentId);

      expect(result).toEqual([]);
    });
  });

  describe('getProxmoxLxcs', () => {
    it('should return lxcs list', async () => {
      const mockLxcs = [{ id: 'lxc-1', vmid: 100 }, { id: 'lxc-2', vmid: 101 }];
      const getFullListMock = vi.fn().mockResolvedValue(mockLxcs);
      (pb.collection as any).mockReturnValue({ getFullList: getFullListMock });

      const result = await getProxmoxLxcs(mockAgentId);

      expect(pb.collection).toHaveBeenCalledWith('proxmox_lxc');
      expect(getFullListMock).toHaveBeenCalledWith({
        filter: `agent_id = "${mockAgentId}"`,
        sort: 'vmid',
      });
      expect(result).toEqual(mockLxcs);
    });

    it('should return empty array on error', async () => {
      const getFullListMock = vi.fn().mockRejectedValue(new Error('DB Error'));
      (pb.collection as any).mockReturnValue({ getFullList: getFullListMock });

      const result = await getProxmoxLxcs(mockAgentId);

      expect(result).toEqual([]);
    });
  });

  describe('getProxmoxQemus', () => {
    it('should return qemus list', async () => {
      const mockQemus = [{ id: 'vm-1', vmid: 200 }, { id: 'vm-2', vmid: 201 }];
      const getFullListMock = vi.fn().mockResolvedValue(mockQemus);
      (pb.collection as any).mockReturnValue({ getFullList: getFullListMock });

      const result = await getProxmoxQemus(mockAgentId);

      expect(pb.collection).toHaveBeenCalledWith('proxmox_qemu');
      expect(getFullListMock).toHaveBeenCalledWith({
        filter: `agent_id = "${mockAgentId}"`,
        sort: 'vmid',
      });
      expect(result).toEqual(mockQemus);
    });

    it('should return empty array on error', async () => {
      const getFullListMock = vi.fn().mockRejectedValue(new Error('DB Error'));
      (pb.collection as any).mockReturnValue({ getFullList: getFullListMock });

      const result = await getProxmoxQemus(mockAgentId);

      expect(result).toEqual([]);
    });
  });
});
