import { pb } from '@/lib/pocketbase';

export interface Inference {
  id: string;
  function_name: string;
  variant_name: string;
  timestamp: string;
  processing_time_ms: number;
  input?: any;
  output?: any;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface Investigation {
  id: string;
  user_id: string;
  agent_id: string;
  episode_id: string;
  user_prompt: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  resolution_plan: string;
  initiated_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: {
    inferences?: Inference[];
    [key: string]: any;
  };
  inference_count?: number;
  agent?: {
    id: string;
    hostname: string;
    status: string;
  };
}

export interface InvestigationsResponse {
  investigations: Investigation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Fetch investigations with pagination
 */
export const getInvestigationsPaginated = async (
  page: number = 1, 
  limit: number = 5,
): Promise<InvestigationsResponse> => {
  try {
    const user = pb.authStore.record;
    if (!user) {
      return {
        investigations: [],
        pagination: { page: 1, limit: 0, total: 0, total_pages: 0, has_next: false, has_prev: false }
      };
    }

    const result = await pb.collection('investigations').getList(page, limit, {
      filter: `user_id = "${user.id}"`,
      sort: '-id', // Changed from -created
      expand: 'agent_id',
    });

    const investigations = result.items.map((record: any) => {
      let agent = undefined;
      if (record.expand?.agent_id) {
        const agentRecord = record.expand.agent_id;
        // Simplified status logic
        agent = {
          id: agentRecord.id,
          hostname: agentRecord.hostname,
          status: 'active',
        };
      }

      return {
        ...record,
        created_at: record.created,
        updated_at: record.updated,
        agent,
      };
    }) as unknown as Investigation[];

    return {
      investigations,
      pagination: {
        page: result.page,
        limit: result.perPage,
        total: result.totalItems,
        total_pages: result.totalPages,
        has_next: result.page < result.totalPages,
        has_prev: result.page > 1,
      }
    };
  } catch (error) {
    console.error('Error fetching investigations:', error);
    return {
      investigations: [],
      pagination: { page: 1, limit: 0, total: 0, total_pages: 0, has_next: false, has_prev: false }
    };
  }
};

/**
 * Fetch investigation details (enriched with inferences from ClickHouse)
 */
export const getInvestigationDetails = async (id: string): Promise<Investigation> => {
  try {
    // Use pb.send to call the custom API endpoint which enriches data
    const result = await pb.send('/api/investigations?id=' + id, {
        method: 'GET',
    });
    return result as Investigation;
  } catch (error) {
    console.error('Error fetching investigation details:', error);
    throw error;
  }
};


/**
 * Fetch recent investigations for dashboard
 */
export const getRecentInvestigationsFromAPI = async (limit: number = 5): Promise<Investigation[]> => {
  try {
    const result = await getInvestigationsPaginated(1, limit);
    return result.investigations;
  } catch (error) {
    console.error('Error fetching recent investigations:', error);
    return [];
  }
};

/**
 * Get investigation by ID
 */
export const getInvestigation = async (investigationId: string): Promise<Investigation | null> => {
  try {
    const result = await pb.send('/api/investigations?id=' + investigationId, {
      method: 'GET',
    });
    return result as Investigation;
  } catch (error) {
    console.error('Error fetching investigation:', error);
    return null;
  }
};

/**
 * Create a new investigation
 */
export const createInvestigationFromAPI = async (params: {
  agent_id: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  initiated_by: string;
  application_group: string;
}): Promise<{ investigation_id: string; episode_id?: string; status?: string }> => {
  try {
    const user = pb.authStore.record;
    if (!user) throw new Error('User not authenticated');

    const priority = params.priority === 'critical' ? 'high' : params.priority;

    const record = await pb.collection('investigations').create({
      agent_id: params.agent_id,
      user_prompt: params.issue,
      priority: priority,
      status: 'pending',
      user_id: user.id,
      initiated_at: new Date().toISOString(),
      metadata: {
        application_group: params.application_group,
        initiated_by: params.initiated_by,
      }
    });

    return {
      investigation_id: record.id,
      episode_id: record.episode_id,
      status: record.status,
    };
  } catch (error) {
    console.error('Error creating investigation:', error);
    throw error;
  }
};

/**
 * Wait for investigation to reach in_progress status
 */
export const waitForInvestigationInProgress = async (
  agentId: string,
  investigationId?: string,
  timeoutSeconds: number = 30,
  onProgress?: (message: string) => void
): Promise<Investigation | null> => {
  const pollIntervalMs = 1000;
  const maxPolls = Math.ceil((timeoutSeconds * 1000) / pollIntervalMs);
  let pollCount = 0;

  const poll = async (): Promise<Investigation | null> => {
    try {
      pollCount++;
      if (pollCount > maxPolls) {
        onProgress?.(`Timeout waiting for agent (${timeoutSeconds}s)`);
        return null;
      }

      let record;
      if (investigationId) {
        record = await pb.collection('investigations').getOne(investigationId);
      } else {
        const result = await pb.collection('investigations').getList(1, 1, {
          filter: `agent_id = "${agentId}"`,
          sort: '-created',
        });
        record = result.items[0];
      }

      if (record) {
        if (record.status !== 'pending') {
          onProgress?.(`Agent picked up investigation (status: ${record.status})`);
          return {
            ...record,
            created_at: record.created,
            updated_at: record.updated,
          } as unknown as Investigation;
        }
        
        const elapsed = Math.round((pollCount * pollIntervalMs) / 1000);
        onProgress?.(`Waiting for agent to pick up (${elapsed}s)`);
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      return poll();
    } catch (error) {
      console.error('Error polling investigation:', error);
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      return poll();
    }
  };

  return poll();
};

/**
 * Get priority badge color
 */
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format investigation time for display
 */
export const formatInvestigationTime = (createdAt: string): string => {
  const now = new Date();
  const investigationDate = new Date(createdAt);
  const diffMs = now.getTime() - investigationDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return investigationDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: investigationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get application group icon name
 */
export const getApplicationGroupIcon = (applicationGroup: string): string => {
  const iconMap: Record<string, string> = {
    'database': 'Database',
    'backend-api': 'Server', 
    'mobile-app': 'Smartphone',
    'infrastructure': 'Network',
    'web-app': 'Globe',
  };
  return iconMap[applicationGroup] || 'Activity';
};

/**
 * Get inferences for an episode
 */
export const getEpisodeInferences = async (episodeId: string): Promise<Inference[]> => {
  try {
    const result = await pb.collection('inferences').getList(1, 50, {
      filter: `episode_id = "${episodeId}"`,
      sort: 'created',
    });

    return result.items.map((record: any) => ({
      id: record.id,
      function_name: record.function_name,
      variant_name: record.variant_name,
      timestamp: record.created,
      processing_time_ms: record.processing_time_ms,
      input: record.input,
      output: record.output,
      usage: record.usage,
    })) as Inference[];
  } catch (error) {
    console.error('Error fetching episode inferences:', error);
    return [];
  }
};

/**
 * Get inference by ID
 */
export const getInferenceById = async (inferenceId: string): Promise<Inference | null> => {
  try {
    const record = await pb.collection('inferences').getOne(inferenceId);

    return {
      id: record.id,
      function_name: record.function_name,
      variant_name: record.variant_name,
      timestamp: record.created,
      processing_time_ms: record.processing_time_ms,
      input: record.input,
      output: record.output,
      usage: record.usage,
    } as Inference;
  } catch (error) {
    console.error('Error fetching inference:', error);
    return null;
  }
};

export interface InvestigationRequest {
  agent_id: string;
  issue: string;
  priority: 'high' | 'medium' | 'low' | 'critical';
  initiated_by: string;
}

export interface InvestigationResponse {
  success: boolean;
  investigation_id: string;
  agent_id: string;
  status: string;
  message: string;
  agent_connected: boolean;
  error?: string;
  details?: string;
  tensorzero_response?: string;
}

/**
 * Start a diagnostic investigation for an agent and wait for completion
 */
export const startInvestigation = async (
  request: InvestigationRequest, 
  onProgress?: (message: string) => void
): Promise<InvestigationResponse> => {
  try {
    const result = await createInvestigationFromAPI({
      agent_id: request.agent_id,
      issue: request.issue,
      priority: request.priority,
      initiated_by: request.initiated_by,
      application_group: 'unknown'
    });

    onProgress?.('Investigation created, waiting for agent...');

    const completed = await waitForInvestigationInProgress(
      request.agent_id,
      result.investigation_id,
      600, // 10 minutes
      onProgress
    );

    return {
      success: !!completed,
      investigation_id: result.investigation_id,
      agent_id: request.agent_id,
      status: completed?.status || 'unknown',
      message: `Investigation finished with status: ${completed?.status || 'unknown'}`,
      agent_connected: true,
    };
  } catch (error) {
    console.error('Investigation start error:', error);
    throw error;
  }
};

/**
 * Get recent investigations for a specific agent
 */
export const getRecentInvestigationsForAgent = async (agentId: string, limit: number = 10): Promise<Investigation[]> => {
  try {
    const result = await pb.collection('investigations').getList(1, limit, {
      filter: `agent_id = "${agentId}"`,
      sort: '-created',
    });

    return result.items.map((record: any) => ({
      ...record,
      created_at: record.created,
      updated_at: record.updated,
    })) as unknown as Investigation[];
  } catch (error) {
    console.error('Error fetching agent investigations:', error);
    return [];
  }
};

/**
 * Get all investigations for a user
 */
export const getUserInvestigations = async (limit: number = 10): Promise<Investigation[]> => {
  return getRecentInvestigationsFromAPI(limit);
};

/**
 * Check if investigation is still running
 */
export const isInvestigationRunning = (status: string): boolean => {
  return status === 'active' || status === 'in_progress' || status === 'pending';
};

/**
 * Check if investigation completed successfully
 */
export const isInvestigationCompleted = (status: string): boolean => {
  return status === 'completed';
};

/**
 * Check if investigation failed
 */
export const isInvestigationFailed = (status: string): boolean => {
  return ['failed', 'timeout', 'error'].includes(status);
};
