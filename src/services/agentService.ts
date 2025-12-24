import { pb } from '@/lib/pocketbase';
import { getCurrentUser } from './authService';

export interface Agent {
  id: string;
  user_id: string;
  hostname: string;
  os_type: string;
  os_info: string;
  os_version: string;
  version: string;
  primary_ip: string;
  kernel_version: string;
  arch: string;
  all_ips: string[];
  platform_family: string;
  status: 'active' | 'inactive' | 'revoked';
  last_seen: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  websocket_connected?: boolean;
}

export interface FilesystemStats {
  device: string;
  mount_path: string;
  used_gb: number;
  free_gb: number;
  total_gb: number;
  usage_percent: number;
}

export interface LoadAverage {
  load1: number;
  load5: number;
  load15: number;
}

export interface NetworkStats {
  in_gb: number;
  out_gb: number;
}

export interface AgentMetric {
  id: string;
  agent_id: string;
  cpu_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  memory_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  disk_usage_percent: number;
  filesystems: FilesystemStats[];
  load_avg_1min: number;
  load_avg_5min: number;
  load_avg_15min: number;
  network_in_gb: number;
  network_out_gb: number;
  created_at: string;
  cpu_cores: number;
}

export interface AgentWithRelations extends Agent {
  metrics?: AgentMetric[];
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
 * Fetch agents with pagination
 */
export const getAgentsPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  statusFilter: 'active' | 'inactive' | 'all' = 'active'
): Promise<PaginatedAgents> => {
  try {
    const user = pb.authStore.model;
    if (!user) {
      return { agents: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Simplified filter: just user_id
    const filter = `user_id = "${user.id}"`;

    const result = await pb.collection('agents').getList(page, pageSize, {
      filter: filter,
      sort: '-id', // Changed from -created to -id as created is not sortable
    });

    const agents = result.items.map((record: any) => {
      return {
        id: record.id,
        user_id: record.user_id,
        hostname: record.hostname,
        os_type: record.os_type,
        os_info: record.os_info,
        os_version: record.os_version,
        version: record.version,
        primary_ip: record.primary_ip,
        kernel_version: record.kernel_version,
        arch: record.arch,
        all_ips: record.all_ips,
        platform_family: record.platform_family,
        status: 'active',
        last_seen: record.last_seen,
        created_at: record.created,
        updated_at: record.updated,
        metadata: record.metadata || {},
        websocket_connected: true,
      } as AgentWithRelations;
    });

    return {
      agents,
      total: result.totalItems,
      page: result.page,
      pageSize: result.perPage,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error('Error fetching agents:', error);
    return { agents: [], total: 0, page, pageSize, totalPages: 0 };
  }
};

/**
 * Fetch agent metrics
 */
export const getAgentMetrics = async (agentId: string): Promise<AgentMetric[]> => {
  try {
    const result = await pb.collection('agent_metrics').getList(1, 50, {
      filter: `agent_id = "${agentId}"`,
      sort: '-created',
    });

    return result.items.map((record: any) => ({
      id: record.id,
      agent_id: record.agent_id,
      cpu_percent: record.cpu_percent,
      memory_used_gb: record.memory_used_gb,
      memory_total_gb: record.memory_total_gb,
      memory_percent: record.memory_percent,
      disk_used_gb: record.disk_used_gb,
      disk_total_gb: record.disk_total_gb,
      disk_usage_percent: record.disk_usage_percent,
      filesystems: typeof record.filesystems === 'string' ? JSON.parse(record.filesystems) : (record.filesystems || []),
      load_avg_1min: record.load_avg_1min,
      load_avg_5min: record.load_avg_5min,
      load_avg_15min: record.load_avg_15min,
      network_in_gb: record.network_in_gb,
      network_out_gb: record.network_out_gb,
      created_at: record.created,
      cpu_cores: record.cpu_cores,
    })) as unknown as AgentMetric[];
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    return [];
  }
};

/**
 * Fetch all agents
 */
export const getAgents = async (): Promise<Agent[]> => {
  try {
    const user = pb.authStore.model;
    if (!user) return [];

    const records = await pb.collection('agents').getFullList({
      filter: `user_id = "${user.id}"`,
      sort: '-id', // Changed from -created
    });

    return records.map((record: any) => {
      // Simplified status logic
      const isActive = true;
      
      return {
        ...record,
        status: isActive ? 'active' : 'inactive',
        created_at: record.created,
        updated_at: record.updated,
      };
    }) as unknown as Agent[];
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
    const records = await pb.collection('agents').getFullList({
      filter: `user_id = "${userId}"`,
      sort: '-id', // Changed from -created
    });

    return records.map((record: any) => {
      // Simplified status logic
      const isActive = true;
      
      return {
        ...record,
        status: isActive ? 'active' : 'inactive',
        created_at: record.created,
        updated_at: record.updated,
      };
    }) as unknown as Agent[];
  } catch (error) {
    console.error('Error fetching user agents:', error);
    return [];
  }
};

/**
 * Fetch agents by status
 */
export const getAgentsByStatus = async (status: 'active' | 'inactive'): Promise<Agent[]> => {
  try {
    const user = pb.authStore.model;
    if (!user) return [];

    // Simplified: return all agents for now as status filtering is not supported by backend yet
    const records = await pb.collection('agents').getFullList({
      filter: `user_id = "${user.id}"`,
      sort: '-id', // Changed from -created
    });

    return records.map((record: any) => {
      // Simplified status logic
      const isActive = true;
      
      return {
        ...record,
        status: isActive ? 'active' : 'inactive',
        created_at: record.created,
        updated_at: record.updated,
      };
    }) as unknown as Agent[];
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
    const user = pb.authStore.model;
    // Remove status from payload as it's computed
    const { status, ...agentData } = agent;
    
    const record = await pb.collection('agents').create({
      ...agentData,
      user_id: user?.id,
    });

    return { 
      data: {
        ...record,
        created_at: record.created,
        updated_at: record.updated,
      } as unknown as Agent, 
      error: null 
    };
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
    // Remove status from updates as it's computed
    const { status, ...updateData } = updates;
    
    const record = await pb.collection('agents').update(id, updateData);

    return { 
      data: {
        ...record,
        created_at: record.created,
        updated_at: record.updated,
      } as unknown as Agent, 
      error: null 
    };
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
    await pb.collection('agents').delete(id);
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
    const result = await pb.collection('agent_metrics').getList(1, limit, {
      filter: `agent_id = "${agentId}"`,
      sort: '-id', // Changed from -created
    });

    return result.items.map((record: any) => ({
      id: record.id,
      agent_id: record.agent_id,
      cpu_percent: record.cpu_percent,
      memory_used_gb: record.memory_used_gb,
      memory_total_gb: record.memory_total_gb,
      memory_percent: record.memory_percent,
      disk_used_gb: record.disk_used_gb,
      disk_total_gb: record.disk_total_gb,
      disk_usage_percent: record.disk_usage_percent,
      filesystems: typeof record.filesystems === 'string' ? JSON.parse(record.filesystems) : (record.filesystems || []),
      load_avg_1min: record.load_avg_1min,
      load_avg_5min: record.load_avg_5min,
      load_avg_15min: record.load_avg_15min,
      network_in_gb: record.network_in_gb,
      network_out_gb: record.network_out_gb,
      created_at: record.created,
      cpu_cores: record.cpu_cores,
    })) as unknown as AgentMetric[];
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
      lastMetric: metrics?.[0] || undefined,
    };
  } catch (error) {
    console.error('Error fetching agent details:', error);
    return {
      ...agent,
      metrics: undefined,
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
    const offline = agents.filter(agent => agent.status === 'inactive').length;
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
  // Simplified: always return active as per user request
  return 'active';
};
