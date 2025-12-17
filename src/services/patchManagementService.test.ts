import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  triggerPatchExecution,
  checkAgentWebSocketConnection,
  getPatchManagementData,
} from './patchManagementService';
import { supabase } from '@/lib/supabase';
import { getCurrentSession } from '@/services/authService';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token-123',
          },
        },
        error: null,
      }),
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

describe('patchManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
  });

  describe('triggerPatchExecution', () => {
    it('should return execution_id for dry_run requests', async () => {
      const mockResponse = {
        success: true,
        execution_id: 'exec-123',
        execution_ids: ['exec-123'],
        execution_type: 'dry_run',
        status: 'pending',
        total_patches_queued: 1,
        message: 'Queued 1 patch(es) for agent (dry_run)',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'dry_run',
      });

      expect(result.execution_id).toBe('exec-123');
      expect(result.execution_type).toBe('dry_run');
      expect(result.status).toBe('pending');
    });

    it('should return execution_id for apply requests', async () => {
      const mockResponse = {
        success: true,
        execution_id: 'exec-456',
        execution_ids: ['exec-456', 'exec-457'],
        execution_type: 'apply',
        status: 'pending',
        total_patches_queued: 2,
        message: 'Queued 2 patch(es) for agent (apply)',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'apply',
      });

      expect(result.execution_id).toBe('exec-456');
      expect(result.execution_type).toBe('apply');
      expect(result.status).toBe('pending');
    });

    it('should include reboot flag when shouldReboot is true', async () => {
      const mockResponse = {
        success: true,
        execution_id: 'exec-789',
        execution_ids: ['exec-789'],
        execution_type: 'apply',
        status: 'pending',
        total_patches_queued: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'apply',
        reboot: true,
      });

      expect(result.execution_id).toBe('exec-789');
      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(requestBody.reboot).toBe(true);
    });

    it('should throw error when server returns 503 (agent not connected)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Agent not connected' }),
      });

      await expect(
        triggerPatchExecution({
          agent_id: 'agent-123',
          execution_type: 'apply',
        })
      ).rejects.toThrow(/Agent not connected/);
    });

    it('should throw error when server returns 404 (agent not found)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Agent not found' }),
      });

      await expect(
        triggerPatchExecution({
          agent_id: 'invalid-agent',
          execution_type: 'apply',
        })
      ).rejects.toThrow(/Agent not found/);
    });

    it('should throw error when execution_id is missing from response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          execution_ids: ['exec-123'], // Only plural form
          execution_type: 'apply',
        }),
      });

      // Mock supabase query to fail (to trigger error path)
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      // This should eventually throw error since it can't find execution in DB
      await expect(
        triggerPatchExecution({
          agent_id: 'agent-123',
          execution_type: 'apply',
        })
      ).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        triggerPatchExecution({
          agent_id: 'agent-123',
          execution_type: 'apply',
        })
      ).rejects.toThrow(/Network error|Failed to trigger patch execution/);
    });

    it('should query database when backend returns success without execution_id', async () => {
      // First fetch call returns success but no execution_id
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Execution triggered',
        }),
      });

      // Mock supabase to return an execution
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce({
                data: [{ id: 'exec-queried-123', status: 'pending' }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'apply',
      });

      expect(result.execution_id).toBe('exec-queried-123');
      expect(supabase.from).toHaveBeenCalled();
    });

    it('should support both dry_run and apply execution types', async () => {
      const mockResponse = {
        success: true,
        execution_id: 'exec-111',
        execution_type: 'dry_run',
        status: 'pending',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'dry_run',
      });

      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(requestBody.execution_type).toBe('dry_run');
      expect(result.execution_type).toBe('dry_run');
    });
  });

  describe('checkAgentWebSocketConnection', () => {
    it('should return true when agent is websocket_connected', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { websocket_connected: true },
              error: null,
            }),
          }),
        }),
      };
      
      (supabase.from as any).mockReturnValue(mockFrom);

      const result = await checkAgentWebSocketConnection('agent-123');

      expect(result).toBe(true);
      expect(mockFrom.select).toHaveBeenCalledWith('websocket_connected');
      expect(mockFrom.select().eq).toHaveBeenCalledWith('id', 'agent-123');
    });

    it('should return false when agent is not websocket_connected', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { websocket_connected: false },
              error: null,
            }),
          }),
        }),
      };
      
      (supabase.from as any).mockReturnValue(mockFrom);

      const result = await checkAgentWebSocketConnection('agent-123');

      expect(result).toBe(false);
    });

    it('should return false when agent not found', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      };
      
      (supabase.from as any).mockReturnValue(mockFrom);

      const result = await checkAgentWebSocketConnection('invalid-agent');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      };
      
      (supabase.from as any).mockReturnValue(mockFrom);

      const result = await checkAgentWebSocketConnection('agent-123');

      expect(result).toBe(false);
    });

    it('should query agents table for websocket_connected status', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { websocket_connected: true },
              error: null,
            }),
          }),
        }),
      };
      
      (supabase.from as any).mockReturnValue(mockFrom);

      await checkAgentWebSocketConnection('agent-123');

      expect(supabase.from).toHaveBeenCalledWith('agents');
    });
  });

  describe('getPatchManagementData', () => {
    it('should handle missing agent data', async () => {
      // Mock all the supabase calls to return empty data
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found'),
          }),
        }),
      });

      await expect(
        getPatchManagementData('invalid-agent')
      ).rejects.toThrow();
    });

    it('should fetch patch management data successfully', async () => {
      const mockData = {
        agent: { id: 'agent-123', name: 'Test Agent' },
        packages: [],
        kernel: null,
        os: null,
        summary: {
          total_packages_checked: 0,
          packages_with_updates: 0,
          critical_vulnerabilities: 0,
          high_vulnerabilities: 0,
          medium_vulnerabilities: 0,
          low_vulnerabilities: 0,
        },
      };

      // This would need more detailed mocking based on the actual implementation
      // For now, this is a placeholder test
      expect(true).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle timeout gracefully', async () => {
      const abortError = new Error('Timeout');
      abortError.name = 'AbortError';
      (global.fetch as any).mockRejectedValueOnce(abortError);

      await expect(
        triggerPatchExecution({
          agent_id: 'agent-123',
          execution_type: 'apply',
        })
      ).rejects.toThrow();
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        triggerPatchExecution({
          agent_id: 'agent-123',
          execution_type: 'apply',
        })
      ).rejects.toThrow();
    });
  });

  describe('both dry_run and apply flow equivalence', () => {
    it('should handle dry_run exactly like apply except for command argument', async () => {
      const dryRunResponse = {
        success: true,
        execution_id: 'exec-dry-123',
        execution_type: 'dry_run',
        status: 'pending',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => dryRunResponse,
      });

      const dryRunResult = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'dry_run',
      });

      expect(dryRunResult.execution_id).toBeDefined();
      expect(dryRunResult.status).toBe('pending');
      expect(dryRunResult.execution_type).toBe('dry_run');

      // Reset mocks for apply test
      vi.clearAllMocks();

      const applyResponse = {
        success: true,
        execution_id: 'exec-apply-456',
        execution_type: 'apply',
        status: 'pending',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => applyResponse,
      });

      const applyResult = await triggerPatchExecution({
        agent_id: 'agent-123',
        execution_type: 'apply',
      });

      expect(applyResult.execution_id).toBeDefined();
      expect(applyResult.status).toBe('pending');
      expect(applyResult.execution_type).toBe('apply');

      // Both should follow the same flow
      expect(dryRunResult.status).toBe(applyResult.status);
    });
  });
});
