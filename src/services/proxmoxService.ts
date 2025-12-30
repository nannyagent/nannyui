import { pb } from '@/lib/pocketbase';
import { 
  ProxmoxClusterRecord, 
  ProxmoxNodeRecord, 
  ProxmoxLxcRecord, 
  ProxmoxQemuRecord 
} from '@/integrations/pocketbase/types';

export const getProxmoxCluster = async (agentId: string): Promise<ProxmoxClusterRecord | null> => {
  try {
    // First get the node to find the cluster ID
    const nodes = await pb.collection('proxmox_nodes').getList(1, 1, {
      filter: `agent_id = "${agentId}"`,
    });

    if (nodes.items.length === 0) {
      return null;
    }

    const node = nodes.items[0] as unknown as ProxmoxNodeRecord;
    if (!node.cluster_id) {
      return null;
    }

    const result = await pb.collection('proxmox_cluster').getList(1, 1, {
      filter: `px_cluster_id = "${node.cluster_id}"`,
      sort: '-created',
      requestKey: null, // Disable auto-cancellation
    });
    return result.items.length > 0 ? (result.items[0] as unknown as ProxmoxClusterRecord) : null;
  } catch (error) {
    console.error('Error fetching proxmox cluster:', error);
    return null;
  }
};

export const getProxmoxNodes = async (agentId: string): Promise<ProxmoxNodeRecord[]> => {
  try {
    const result = await pb.collection('proxmox_nodes').getFullList({
      filter: `agent_id = "${agentId}"`,
      sort: 'name',
      requestKey: null, // Disable auto-cancellation
    });
    return result as unknown as ProxmoxNodeRecord[];
  } catch (error) {
    console.error('Error fetching proxmox nodes:', error);
    return [];
  }
};

export const getProxmoxLxcs = async (agentId: string): Promise<ProxmoxLxcRecord[]> => {
  try {
    const result = await pb.collection('proxmox_lxc').getFullList({
      filter: pb.filter('agent_id = {:agentId}', { agentId }),
      sort: 'vmid',
    });
    return result as unknown as ProxmoxLxcRecord[];
  } catch (error) {
    console.error('Error fetching proxmox lxcs:', error);
    return [];
  }
};

export const getProxmoxQemus = async (agentId: string): Promise<ProxmoxQemuRecord[]> => {
  try {
    const result = await pb.collection('proxmox_qemu').getFullList({
      filter: pb.filter('agent_id = {:agentId}', { agentId }),
      sort: 'vmid',
    });
    return result as unknown as ProxmoxQemuRecord[];
  } catch (error) {
    console.error('Error fetching proxmox qemus:', error);
    return [];
  }
};

// Get all clusters for current user
export const getAllProxmoxClusters = async (): Promise<ProxmoxClusterRecord[]> => {
  try {
    const result = await pb.collection('proxmox_cluster').getFullList({
      sort: 'cluster_name',
    });
    return result as unknown as ProxmoxClusterRecord[];
  } catch (error) {
    console.error('Error fetching all proxmox clusters:', error);
    return [];
  }
};

// Get all nodes for current user
export const getAllProxmoxNodes = async (): Promise<ProxmoxNodeRecord[]> => {
  try {
    const result = await pb.collection('proxmox_nodes').getFullList({
      sort: 'name',
    });
    return result as unknown as ProxmoxNodeRecord[];
  } catch (error) {
    console.error('Error fetching all proxmox nodes:', error);
    return [];
  }
};

// Get all LXCs paginated
export const getAllProxmoxLxcsPaginated = async (
  page: number = 1, 
  limit: number = 20,
  nodeFilter?: string,
  search?: string
): Promise<{ items: ProxmoxLxcRecord[], total: number, totalPages: number }> => {
  try {
    let filter = '';
    const filterParts: string[] = [];
    
    if (nodeFilter) {
      filterParts.push(`node = "${nodeFilter}"`);
    }
    
    if (search) {
      filterParts.push(`(name ~ "${search}" || vmid ~ "${search}")`);
    }
    
    if (filterParts.length > 0) {
      filter = filterParts.join(' && ');
    }
    
    const result = await pb.collection('proxmox_lxc').getList(page, limit, {
      filter,
      sort: 'vmid',
    });
    
    return {
      items: result.items as unknown as ProxmoxLxcRecord[],
      total: result.totalItems,
      totalPages: result.totalPages
    };
  } catch (error) {
    console.error('Error fetching all proxmox lxcs:', error);
    return { items: [], total: 0, totalPages: 0 };
  }
};

