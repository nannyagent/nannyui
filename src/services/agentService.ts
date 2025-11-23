import { supabase } from '@/lib/supabase';

export interface Agent {
  id: string;
  name: string;
  fingerprint?: string;
  status: 'active' | 'pending' | 'offline';
  owner?: string;
  last_seen?: string;
  created_at: string;
  updated_at?: string;
  metadata?: any;
  oauth_client_id?: string | null;
  oauth_token_expires_at?: string | null;
  // Fields directly on agents table
  ip_address?: string;
  version?: string;
  os_version?: string;
  kernel_version?: string;
  location?: string;
  registered_ip?: string;
  public_key?: string;
  timeline?: any;
  // WebSocket status fields
  websocket_connected?: boolean;
  websocket_connected_at?: string;
  websocket_disconnected_at?: string;
}

// Based on actual Supabase schema: agent_metrics table
export interface AgentMetric {
  agent_id: string;
  recorded_at: string;
  cpu_percent?: number;
  memory_mb?: number;
  disk_percent?: number;
  network_in_kbps?: number;
  network_out_kbps?: number;
  extra?: any;
  ip_address?: string;
  location?: string;
  agent_version?: string;
  os_info?: {
    platform?: string;
    kernel_arch?: string;
    kernel_version?: string;
    platform_family?: string;
    platform_version?: string;
    // Additional fields used in AgentDetailsSheet
    name?: string;
    version?: string;
    architecture?: string;
    family?: string;
  };
  kernel_version?: string;
  filesystem_info?: any[];
  block_devices?: any[];
  device_fingerprint?: string;
  // Load averages - can be nested object or direct properties
  load_averages?: {
    load1?: number;
    load5?: number;
    load15?: number;
  };
  // Direct load properties (alternative format)
  load1?: number;
  load5?: number;
  load15?: number;
  network_stats?: {
    bytes_recv?: number;
    bytes_sent?: number;
    total_bytes?: number;
  };
}

// Based on actual Supabase schema: agent_route_labels table
export interface AgentRouteLabel {
  id: string;
  agent_id: string;
  label: string;
  created_at?: string;
}

// Based on actual Supabase schema: agent_rate_types table
export interface AgentRateType {
  id: string;
  agent_id: string;
  bucket_address?: string;
  last_refill?: string;
}

// Based on actual Supabase schema: user_subscriptions table (agent-related)
export interface UserSubscription {
  id: string;
  user_id?: string;
  plan_id?: string;
  status?: string;
  started_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface AgentWithRelations extends Agent {
  metrics?: AgentMetric[];
  labels?: AgentRouteLabel[];
  rate_types?: AgentRateType[];
  subscription?: UserSubscription;
  lastMetric?: AgentMetric;
}

export interface PaginatedAgents {
  agents: AgentWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch agent metrics (replaces heartbeats)
 * Only call this when showing agent details, not on initial load
 */
export const fetchAgentMetrics = async (
  agentId: string,
  limit: number = 5
): Promise<AgentMetric[]> => {
  try {
    const { data, error } = await supabase
      .from('agent_metrics')
      .select('*')
      .eq('agent_id', agentId)
      .order('recorded_at', { ascending: false })  // FIXED: recorded_at not reported_at
      .limit(limit);

    if (error) {
      console.error('Error fetching agent metrics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching agent metrics:', error);
    return [];
  }
};

/**
 * Fetch full agent details with related data
 * Call this when user clicks on an agent to view details
 */
export const getAgentDetails = async (agent: Agent): Promise<AgentWithRelations> => {
  try {
    // Try to fetch metrics for this specific agent
    const metrics = await fetchAgentMetrics(agent.id, 5);
    
    return {
      ...agent,
      metrics,
      labels: undefined, // These tables don't exist in your schema
      rate_types: undefined,
      subscription: undefined,
      lastMetric: metrics?.[0] || undefined,
    };
  } catch (error) {
    console.error('Error fetching agent details:', error);
    // Still return agent data even if metrics fail
    return {
      ...agent,
      metrics: undefined,
      labels: undefined,
      rate_types: undefined,
      subscription: undefined,
      lastMetric: undefined,
    };
  }
};

/**
 * Fetch agents with pagination and latest metrics data
 * @param page Page number (1-based)
 * @param pageSize Number of agents per page (default: 10)
 * @param statusFilter Filter by agent status ('active', 'pending', 'all')
 */
export const getAgentsPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  statusFilter: 'active' | 'pending' | 'all' = 'active'
): Promise<PaginatedAgents> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get count for pagination first
    let countQuery = supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    
    if (statusFilter !== 'all') {
      countQuery = countQuery.eq('status', statusFilter);
    }

