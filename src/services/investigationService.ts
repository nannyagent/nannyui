import { supabase } from '@/lib/supabase';
import { getCurrentSession } from '@/services/authService';

export interface Inference {
  id: string;
  function_name: string;
  variant_name: string;
  timestamp: string;
  processing_time_ms: number;
  input?: string;
  output?: string;
  tool_params?: string;
  inference_params?: string;
  ttft_ms?: number | null;
  tags?: Record<string, string | number | boolean | null>;
  extra_body?: string;
  model_inference?: {
    id: string;
    model_name: string;
    model_provider_name: string;
    input_tokens: number;
    output_tokens: number;
    response_time_ms: number;
    ttft_ms?: number | null;
    raw_request?: string;
    raw_response?: string;
    timestamp?: string;
  };
  feedback?: Record<string, string | number | boolean | null>[];
}

export interface Investigation {
  id: number;
  investigation_id: string;
  issue: string;
  application_group?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  initiated_by: string;
  target_agents?: string[];
  status: 'pending' | 'in_progress' | 'active' | 'completed' | 'failed';
  holistic_analysis?: string;
  created_at: string;
  completed_at: string | null;
  agent_id: string;
  initiated_at: string;
  updated_at: string;
  tensorzero_response?: string;
  episode_id: string;
  inference_count?: number;
  metadata?: {
    tags?: string[];
    source?: string;
    severity?: number;
  };
  agent?: {
    id: string;
    name: string;
    status: string;
    owner?: string;
  };
  agents?: {
    id: string;
    name: string;
    status: string;
    owner?: string;
  };
  inferences?: Inference[];
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
  filters: {
    status: string;
    agent_id: string;
  };
}

// Get Supabase URL from environment variables
const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.error('VITE_SUPABASE_URL is not defined in environment variables');
    return 'http://127.0.0.1:54321'; // fallback for development
  }
  return url;
};

/**
 * Fetch investigations with pagination from the new API
 * @param page Page number (default: 1)
 * @param limit Number of investigations per page (default: 5)
 * @param withEpisodes Whether to include episode data (default: true)
 */
export const getInvestigationsPaginated = async (
  page: number = 1, 
  limit: number = 5,
  withEpisodes: boolean = true
): Promise<InvestigationsResponse> => {
  try {
    const session = await getCurrentSession();
    if (!session?.access_token) {
      console.error('No session found for investigations API');
      return {
        investigations: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false
        },
        filters: {
          status: 'all',
          agent_id: 'all'
        }
      };
    }

    const supabaseUrl = getSupabaseUrl();
    // Fetch with episodes by default (can be disabled by passing withEpisodes=false for better performance)
    const episodesParam = withEpisodes ? 'with_episodes=true&' : '';
    const response = await fetch(`${supabaseUrl}/functions/v1/investigation-coordinator?${episodesParam}page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch investigations:', response.status, response.statusText);
      throw new Error(`Failed to fetch investigations: ${response.status}`);
    }

    const data: InvestigationsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Exception fetching investigations:', error);
    throw error;
  }
};

/**
 * Fetch recent investigations for dashboard
 * @param limit Number of investigations to fetch (default: 5)
 */
export const getRecentInvestigationsFromAPI = async (limit: number = 5): Promise<Investigation[]> => {
  try {
    const result = await getInvestigationsPaginated(1, limit);
    return result.investigations;
  } catch (error) {
    console.error('Exception fetching recent investigations:', error);
    return [];
  }
};

/**
 * Get investigation by ID from API with full episode and inference data
 * @param investigationId Investigation ID to fetch
 */
export const getInvestigationByIdFromAPI = async (investigationId: string): Promise<Investigation | null> => {
  try {
    const session = await getCurrentSession();
    if (!session?.access_token) {
      console.error('No session found for investigation details API');
      return null;
    }

    const supabaseUrl = getSupabaseUrl();
    const response = await fetch(`${supabaseUrl}/functions/v1/investigation-coordinator/investigation/${investigationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch investigation details:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    return result.investigation;
  } catch (error) {
    console.error('Exception fetching investigation details:', error);
    return null;
  }
};

/**
 * Get inference details by ID from API
 * @param inferenceId Inference ID to fetch
 */
export const getInferenceById = async (inferenceId: string): Promise<Inference | null> => {
  try {
    const session = await getCurrentSession();
    if (!session?.access_token) {
      console.error('No session found for inference details API');
      return null;
    }

    const supabaseUrl = getSupabaseUrl();
    const response = await fetch(`${supabaseUrl}/functions/v1/investigation-coordinator/inference/${inferenceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch inference details:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    return result.inference;
  } catch (error) {
    console.error('Exception fetching inference details:', error);
    return null;
  }
};

/**
 * Create a new investigation (returns immediately with investigation_id)
 * The investigation runs in the background
 * @param params Investigation parameters
 */
export const createInvestigationFromAPI = async (params: {
  agent_id: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  initiated_by: string;
  application_group: string;
}): Promise<{ investigation_id: string; episode_id?: string; status?: string }> => {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    throw new Error('Authentication required');
  }

  const supabaseUrl = getSupabaseUrl();
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  console.log('Creating investigation:', params);
  console.log('API URL:', `${supabaseUrl}/functions/v1/investigation-coordinator`);
  
  // Set a timeout for the request - 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('Request timed out after 30 seconds');
    controller.abort();
  }, 30000);
  
  try {
    console.log('Sending POST request...');
    const response = await fetch(`${supabaseUrl}/functions/v1/investigation-coordinator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': apiKey
      },
      body: JSON.stringify(params),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Response received:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create investigation:', response.status, errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Investigation API response:', result);
    console.log('Response keys:', Object.keys(result));
    
    // Extract investigation_id from various possible response formats
    const investigation_id = result.investigation_id || result.id || result.data?.investigation_id;
    
    if (!investigation_id) {
      console.error('No investigation_id in response:', result);
      throw new Error('No investigation ID returned from server');
    }

    return {
      investigation_id,
      episode_id: result.episode_id || result.data?.episode_id,
      status: result.status || result.data?.status || 'pending'
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - investigation may still be created, check Investigations page');
    }
    throw error;
  }
};

