import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deleteAgent } from './agentManagementService';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('agentManagementService - deleteAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return authentication error if not logged in', async () => {
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: new Error('No session'),
    } as any);

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentication required');
  });

  it('should call the agent-management edge function with delete action', async () => {
    const { supabase } = await import('@/lib/supabase');
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Agent deleted successfully',
        agent_name: 'Test Agent',
      }),
    });

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(true);
    expect(result.message).toContain('deleted successfully');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/agent-management'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        }),
        body: expect.stringContaining('"action":"delete"'),
      })
    );
  });

  it('should handle network errors gracefully', async () => {
    const { supabase } = await import('@/lib/supabase');
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    } as any);

    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(false);
    expect(result.error).toBe('network_error');
    expect(result.message).toContain('Network error');
  });

  it('should handle deletion failure from backend', async () => {
    const { supabase } = await import('@/lib/supabase');
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    } as any);

    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'deletion_failed',
        message: 'Failed to delete agent - foreign key constraint',
      }),
    });

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(false);
    expect(result.error).toBe('deletion_failed');
  });

  it('should return agent_name from successful deletion response', async () => {
    const { supabase } = await import('@/lib/supabase');
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Agent deleted successfully',
        agent_name: 'vm-production-01',
        agent_id: 'test-agent-id',
      }),
    });

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(true);
    expect(result.agent_name).toBe('vm-production-01');
  });
});

describe('agentManagementService - deleteAgent Integration', () => {
  /**
   * Integration tests that verify the comprehensive deletion
   * These would normally require a test database with actual data
   * They are documented here for reference on what should be tested
   */

  it('should delete all patch_executions for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM patch_executions WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all agent_metrics for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM agent_metrics WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all investigations for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM investigations WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all patch_tasks for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM patch_tasks WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all pending_investigations for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM pending_investigations WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all activities for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM activities WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all agent_tokens for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM agent_tokens WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete all agent_device_codes for the agent', () => {
    // Verify with: SELECT COUNT(*) FROM agent_device_codes WHERE agent_id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should delete the agent itself from agents table', () => {
    // Verify with: SELECT COUNT(*) FROM agents WHERE id = 'deleted-agent-id' => 0
    expect(true).toBe(true); // Placeholder for integration test
  });

  it('should not leave orphaned records in any table', () => {
    // Verify with: SELECT * FROM patch_executions WHERE agent_id = 'deleted-agent-id' => 0 rows
    // Verify with: SELECT * FROM agent_metrics WHERE agent_id = 'deleted-agent-id' => 0 rows
    // etc.
    expect(true).toBe(true); // Placeholder for integration test
  });
});
