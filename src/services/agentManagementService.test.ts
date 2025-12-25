import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deleteAgent } from './agentManagementService';
import { pb } from '@/lib/pocketbase';
import * as agentService from './agentService';

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(),
  },
}));

vi.mock('./agentService', () => ({
  deleteAgent: vi.fn(),
}));

describe('agentManagementService - deleteAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete agent successfully', async () => {
    const mockAgent = { hostname: 'Test Agent' };
    const getOneMock = vi.fn().mockResolvedValue(mockAgent);
    (pb.collection as any).mockReturnValue({ getOne: getOneMock });
    (agentService.deleteAgent as any).mockResolvedValue({ error: null });

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(true);
    expect(result.agent_name).toBe('Test Agent');
    expect(agentService.deleteAgent).toHaveBeenCalledWith('test-agent-id');
  });

  it('should handle delete error', async () => {
    const mockAgent = { hostname: 'Test Agent' };
    const getOneMock = vi.fn().mockResolvedValue(mockAgent);
    (pb.collection as any).mockReturnValue({ getOne: getOneMock });
    (agentService.deleteAgent as any).mockResolvedValue({ error: new Error('Delete failed') });

    const result = await deleteAgent('test-agent-id');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Delete failed');
  });
});
