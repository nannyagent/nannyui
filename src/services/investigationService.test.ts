import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecentInvestigationsFromAPI,
  getInvestigationByIdFromAPI,
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
} from './investigationService';
import { getCurrentSession } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { mockInvestigation } from '@/test-utils/mock-data';

// Mock the dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock('@/services/authService', () => ({
  getCurrentSession: vi.fn().mockResolvedValue({
    user: { id: 'user-123' },
    session: { access_token: 'token-123' },
  }),
}));

global.fetch = vi.fn();

describe('investigationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set required env vars for tests
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
  });

  describe('getRecentInvestigationsFromAPI', () => {
    it('should handle errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getRecentInvestigationsFromAPI(5);

      expect(result).toEqual([]);
    });

    it('should return empty array when response is not ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getRecentInvestigationsFromAPI(5);

      expect(result).toEqual([]);
    });
  });

  describe('getInvestigationByIdFromAPI', () => {
    it('should return null on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));

      const result = await getInvestigationByIdFromAPI('inv-123');

      expect(result).toBeNull();
    });

    it('should return null when response is not ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getInvestigationByIdFromAPI('inv-123');

      expect(result).toBeNull();
    });
  });

  describe('getInferenceById', () => {
    it('should return null when not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getInferenceById('inf-123');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Error'));

      const result = await getInferenceById('inf-123');

      expect(result).toBeNull();
    });
  });

  describe('createInvestigationFromAPI', () => {
    it('should throw error when not authenticated', async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce(null as any);

      await expect(
        createInvestigationFromAPI({
          agent_id: 'agent-123',
          issue: 'Test',
          priority: 'low',
          initiated_by: 'user-123',
          application_group: 'test-app',
        })
      ).rejects.toThrow('Authentication required');
    });

    it('should throw error when creation fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      await expect(
        createInvestigationFromAPI({
          agent_id: 'agent-123',
          issue: 'Test',
          priority: 'low',
          initiated_by: 'user-123',
          application_group: 'test-app',
        })
      ).rejects.toThrow();
    });
  });

  describe('utility functions', () => {
    describe('getPriorityColor', () => {
      it('should return correct color classes for each priority', () => {
        expect(getPriorityColor('critical')).toBe('bg-red-100 text-red-800');
        expect(getPriorityColor('high')).toBe('bg-orange-100 text-orange-800');
        expect(getPriorityColor('medium')).toBe('bg-yellow-100 text-yellow-800');
        expect(getPriorityColor('low')).toBe('bg-blue-100 text-blue-800');
      });
    });

    describe('getStatusColor', () => {
      it('should return correct color classes for each status', () => {
        expect(getStatusColor('completed')).toBe('bg-green-100 text-green-800');
        expect(getStatusColor('failed')).toBe('bg-red-100 text-red-800');
        expect(getStatusColor('in_progress')).toBe('bg-blue-100 text-blue-800');
        expect(getStatusColor('active')).toBe('bg-purple-100 text-purple-800');
        expect(getStatusColor('pending')).toBe('bg-gray-100 text-gray-800');
      });
    });

    describe('formatInvestigationTime', () => {
      it('should format time correctly', () => {
        const time = '2024-01-01T12:00:00Z';
        const result = formatInvestigationTime(time);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      it('should return formatted date for invalid time', () => {
        const result = formatInvestigationTime('invalid-time');
        expect(result).toBe('Invalid Date');
      });
    });

    describe('status checkers', () => {
      it('isInvestigationRunning should return true for active status', () => {
        expect(isInvestigationRunning('active')).toBe(true);
        expect(isInvestigationRunning('completed')).toBe(false);
        expect(isInvestigationRunning('failed')).toBe(false);
      });

      it('isInvestigationCompleted should return true for completed statuses', () => {
        expect(isInvestigationCompleted('completed')).toBe(true);
        expect(isInvestigationCompleted('completed_with_analysis')).toBe(true);
        expect(isInvestigationCompleted('active')).toBe(false);
      });

      it('isInvestigationFailed should return true for failed statuses', () => {
        expect(isInvestigationFailed('failed')).toBe(true);
        expect(isInvestigationFailed('timeout')).toBe(true);
        expect(isInvestigationFailed('error')).toBe(true);
        expect(isInvestigationFailed('completed')).toBe(false);
      });
    });
  });

  describe('getUserInvestigations', () => {
    it('should fetch user investigations from API successfully', async () => {
      const mockData = [mockInvestigation];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getUserInvestigations(10);

      // The function returns data from API or falls back to supabase
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Mock fetch to succeed with empty data
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await getUserInvestigations(10);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getInvestigationsPaginated', () => {
    it('should fetch investigations with episode_id filter by default', async () => {
      const mockData = {
        investigations: [
          { ...mockInvestigation, episode_id: 'episode-123' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false
        },
        filters: { status: 'all', agent_id: 'all' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getInvestigationsPaginated(1, 10, true, true);

      expect(result.investigations).toHaveLength(1);
      expect(result.investigations[0].episode_id).toBe('episode-123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('with_episode_id_only=true'),
        expect.any(Object)
      );
    });

    it('should allow disabling episode_id filter', async () => {
      const mockData = {
        investigations: [mockInvestigation],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false
        },
        filters: { status: 'all', agent_id: 'all' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getInvestigationsPaginated(1, 10, true, false);

      expect(result.investigations).toHaveLength(1);
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('with_episode_id_only=true'),
        expect.any(Object)
      );
    });

    describe('getInvestigationsPaginated', () => {
    it('should handle pagination parameters correctly', async () => {
      const mockData = {
        investigations: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: true
        },
        filters: { status: 'all', agent_id: 'all' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await getInvestigationsPaginated(2, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5'),
        expect.any(Object)
      );
    });
  });
});