    const { count } = await countQuery;

    // Fetch agents with basic data first
    let agentQuery = supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply status filter
    if (statusFilter !== 'all') {
      agentQuery = agentQuery.eq('status', statusFilter);
    }

    const { data: agents, error } = await agentQuery;

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('💡 The "agents" table does not exist yet.');
        console.log('📝 Run the SQL script in supabase_setup.sql to create it.');
        return {
          agents: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }
      console.error('Error fetching agents:', error);
      return {
        agents: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    // For each agent, try to get their latest metric
    const agentsWithMetrics = await Promise.all(
      (agents || []).map(async (agent) => {
        try {
          const { data: latestMetric } = await supabase
            .from('agent_metrics')
            .select('*')
            .eq('agent_id', agent.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...agent,
            lastMetric: latestMetric || undefined,
            metrics: latestMetric ? [latestMetric] : undefined,
          } as AgentWithRelations;
        } catch (error) {
          // If no metrics found, just return agent without metrics
          return {
            ...agent,
            lastMetric: undefined,
            metrics: undefined,
          } as AgentWithRelations;
        }
      })
    );

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      agents: agentsWithMetrics,
      total: count || 0,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Exception fetching paginated agents:', error);
    return {
      agents: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

/**
 * Fetch all agents (without pagination) - for backwards compatibility
 */
export const getAgents = async (): Promise<Agent[]> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, provide helpful message
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('💡 The "agents" table does not exist yet.');
        console.log('📝 Run the SQL script in supabase_setup.sql to create it.');
        return [];
      }
      console.error('Error fetching agents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching agents:', error);
    return [];
  }
};

/**
 * Fetch agents for a specific user
 */
export const getUserAgents = async (userId: string): Promise<Agent[]> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user agents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching user agents:', error);
    return [];
  }
};

/**
 * Fetch agents by status
 */
export const getAgentsByStatus = async (status: 'online' | 'offline'): Promise<Agent[]> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents by status:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching agents by status:', error);
    return [];
  }
};

/**
 * Create a new agent
 */
export const createAgent = async (
  agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Agent | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception creating agent:', error);
    return { data: null, error };
  }
};

/**
 * Update an agent
 */
export const updateAgent = async (
  id: string,
  updates: Partial<Omit<Agent, 'id' | 'created_at'>>
): Promise<{ data: Agent | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception updating agent:', error);
    return { data: null, error };
  }
};

/**
 * Delete an agent
 */
export const deleteAgent = async (id: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting agent:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Exception deleting agent:', error);
    return { error };
  }
};

/**
 * Get agent statistics
 */
export const getAgentStats = async () => {
  try {
    const agents = await getAgents();
    
    const online = agents.filter(agent => agent.status === 'active').length;
    const offline = agents.filter(agent => agent.status === 'offline').length;
    const total = agents.length;

    return { online, offline, total };
  } catch (error) {
    console.error('Exception getting agent stats:', error);
    return { online: 0, offline: 0, total: 0 };
  }
};

/**
 * Determine real-time agent status based on websocket connection and last seen
 */
export const getAgentRealTimeStatus = (agent: Agent): 'active' | 'inactive' => {
  // If websocket is currently connected, agent is active
  if (agent.websocket_connected) {
    return 'active';
  }

  // If no last_seen timestamp, agent is inactive
  if (!agent.last_seen) {
    return 'inactive';
  }

  // Check if last_seen is within the last 60 seconds (30s heartbeat + 30s buffer)
  const lastSeenTime = new Date(agent.last_seen).getTime();
  const now = Date.now();
  const sixtySecondsAgo = now - (60 * 1000);

  return lastSeenTime >= sixtySecondsAgo ? 'active' : 'inactive';
};