/**
 * Get priority badge color
 */
export const getPriorityColor = (priority: Investigation['priority']): string => {
  const colorMap: Record<Investigation['priority'], string> = {
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
export const getStatusColor = (status: Investigation['status']): string => {
  const colorMap: Record<Investigation['status'], string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    active: 'bg-purple-100 text-purple-800',
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
    // Get current user session for JWT token
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      throw new Error('No valid session found. Please log in again.');
    }

    // Sanitize the issue input
    const sanitizedIssue = request.issue.trim().replace(/[<>'"]/g, '');
    if (sanitizedIssue.length === 0) {
      throw new Error('Issue description cannot be empty');
    }

    if (sanitizedIssue.length > 1000) {
      throw new Error('Issue description is too long (max 1000 characters)');
    }

    onProgress?.('Initiating investigation...');

    // Fire the API call and forget about it
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investigation-coordinator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`
      },
      body: JSON.stringify({
        agent_id: request.agent_id,
        issue: sanitizedIssue,
        priority: request.priority,
        initiated_by: request.initiated_by
      })
    }).catch(() => {}); // Don't care about response or errors

    // Wait a moment for investigation to appear, then find it
    onProgress?.('Waiting for investigation to be created...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Query directly for ANY active investigation for this agent
    const { data: activeInvestigations, error } = await supabase
      .from('investigations')
      .select('investigation_id, status, created_at')
      .eq('agent_id', request.agent_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    if (!activeInvestigations || activeInvestigations.length === 0) {
      throw new Error('No active investigation found for this agent. The API call may have failed.');
    }
    
    const investigationId = activeInvestigations[0].investigation_id;

    // Poll for completion
    onProgress?.('Investigation started, waiting for completion...');
    const completedInvestigation = await pollInvestigationCompletion(investigationId, onProgress);
    
    return {
      success: true,
      investigation_id: investigationId,
      agent_id: request.agent_id,
      status: completedInvestigation?.status || 'unknown',
      message: `Investigation finished with status: ${completedInvestigation?.status || 'unknown'}`,
      agent_connected: true,
      tensorzero_response: completedInvestigation?.tensorzero_response
    };

  } catch (error) {
    console.error('Investigation start error:', error);
    throw error;
  }
};

/**
 * Poll the investigations table until the investigation is complete (retry on network errors, 10 minutes max)
 */
export const pollInvestigationCompletion = async (
  investigationId: string, 
  onProgress?: (message: string) => void,
  maxWaitTime: number = 600000, // 10 minutes max
  pollInterval: number = 2000 // Poll every 2 seconds
): Promise<Investigation | null> => {
  const globalStartTime = Date.now();
  let lastStatus = '';
  
  while (Date.now() - globalStartTime < maxWaitTime) {
    try {
      const investigation = await getInvestigation(investigationId);
      
      if (!investigation) {
        onProgress?.('Waiting for investigation to appear in database...');
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      // Update progress if status changed
      if (investigation.status !== lastStatus) {
        lastStatus = investigation.status;
        const elapsed = Math.round((Date.now() - globalStartTime) / 1000);
        
        if (investigation.status === 'active') {
          onProgress?.(`Investigation running on agent (${elapsed}s elapsed)`);
        } else {
          onProgress?.(`Investigation status: ${investigation.status} (${elapsed}s elapsed)`);
        }
      }

      // Check if investigation is no longer active
      if (investigation.status !== 'active') {
        onProgress?.(`Investigation completed with status: ${investigation.status}`);
        return investigation;
      }

      // Investigation is still running, wait and check again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
    } catch (error) {
      console.error('Network error during polling, retrying:', error);
      const elapsed = Math.round((Date.now() - globalStartTime) / 1000);
      onProgress?.(`Network error occurred, retrying... (${elapsed}s elapsed)`);
      
      // Wait a bit longer on network errors before retrying
      await new Promise(resolve => setTimeout(resolve, Math.min(pollInterval * 2, 5000)));
    }
  }

  // Timeout reached after 10 minutes
  throw new Error('Investigation timed out after 10 minutes. Something went wrong, please check the logs.');
};

/**
 * Get recent investigations for a specific agent
 */
export const getRecentInvestigationsForAgent = async (agentId: string, limit: number = 10): Promise<Investigation[]> => {
  try {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching agent investigations:', error);
    throw error;
  }
};

/**
 * Get investigation details by ID
 */
export const getInvestigation = async (investigationId: string): Promise<Investigation | null> => {
  try {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .eq('investigation_id', investigationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching investigation:', error);
    throw error;
  }
};

/**
 * Get all investigations for a user
 */
export const getUserInvestigations = async (limit: number = 10): Promise<Investigation[]> => {
  try {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user investigations:', error);
    throw error;
  }
};

/**
 * Check if investigation is still running
 */
export const isInvestigationRunning = (status: string): boolean => {
  return status === 'active';
};

/**
 * Check if investigation completed successfully
 */
export const isInvestigationCompleted = (status: string): boolean => {
  return ['completed', 'completed_with_analysis'].includes(status);
};

/**
 * Check if investigation failed
 */
export const isInvestigationFailed = (status: string): boolean => {
  return ['failed', 'timeout', 'error'].includes(status);
};