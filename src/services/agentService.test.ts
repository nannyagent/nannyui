import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAgents,
  fetchAgentMetrics,
  getAgentDetails,
  deleteAgent,
  updateAgent,
  createAgent,
  getAgentStats,
} from './agentService';
import { mockAgent } from '@/test-utils/mock-data';
import { pb } from '@/lib/pocketbase';

// Mock PocketBase
vi.mock('@/lib/pocketbase', () => {
  const collectionMock = {
    getList: vi.fn(),
    getFullList: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return {
    pb: {
      authStore: {
        model: { id: 'user-123' },
        isValid: true,
      },
      collection: vi.fn(() => collectionMock),
    },
  };
});

describe('agentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pb.authStore as any).model = { id: 'user-123' };
  });

  describe('getAgents', () => {
    it('should fetch all agents successfully', async () => {
      const mockData = [{ ...mockAgent, created: mockAgent.created_at, updated: mockAgent.updated_at }];
      (pb.collection('agents').getFullList as any).mockResolvedValue(mockData);

      const result = await getAgents();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockAgent.id);
      expect(pb.collection).toHaveBeenCalledWith('agents');
      expect(pb.collection('agents').getFullList).toHaveBeenCalledWith({
        sort: '-id',
        filter: 'user_id = "user-123"',
      });
    });

    it('should return empty array on error', async () => {
      (pb.collection('agents').getFullList as any).mockRejectedValue(new Error('Fetch error'));

      const result = await getAgents();

      expect(result).toEqual([]);
    });
  });

  describe('createAgent', () => {
    it('should create agent successfully', async () => {
      const newAgent = { ...mockAgent, created: mockAgent.created_at, updated: mockAgent.updated_at };
      (pb.collection('agents').create as any).mockResolvedValue(newAgent);

      const result = await createAgent(mockAgent);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(pb.collection).toHaveBeenCalledWith('agents');
    });

    it('should handle create error', async () => {
      (pb.collection('agents').create as any).mockRejectedValue(new Error('Create error'));

      const result = await createAgent(mockAgent);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('updateAgent', () => {
    it('should update agent successfully', async () => {
      const updatedAgent = { ...mockAgent, hostname: 'updated-host', created: mockAgent.created_at, updated: mockAgent.updated_at };
      (pb.collection('agents').update as any).mockResolvedValue(updatedAgent);

      const result = await updateAgent(mockAgent.id, { hostname: 'updated-host' });

      expect(result.data?.hostname).toBe('updated-host');
      expect(result.error).toBeNull();
      expect(pb.collection).toHaveBeenCalledWith('agents');
    });
  });

  describe('deleteAgent', () => {
    it('should delete agent successfully', async () => {
      (pb.collection('agents').delete as any).mockResolvedValue(true);

      const result = await deleteAgent(mockAgent.id);

      expect(result.error).toBeNull();
      expect(pb.collection).toHaveBeenCalledWith('agents');
    });
  });

  describe('fetchAgentMetrics', () => {
    it('should fetch metrics successfully', async () => {
      const mockMetrics = {
        items: [
          { id: 'm1', agent_id: mockAgent.id, cpu_percent: 10, created: '2023-01-01' }
        ]
      };
      (pb.collection('agent_metrics').getList as any).mockResolvedValue(mockMetrics);

      const result = await fetchAgentMetrics(mockAgent.id);

      expect(result).toHaveLength(1);
      expect(result[0].cpu_percent).toBe(10);
      expect(pb.collection).toHaveBeenCalledWith('agent_metrics');
    });
  });

  describe('getAgentStats', () => {
    it('should calculate stats correctly', async () => {
      const now = new Date();
      const activeTime = now.toISOString();
      const inactiveTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 mins ago

      const mockAgents = [
        { ...mockAgent, last_seen: activeTime, created: '2023-01-01', updated: '2023-01-01' },
        { ...mockAgent, id: '2', last_seen: inactiveTime, created: '2023-01-01', updated: '2023-01-01' }
      ];
      (pb.collection('agents').getFullList as any).mockResolvedValue(mockAgents);

      const stats = await getAgentStats();

      expect(stats.total).toBe(2);
      expect(stats.online).toBe(2);
      expect(stats.offline).toBe(0);
    });
  });
});
