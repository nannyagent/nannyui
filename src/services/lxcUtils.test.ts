import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProxmoxLxcId } from './lxcUtils';
import { pb } from '@/lib/pocketbase';

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
      getList: vi.fn().mockResolvedValue({
        items: [],
        totalItems: 0,
      }),
    })),
  },
}));

describe('lxcUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProxmoxLxcId', () => {
    it('should return proxmox lxc id when found', async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [{ id: 'proxmox-lxc-123' }],
      });

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: mockGetList,
      });

      const result = await getProxmoxLxcId('agent-123', 'lxc-456');
      expect(result).toBe('proxmox-lxc-123');
      expect(pb.collection).toHaveBeenCalledWith('proxmox_lxc');
    });

    it('should return null when not found', async () => {
      const mockGetList = vi.fn().mockResolvedValue({
        items: [],
      });

      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: mockGetList,
      });

      const result = await getProxmoxLxcId('agent-123', 'lxc-456');
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: vi.fn().mockRejectedValue(new Error('Network error')),
      });

      const result = await getProxmoxLxcId('agent-123', 'lxc-456');
      expect(result).toBeNull();
    });

    it('should use pb.filter for safe query construction', async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [] });
      (pb.collection as ReturnType<typeof vi.fn>).mockReturnValue({
        getList: mockGetList,
      });

      await getProxmoxLxcId('agent-123', 'lxc-456');
      
      expect(pb.filter).toHaveBeenCalledWith(
        'agent_id = {:agentId} && lxc_id = {:lxcId}',
        { agentId: 'agent-123', lxcId: 'lxc-456' }
      );
    });
  });
});
