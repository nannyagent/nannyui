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
  ip_address?: string;
  version?: string;
  os_version?: string;
  kernel_version?: string;
  location?: string;
  registered_ip?: string;
  public_key?: string;
  timeline?: Record<string, string | number | boolean | null>;
  websocket_connected?: boolean;
  websocket_connected_at?: string;
  websocket_disconnected_at?: string;
}

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
    name?: string;
    version?: string;
    architecture?: string;
    family?: string;
  };
  kernel_version?: string;
  filesystem_info?: Record<string, string | number | boolean | null>[];
  block_devices?: Record<string, string | number | boolean | null>[];
  device_fingerprint?: string;
  load_averages?: {
    load1?: number;
    load5?: number;
    load15?: number;
  };
  load1?: number;
  load5?: number;
  load15?: number;
  network_stats?: {
    bytes_recv?: number;
    bytes_sent?: number;
    total_bytes?: number;
  };
}

export interface AgentRouteLabel {
  id: string;
  agent_id: string;
  label: string;
  created_at?: string;
}

export interface AgentRateType {
  id: string;
  agent_id: string;
  bucket_address?: string;
  last_refill?: string;
}

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

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

// Simple fetch wrapper with auth token
const fetchFromAPI = async (path: string, options: RequestInit = {}) => {
  const token = pb.authStore.token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${POCKETBASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Map PocketBase agent record to Agent interface
 */
function mapPocketbaseToAgent(record: any): Agent {
  return {
    id: record.id,
    name: record.hostname || record.name || 'Unknown',
    status: record.status || 'offline',
    owner: record.user_id,
    last_seen: record.last_seen,
    created_at: record.created,
    updated_at: record.updated,
    version: record.version,
    kernel_version: record.kernel_version,
    ip_address: record.primary_ip || record.all_ips,
    metadata: record.metadata,
  };
}

/**
 * Fetch agents with pagination
 */
export const getAgentsPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  statusFilter: 'active' | 'pending' | 'all' = 'active'
): Promise<PaginatedAgents> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { agents: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Simple GET request without complex filter syntax
    const response = await fetchFromAPI(`/api/collections/agents/records?perPage=30`);

    let agents = response.items || [];
    agents = agents.filter((agent: any) => agent.user_id === user.id);

    if (statusFilter !== 'all') {
      agents = agents.filter((agent: any) => agent.status === statusFilter);
    }

    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedAgents = agents.slice(start, end);

    return {
      agents: paginatedAgents.map((agent: any) => mapPocketbaseToAgent(agent) as AgentWithRelations),
      total: agents.length,
      page,
      pageSize,
      totalPages: Math.ceil(agents.length / pageSize),
    };
  } catch (error) {
    console.error('Error fetching agents:', error);
    return { agents: [], total: 0, page, pageSize, totalPages: 0 };
  }
};

/**
 * Fetch all agents
 */
export const getAgents = async (): Promise<Agent[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const response = await fetchFromAPI(`/api/collections/agents/records?perPage=500`);

    const agents = (response.items || []).filter((agent: any) => agent.user_id === user.id);
    return agents.map((agent: any) => mapPocketbaseToAgent(agent));
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
};

/**
 * Fetch agents for a specific user
 */
export const getUserAgents = async (userId: string): Promise<Agent[]> => {
  try {
    const response = await fetchFromAPI(`/api/collections/agents/records?perPage=500`);

    const agents = (response.items || []).filter((agent: any) => agent.user_id === userId);
    return agents.map((agent: any) => mapPocketbaseToAgent(agent));
  } catch (error) {
    console.error('Error fetching user agents:', error);
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

    const response = await fetchFromAPI(`/api/collections/agents/records?perPage=500`);

    const agents = (response.items || []).filter((agent: any) =>
      agent.user_id === user.id && agent.status === (statusMap[status] || status)
    );

    return agents.map((agent: any) => mapPocketbaseToAgent(agent));
  } catch (error) {
    console.error('Error fetching agents by status:', error);
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
    const user = await getCurrentUser();
    const data = await fetchFromAPI(`/api/collections/agents/records`, {
      method: 'POST',
      body: JSON.stringify({
        ...agent,
        user_id: user?.id,
      }),
    });

    return { data: mapPocketbaseToAgent(data), error: null };
  } catch (error) {
    console.error('Error creating agent:', error);
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
    const data = await fetchFromAPI(`/api/collections/agents/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    return { data: mapPocketbaseToAgent(data), error: null };
  } catch (error) {
    console.error('Error updating agent:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Delete an agent
 */
export const deleteAgent = async (id: string): Promise<{ error: Error | null }> => {
  try {
    await fetchFromAPI(`/api/collections/agents/records/${id}`, {
      method: 'DELETE',
    });

    return { error: null };
  } catch (error) {
    console.error('Error deleting agent:', error);
    return { error: error as Error };
  }
};

/**
 * Fetch agent metrics
 */
export const fetchAgentMetrics = async (
  agentId: string,
  limit: number = 5
): Promise<AgentMetric[]> => {
  try {
    const response = await fetchFromAPI(`/api/collections/agent_metrics/records?perPage=500`);

    const metrics = (response.items || [])
      .filter((m: any) => m.agent_id === agentId)
      .slice(0, limit);

    return metrics as AgentMetric[];
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    return [];
  }
};

/**
 * Fetch agent details with metrics
 */
export const getAgentDetails = async (agent: Agent): Promise<AgentWithRelations> => {
  try {
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
    console.error('Error getting agent stats:', error);
    return { online: 0, offline: 0, total: 0 };
  }
};

/**
 * Determine real-time agent status
 */
export const getAgentRealTimeStatus = (agent: Agent): 'active' | 'inactive' => {
  if (agent.websocket_connected) {
    return 'active';
  }

  if (!agent.last_seen) {
    return 'inactive';
  }

  const lastSeenTime = new Date(agent.last_seen).getTime();
  const now = Date.now();
  const sixtySecondsAgo = now - (60 * 1000);

  return lastSeenTime >= sixtySecondsAgo ? 'active' : 'inactive';
};
