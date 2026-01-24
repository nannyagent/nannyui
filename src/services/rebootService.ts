import { pb } from '@/lib/pocketbase';
import { RebootOperationRecord, RebootScheduleRecord } from '@/integrations/pocketbase/types';

export type RebootOperation = RebootOperationRecord;
export type RebootSchedule = RebootScheduleRecord;

export type RebootStatus = 'pending' | 'sent' | 'rebooting' | 'completed' | 'failed' | 'timeout';

/**
 * Get the proxmox_lxc record ID from lxc_id
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

/**
 * Create a reboot operation for an agent or LXC container
 */
export const createRebootOperation = async (
  agentId: string,
  reason?: string,
  lxcId?: string,
  timeoutSeconds: number = 300
): Promise<{ rebootId: string; status: string }> => {
  try {
    const user = pb.authStore.record;
    if (!user) throw new Error('User not authenticated');

    const payload: Record<string, unknown> = {
      user_id: user.id,
      agent_id: agentId,
      status: 'pending',
      reason: reason || 'Manual reboot request',
      timeout_seconds: timeoutSeconds,
      requested_at: new Date().toISOString(),
    };

    // Resolve lxc_id to proxmox_lxc record ID
    if (lxcId) {
      const proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        payload.lxc_id = proxmoxLxcId;
      }
    }

    const record = await pb.collection('reboot_operations').create(payload);
    
    return {
      rebootId: record.id,
      status: record.status,
    };
  } catch (error) {
    console.error('Error creating reboot operation:', error);
    throw error;
  }
};

/**
 * Get reboot operation details
 */
export const getRebootOperation = async (id: string): Promise<RebootOperation | null> => {
  try {
    const record = await pb.collection('reboot_operations').getOne(id, {
      expand: 'agent_id,lxc_id',
    });
    
    return {
      ...record,
      created: record.created,
      updated: record.updated,
    } as unknown as RebootOperation;
  } catch (error) {
    console.error('Error fetching reboot operation:', error);
    return null;
  }
};

/**
 * Get reboot history for a specific agent
 */
export const getRebootHistory = async (
  agentId: string,
  limit: number = 10,
  lxcId?: string
): Promise<RebootOperation[]> => {
  try {
    let filterStr = `agent_id = "${agentId}"`;
    if (lxcId) {
      const proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        filterStr += ` && lxc_id = "${proxmoxLxcId}"`;
      }
    }

    const result = await pb.collection('reboot_operations').getList(1, limit, {
      filter: filterStr,
      sort: '-id',
      expand: 'agent_id,lxc_id',
    });

    return result.items.map((record) => ({
      ...record,
      created: record.created,
      updated: record.updated,
    })) as unknown as RebootOperation[];
  } catch (error) {
    console.error('Error fetching reboot history:', error);
    return [];
  }
};

/**
 * List all reboot operations (paginated)
 */
export const listAllRebootOperations = async (
  page: number = 1,
  limit: number = 10,
  filter: string = ''
): Promise<{ operations: RebootOperation[]; total: number }> => {
  try {
    const result = await pb.collection('reboot_operations').getList(page, limit, {
      filter: filter,
      sort: '-id',
      expand: 'agent_id,lxc_id',
    });

    const operations = result.items.map((record) => ({
      ...record,
      created: record.created,
      updated: record.updated,
      agent_name: record.expand?.agent_id?.hostname || 'Unknown Agent',
      lxc_name: record.expand?.lxc_id?.name || undefined,
    })) as unknown as RebootOperation[];

    return {
      operations,
      total: result.totalItems,
    };
  } catch (error) {
    console.error('Error listing reboot operations:', error);
    return { operations: [], total: 0 };
  }
};

/**
 * Poll for reboot operation completion
 */