// Get all QEMUs paginated
export const getAllProxmoxQemusPaginated = async (
  page: number = 1, 
  limit: number = 20,
  nodeFilter?: string,
  search?: string
): Promise<{ items: ProxmoxQemuRecord[], total: number, totalPages: number }> => {
  try {
    let filter = '';
    const filterParts: string[] = [];
    
    if (nodeFilter) {
      filterParts.push(`node = "${nodeFilter}"`);
    }
    
    if (search) {
      filterParts.push(`(name ~ "${search}" || vmid ~ "${search}")`);
    }
    
    if (filterParts.length > 0) {
      filter = filterParts.join(' && ');
    }
    
    const result = await pb.collection('proxmox_qemu').getList(page, limit, {
      filter,
      sort: 'vmid',
    });
    
    return {
      items: result.items as unknown as ProxmoxQemuRecord[],
      total: result.totalItems,
      totalPages: result.totalPages
    };
  } catch (error) {
    console.error('Error fetching all proxmox qemus:', error);
    return { items: [], total: 0, totalPages: 0 };
  }
};

// Check if agent has Proxmox installed
export const hasProxmoxInstalled = async (agentId: string): Promise<boolean> => {
  try {
    const result = await pb.collection('proxmox_nodes').getList(1, 1, {
      filter: `agent_id = "${agentId}"`,
    });
    return result.items.length > 0;
  } catch (error) {
    console.error('Error checking proxmox installation:', error);
    return false;
  }
};

// Get LXC patch history
export const getLxcPatchHistory = async (lxcId: string, limit: number = 10) => {
  try {
    const result = await pb.collection('patch_operations').getList(1, limit, {
      filter: pb.filter('lxc_id = {:lxcId}', { lxcId }),
      sort: '-created',
    });
    return result.items;
  } catch (error) {
    console.error('Error fetching LXC patch history:', error);
    return [];
  }
};

// Get LXC patch schedule
export const getLxcPatchSchedule = async (agentId: string, lxcId: string) => {
  try {
    const result = await pb.collection('patch_schedules').getList(1, 1, {
      filter: pb.filter('agent_id = {:agentId} && lxc_id = {:lxcId}', { agentId, lxcId }),
    });
    return result.items.length > 0 ? result.items[0] : null;
  } catch (error) {
    console.error('Error fetching LXC patch schedule:', error);
    return null;
  }
};

// Check if LXC already has a schedule
export const hasExistingSchedule = async (agentId: string, lxcId: string): Promise<boolean> => {
  try {
    const result = await pb.collection('patch_schedules').getList(1, 1, {
      filter: pb.filter('agent_id = {:agentId} && lxc_id = {:lxcId} && is_active = true', { agentId, lxcId }),
    });
    return result.items.length > 0;
  } catch (error) {
    console.error('Error checking existing schedule:', error);
    return false;
  }
};

// Get patch statistics by cluster
export const getPatchStatsByCluster = async (clusterId: string) => {
  try {
    // Get all nodes in cluster
    const nodes = await pb.collection('proxmox_nodes').getFullList({
      filter: `cluster_id = "${clusterId}"`,
    });
    
    const nodeIds = nodes.map(n => n.id);
    
    // Get all LXCs in those nodes
    const lxcs = await pb.collection('proxmox_lxc').getFullList();
    const lxcIds = lxcs.filter(l => nodeIds.includes(l.node_id)).map(l => l.id);
    
    if (lxcIds.length === 0) {
      return { total: 0, completed: 0, failed: 0, successRate: 0 };
    }
    
    // Get patch operations for those LXCs
    const operations = await pb.collection('patch_operations').getFullList({
      filter: lxcIds.map(id => `lxc_id = "${id}"`).join(' || '),
    });
    
    const completed = operations.filter(o => o.status === 'completed').length;
    const failed = operations.filter(o => o.status === 'failed').length;
    const total = operations.length;
    
    return {
      total,
      completed,
      failed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching patch stats by cluster:', error);
    return { total: 0, completed: 0, failed: 0, successRate: 0 };
  }
};

// Get patch statistics by node
export const getPatchStatsByNode = async (nodeId: string) => {
  try {
    // Get all LXCs in this node
    const lxcs = await pb.collection('proxmox_lxc').getFullList({
      filter: `node_id = "${nodeId}"`,
    });
    
    const lxcIds = lxcs.map(l => l.id);
    
    if (lxcIds.length === 0) {
      return { total: 0, completed: 0, failed: 0, successRate: 0 };
    }
    
    // Get patch operations for those LXCs
    const operations = await pb.collection('patch_operations').getFullList({
      filter: lxcIds.map(id => `lxc_id = "${id}"`).join(' || '),
    });
    
    const completed = operations.filter(o => o.status === 'completed').length;
    const failed = operations.filter(o => o.status === 'failed').length;
    const total = operations.length;
    
    return {
      total,
      completed,
      failed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching patch stats by node:', error);
    return { total: 0, completed: 0, failed: 0, successRate: 0 };
  }
};

// Get upcoming scheduled patches
export const getUpcomingScheduledPatches = async (limit: number = 10) => {
  try {
    const result = await pb.collection('patch_schedules').getList(1, limit, {
      filter: 'is_active = true',
      sort: 'next_run',
      expand: 'agent_id,lxc_id',
    });
    return result.items;
  } catch (error) {
    console.error('Error fetching upcoming scheduled patches:', error);
    return [];
  }
};
