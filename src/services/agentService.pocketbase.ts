import { pb } from '@/integrations/pocketbase/client';
import { getCurrentUser } from './authService';

export interface Agent {
  id: string;
  name: string;
  fingerprint?: string;
  status: 'active' | 'pending' | 'offline';
  owner?: string;
  last_seen?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, string | number | boolean | null>;
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
  timeline?: Record<string, string | number | boolean | null>;
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
  extra?: Record<string, string | number | boolean | null>;
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
  filesystem_info?: Record<string, string | number | boolean | null>[];
  block_devices?: Record<string, string | number | boolean | null>[];
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
    const records = await pb.collection('agent_metrics').getList(1, limit, {
      filter: `agent_id = "${agentId}"`,
      sort: '-recorded_at',
    });

    return records.items as unknown as AgentMetric[];
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
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
      labels: undefined,
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
    const user = await getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return {
        agents: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    // Build filter for user's agents
    let filter = `owner = "${user.id}"`;
    if (statusFilter !== 'all') {
      filter += ` && status = "${statusFilter}"`;
    }

    const records = await pb.collection('agents').getList(page, pageSize, {
      filter,
      sort: '-created',
    });

    // For each agent, try to get their latest metric
    const agentsWithMetrics = await Promise.all(
      records.items.map(async (agent: any) => {
        try {
          const metrics = await pb.collection('agent_metrics').getList(1, 1, {
            filter: `agent_id = "${agent.id}"`,
            sort: '-recorded_at',
          });

          const lastMetric = metrics.items.length > 0 ? metrics.items[0] as unknown as AgentMetric : undefined;

          return {
            ...agent,
            created_at: agent.created,
            updated_at: agent.updated,
            lastMetric,
            metrics: lastMetric ? [lastMetric] : undefined,
          } as AgentWithRelations;
        } catch {
          return {
            ...agent,
            created_at: agent.created,
            updated_at: agent.updated,
            lastMetric: undefined,
            metrics: undefined,
          } as AgentWithRelations;
        }
      })
    );

    const totalPages = Math.ceil(records.totalItems / pageSize);

    return {
      agents: agentsWithMetrics,
      total: records.totalItems,
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
    const user = await getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const records = await pb.collection('agents').getFullList({
      filter: `owner = "${user.id}"`,
      sort: '-created',
    });

    return records.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      fingerprint: agent.fingerprint,
      status: agent.status,
      owner: agent.owner,
      created_at: agent.created,
      updated_at: agent.updated,
      ip_address: agent.ip_address,
      version: agent.version,
      os_version: agent.os_version,
      kernel_version: agent.kernel_version,
      location: agent.location,
      registered_ip: agent.registered_ip,
      public_key: agent.public_key,
      websocket_connected: agent.websocket_connected,
      websocket_connected_at: agent.websocket_connected_at,
      websocket_disconnected_at: agent.websocket_disconnected_at,
    } as Agent));
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
    const records = await pb.collection('agents').getFullList({
      filter: `owner = "${userId}"`,
      sort: '-created',
    });

    return records.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      fingerprint: agent.fingerprint,
      status: agent.status,
      owner: agent.owner,
      created_at: agent.created,
      updated_at: agent.updated,
    } as Agent));
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
    const user = await getCurrentUser();
    if (!user) return [];

    const statusMap: Record<string, string> = {
      'online': 'active',
      'offline': 'offline'
    };

    const records = await pb.collection('agents').getFullList({
      filter: `owner = "${user.id}" && status = "${statusMap[status] || status}"`,
      sort: '-created',
    });

    return records.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      owner: agent.owner,
      created_at: agent.created,
    } as Agent));
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
): Promise<{ data: Agent | null; error: Error | null }> => {
  try {
    const data = await pb.collection('agents').create({
      ...agent,
      owner: agent.owner || (await getCurrentUser())?.id,
    });

    return { data: data as unknown as Agent, error: null };
  } catch (error) {
    console.error('Exception creating agent:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update an agent
 */
export const updateAgent = async (
  id: string,
  updates: Partial<Omit<Agent, 'id' | 'created_at'>>
): Promise<{ data: Agent | null; error: Error | null }> => {
  try {
    const data = await pb.collection('agents').update(id, updates);
    return { data: data as unknown as Agent, error: null };
  } catch (error) {
    console.error('Exception updating agent:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Delete an agent
 */
export const deleteAgent = async (id: string): Promise<{ error: Error | null }> => {
  try {
    await pb.collection('agents').delete(id);
    return { error: null };
  } catch (error) {
    console.error('Exception deleting agent:', error);
    return { error: error as Error };
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
