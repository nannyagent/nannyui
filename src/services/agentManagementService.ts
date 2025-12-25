import { pb } from '@/lib/pocketbase';
import { deleteAgent as deleteAgentPB } from './agentService';

export interface AgentDeleteResponse {
  success: boolean;
  message: string;
  agent_name?: string;
  error?: string;
}

/**
 * Delete an agent and all related data
 */
export const deleteAgent = async (agentId: string): Promise<AgentDeleteResponse> => {
  try {
    // First get the agent name for the response
    let agentName = '';
    try {
      const agent = await pb.collection('agents').getOne(agentId);
      agentName = agent.hostname;
    } catch (e) {
      // Ignore if not found
    }

    const { error } = await deleteAgentPB(agentId);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete agent'
      };
    }

    return {
      success: true,
      message: 'Agent deleted successfully',
      agent_name: agentName
    };

  } catch (error) {
    console.error('Error deleting agent:', error);
    return {
      success: false,
      error: 'network_error',
      message: 'Network error occurred while deleting agent'
    };
  }
};

/**
 * Update an agent
 */
export const updateAgent = async (
  agentId: string, 
  updates: { name?: string; status?: string }
): Promise<AgentDeleteResponse> => {
  try {
    const updateData: any = {};
    if (updates.name) updateData.hostname = updates.name;
    if (updates.status) updateData.status = updates.status;

    await pb.collection('agents').update(agentId, updateData);

    return {
      success: true,
      message: 'Agent updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update agent'
    };
  }
};
