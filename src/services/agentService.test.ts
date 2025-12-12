import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAgents,
  getAgentsPaginated,
  fetchAgentMetrics,
  getAgentDetails,
  deleteAgent,
  updateAgent,
  createAgent,
  getAgentStats,
} from './agentService';
import { supabase } from '@/lib/supabase';
import { mockAgent } from '@/test-utils/mock-data';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

describe('agentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgents', () => {
    it('should fetch all agents successfully', async () => {
      const mockData = [mockAgent];
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgents();

      expect(result).toEqual(mockData);
      expect(mockFrom).toHaveBeenCalledWith('agents');
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgents();

      expect(result).toEqual([]);
    });

    it('should handle exceptions', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(new Error('Network error')),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgents();

      expect(result).toEqual([]);
    });
  });

  describe('fetchAgentMetrics', () => {
    it('should fetch agent metrics successfully', async () => {
      const mockMetrics = [
        {
          agent_id: mockAgent.id,
          recorded_at: '2024-01-01T00:00:00Z',
          cpu_percent: 45.5,
          memory_mb: 2048,
          disk_percent: 65.3,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockMetrics,
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await fetchAgentMetrics(mockAgent.id, 5);

      expect(result).toEqual(mockMetrics);
      expect(mockFrom).toHaveBeenCalledWith('agent_metrics');
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Error' },
              }),
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await fetchAgentMetrics(mockAgent.id);

      expect(result).toEqual([]);
    });
  });

  describe('getAgentDetails', () => {
    it('should fetch agent details with metrics', async () => {
      const mockMetrics = [
        {
          agent_id: mockAgent.id,
          recorded_at: '2024-01-01T00:00:00Z',
          cpu_percent: 45.5,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockMetrics,
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgentDetails(mockAgent);

      expect(result.id).toBe(mockAgent.id);
      expect(result.metrics).toEqual(mockMetrics);
    });

    it('should handle errors when fetching details', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Error' },
              }),
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgentDetails(mockAgent);

      expect(result.id).toBe(mockAgent.id);
      expect(result.metrics).toEqual([]);
    });
  });

  describe('deleteAgent', () => {
    it('should delete agent successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await deleteAgent(mockAgent.id);

      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('agents');
    });

    it('should return error when delete fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await deleteAgent(mockAgent.id);

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Delete failed');
    });
  });

  describe('updateAgent', () => {
    it('should update agent successfully', async () => {
      const updates = { name: 'Updated Agent', status: 'active' as const };
      const updatedAgent = { ...mockAgent, ...updates };

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedAgent,
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await updateAgent(mockAgent.id, updates);

      expect(result.data?.name).toBe('Updated Agent');
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('agents');
    });

    it('should return error when update fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await updateAgent(mockAgent.id, { name: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Update failed');
    });
  });

  describe('getAgentStats', () => {
    it('should fetch agent stats successfully', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        offline: 2,
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [mockAgent, mockAgent],
          error: null,
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgentStats();

      expect(result).toBeDefined();
      expect(mockFrom).toHaveBeenCalledWith('agents');
    });

    it('should handle errors when fetching stats', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Stats error' },
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAgentStats();

      expect(result).toBeDefined();
    });
  });

  describe('createAgent', () => {
    it('should create agent successfully', async () => {
      const newAgent = {
        name: 'New Agent',
        status: 'pending' as const,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...newAgent, id: '2', created_at: '2024-01-01' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await createAgent(newAgent);

      expect(result.data?.name).toBe(newAgent.name);
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('agents');
    });

    it('should return error when creation fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' },
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await createAgent({ name: 'Test', status: 'pending' });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