export const waitForRebootOperation = async (
  operationId: string,
  onProgress?: (status: RebootStatus) => void
): Promise<RebootOperation | null> => {
  const pollInterval = 5000;
  const maxAttempts = 120; // 10 minutes (5s * 120)

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const record = await pb.collection('reboot_operations').getOne(operationId);

      if (onProgress) {
        onProgress(record.status as RebootStatus);
      }

      if (['completed', 'failed', 'timeout'].includes(record.status)) {
        return record as unknown as RebootOperation;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error polling reboot operation:', error);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  return null;
};

/**
 * Check agent connection status (for reboot verification)
 */
export const checkAgentRebootStatus = async (agentId: string): Promise<boolean> => {
  try {
    const agent = await pb.collection('agents').getOne(agentId);
    return agent.websocket_connected === true;
  } catch (error) {
    console.error('Error checking agent status:', error);
    return false;
  }
};

// ==================== REBOOT SCHEDULES ====================

/**
 * Get reboot schedules for an agent
 */
export const getRebootSchedules = async (
  agentId: string,
  lxcId?: string
): Promise<RebootSchedule[]> => {
  try {
    let filterStr = `agent_id = "${agentId}"`;
    if (lxcId) {
      const proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        filterStr += ` && lxc_id = "${proxmoxLxcId}"`;
      }
    } else {
      filterStr += ` && lxc_id = ""`;
    }

    const result = await pb.collection('reboot_schedules').getList(1, 50, {
      filter: filterStr,
    });

    return result.items.map((record) => ({
      ...record,
    })) as unknown as RebootSchedule[];
  } catch (error) {
    console.error('Error fetching reboot schedules:', error);
    return [];
  }
};

/**
 * Save or update a reboot schedule
 */
export const saveRebootSchedule = async (
  agentId: string,
  cronExpression: string,
  reason: string = 'Scheduled maintenance reboot',
  isActive: boolean = true,
  lxcId?: string
): Promise<boolean> => {
  try {
    const user = pb.authStore.record;
    if (!user) throw new Error('User not authenticated');

    // Check if schedule exists for this agent/lxc combination
    let filterStr = `agent_id = "${agentId}"`;
    let proxmoxLxcId: string | null = null;
    
    if (lxcId) {
      proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        filterStr += ` && lxc_id = "${proxmoxLxcId}"`;
      }
    } else {
      filterStr += ` && lxc_id = ""`;
    }

    const existing = await pb.collection('reboot_schedules').getList(1, 1, {
      filter: filterStr,
    });

    const payload: Record<string, unknown> = {
      user_id: user.id,
      agent_id: agentId,
      cron_expression: cronExpression,
      reason: reason,
      is_active: isActive,
    };

    if (proxmoxLxcId) {
      payload.lxc_id = proxmoxLxcId;
    }

    if (existing.items.length > 0) {
      await pb.collection('reboot_schedules').update(existing.items[0].id, payload);
    } else {
      await pb.collection('reboot_schedules').create(payload);
    }

    return true;
  } catch (error) {
    console.error('Error saving reboot schedule:', error);
    return false;
  }
};

/**
 * Delete a reboot schedule
 */
export const deleteRebootSchedule = async (scheduleId: string): Promise<boolean> => {
  try {
    await pb.collection('reboot_schedules').delete(scheduleId);
    return true;
  } catch (error) {
    console.error('Error deleting reboot schedule:', error);
    return false;
  }
};

/**
 * Toggle reboot schedule active state
 */
export const toggleRebootSchedule = async (
  scheduleId: string,
  isActive: boolean
): Promise<boolean> => {
  try {
    await pb.collection('reboot_schedules').update(scheduleId, {
      is_active: isActive,
    });
    return true;
  } catch (error) {
    console.error('Error toggling reboot schedule:', error);
    return false;
  }
};

/**
 * List all reboot schedules (paginated)
 */
export const listAllRebootSchedules = async (
  page: number = 1,
  limit: number = 10
): Promise<{ schedules: RebootSchedule[]; total: number }> => {
  try {
    const result = await pb.collection('reboot_schedules').getList(page, limit, {
      sort: '-id',
      expand: 'agent_id,lxc_id',
    });

    const schedules = result.items.map((record) => ({
      ...record,
      agent_name: record.expand?.agent_id?.hostname || 'Unknown Agent',
      lxc_name: record.expand?.lxc_id?.name || undefined,
    })) as unknown as RebootSchedule[];

    return {
      schedules,
      total: result.totalItems,
    };
  } catch (error) {
    console.error('Error listing reboot schedules:', error);
    return { schedules: [], total: 0 };
  }
};

// ==================== ALIASES FOR COMPATIBILITY ====================

// Alias for backward compatibility with old RebootDialog
export const triggerAgentReboot = async (
  agentId: string,
  reason?: string,
  lxcId?: string
): Promise<boolean> => {
  try {
    await createRebootOperation(agentId, reason, lxcId);
    return true;
  } catch (error) {
    console.error('Error triggering reboot:', error);
    return false;
  }
};
