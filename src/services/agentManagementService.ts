import { supabase } from '@/lib/supabase';

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
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to delete agents'
      };
    }

    // Call the Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'delete',
        agent_id: agentId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'deletion_failed',
        message: result.message || 'Failed to delete agent'
      };
    }

    return {
      success: true,
      message: result.message || 'Agent deleted successfully',
      agent_name: result.agent_name
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
 * Update an agent (for future use)
 */
export const updateAgent = async (
  agentId: string, 
  updates: { name?: string; status?: string }
): Promise<AgentDeleteResponse> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to update agents'
      };
    }

    // Call the Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'update',
        agent_id: agentId,
        ...updates
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'update_failed',
        message: result.message || 'Failed to update agent'
      };
    }

    return {
      success: true,
      message: result.message || 'Agent updated successfully'
    };

  } catch (error) {
    console.error('Error updating agent:', error);
    return {
      success: false,
      error: 'network_error',
      message: 'Network error occurred while updating agent'
    };
  }
};