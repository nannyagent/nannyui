import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats, getTokenStats } from '../statsService';
import { supabase } from '@/lib/supabase';
import * as agentService from '../agentService';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock agentService
vi.mock('../agentService', () => ({
  getAgentStats: vi.fn(),
}));

describe('statsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockAgentStats = { total: 10, active: 8, offline: 2 };
      
      vi.mocked(agentService.getAgentStats).mockResolvedValue(mockAgentStats);
      
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          count: 5,
          error: null,
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getDashboardStats();

      expect(result.totalAgents).toBe(10);
      expect(result.activeTokens).toBe(5);
      expect(result.totalUsers).toBe(5);
      expect(result.uptime).toBe('99.9%');
    });

    it('should handle table not existing error gracefully', async () => {
      const mockAgentStats = { total: 5, active: 3, offline: 2 };
      
      vi.mocked(agentService.getAgentStats).mockResolvedValue(mockAgentStats);
      
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          count: null,
          error: {
            code: 'PGRST116',
            message: 'Table does not exist',
          },
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getDashboardStats();

      expect(result.totalAgents).toBe(5);
      expect(result.activeTokens).toBe(0);
      expect(result.totalUsers).toBe(0);
    });

    it('should handle errors and return default values', async () => {
      vi.mocked(agentService.getAgentStats).mockRejectedValue(new Error('Database error'));

      const result = await getDashboardStats();

      expect(result.totalAgents).toBe(0);
      expect(result.activeTokens).toBe(0);
      expect(result.totalUsers).toBe(0);
      expect(result.uptime).toBe('N/A');
    });
  });

  describe('getTokenStats', () => {
    it('should fetch token stats successfully', async () => {
      const mockTokens = [
        { id: '1', active: true },
        { id: '2', active: true },
        { id: '3', active: false },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockTokens,
          error: null,
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getTokenStats();

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.expired).toBe(1);
    });

    it('should filter by userId when provided', async () => {
      const mockTokens = [{ id: '1', active: true }];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockTokens,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getTokenStats('user-123');

      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.total).toBe(1);
      expect(result.active).toBe(1);
    });

    it('should handle errors and return default values', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getTokenStats();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.expired).toBe(0);
    });

    it('should handle exceptions gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Network error')),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getTokenStats();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.expired).toBe(0);
    });
  });
});
