import { pb } from '@/lib/pocketbase';

/**
 * Get the proxmox_lxc record ID from lxc_id
 * Shared utility used by both reboot and patch services
 */
export const getProxmoxLxcId = async (agentId: string, lxcId: string): Promise<string | null> => {
  try {
    const filter = pb.filter('agent_id = {:agentId} && lxc_id = {:lxcId}', { agentId, lxcId });
    const result = await pb.collection('proxmox_lxc').getList(1, 1, { filter });
    
    if (result.items.length > 0) {
      return result.items[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error fetching proxmox_lxc ID:', error);
    return null;
  }
};
