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
      filter: `agent_id = "${agentId}"`,
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
      filter: `agent_id = "${agentId}"`,
      sort: 'vmid',
    });
    return result as unknown as ProxmoxQemuRecord[];
  } catch (error) {
    console.error('Error fetching proxmox qemus:', error);
    return [];
  }
};
