import { pb } from '@/lib/pocketbase';
import { PatchOperationRecord, PatchScheduleRecord, PackageExceptionRecord } from '@/integrations/pocketbase/types';

export interface Vulnerability {
  cve_id?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  cvss_score?: number;
}

export interface Package {
  name: string;
  current_version: string;
  available_version: string;
  upgrade_available: boolean;
  package_type: string;
  vulnerabilities: Vulnerability[];
}

export interface KernelUpgrade {
  available: boolean;
  current_version: string;
  available_version: string;
  vulnerabilities: Vulnerability[];
}

export interface OsUpgrade {
  available: boolean;
  current_version: string;
  available_version: string;
  description: string;
}

export interface Summary {
  total_packages_checked: number;
  packages_with_updates: number;
  critical_vulnerabilities: number;
  high_vulnerabilities: number;
  medium_vulnerabilities: number;
  low_vulnerabilities: number;
}

export interface PatchManagementData {
  packages: Package[];
  kernel_upgrade: KernelUpgrade;
  os_upgrade: OsUpgrade;
  summary: Summary;
  recommendations: string[];
  last_checked: string;
  os_distribution?: string;
  os_version?: string;
  architecture?: string;
  kernel_version?: string;
  package_manager?: string;
  analysis_timestamp?: string;
}

export type PatchOperation = PatchOperationRecord;
export type PatchSchedule = PatchScheduleRecord;
export type PackageException = PackageExceptionRecord;

/**
 * Get the latest patch status for an agent
 */
export const getPatchStatus = async (agentId: string): Promise<PatchManagementData | null> => {
  try {
    // Get the latest completed 'check' operation
    const filter = pb.filter('agent_id = {:agentId} && mode = "dry-run" && status = "completed"', { agentId });
    const result = await pb.collection('patch_operations').getList(1, 1, {
      filter,
      sort: '-id', // Changed from -created
    });

    if (result.items.length === 0) {
      return null;
    }

    const operation = result.items[0];
    
    // Fetch the stdout file content
    if (operation.stdout_file) {
      const url = pb.files.getURL(operation, operation.stdout_file);
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        // Extract JSON from text if marker exists, otherwise try parsing full text
        const marker = '=== JSON Output (for UI parsing) ===';
        const jsonStart = text.indexOf(marker);
        
        let data;
        if (jsonStart !== -1) {
          const jsonText = text.substring(jsonStart + marker.length).trim();
          try {
            data = JSON.parse(jsonText);
          } catch (e) {
            console.warn('Failed to parse extracted JSON, trying full text fallback', e);
            // Fallback to parsing full text if extraction fails (though unlikely if marker exists)
             try {
                data = JSON.parse(text);
             } catch (e2) {
                 console.error('Failed to parse JSON from stdout', e2);
                 return null;
             }
          }
        } else {
             try {
                data = JSON.parse(text);
             } catch (e) {
                 // If it's not JSON, it might be raw text output. 
                 // For getPatchStatus we expect JSON structure for PatchManagementData.
                 // If we can't parse it, we can't return valid data.
                 console.error('Failed to parse JSON from stdout (no marker)', e);
                 return null;
             }
        }

        return {
          ...data,
          last_checked: operation.created,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching patch status:', error);
    return null;
  }
};

/**
 * Get patch operation details including parsed stdout
 */
export const getPatchOperationDetails = async (id: string): Promise<PatchOperation & { parsedOutput?: unknown }> => {
  try {
    const operation = await pb.collection('patch_operations').getOne(id);
    
    let parsedOutput = null;
    if (operation.stdout_file) {
      const url = pb.files.getURL(operation, operation.stdout_file);
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        // Extract JSON from text
        // The example shows "=== JSON Output (for UI parsing) ===" followed by JSON
        const marker = '=== JSON Output (for UI parsing) ===';
        const jsonStart = text.indexOf(marker);
        
        if (jsonStart !== -1) {
          const jsonText = text.substring(jsonStart + marker.length).trim();
          try {
            parsedOutput = JSON.parse(jsonText);
          } catch (e) {
            console.error('Failed to parse JSON from stdout section:', e);
          }
        } else {
            // Fallback: try parsing the whole text
            try {
                parsedOutput = parseStdoutJson(text);
            } catch {
                // ignore
            }
        }
      }
    }

    return {
      ...operation,
      parsedOutput,
      created: operation.created,
      updated: operation.updated,
    } as unknown as PatchOperation & { parsedOutput?: unknown };
  } catch (error) {
    console.error('Error fetching patch operation details:', error);
    throw error;
  }
};


/**
 * Run a patch check
 */
export const runPatchCheck = async (agentId: string, lxcId?: string): Promise<string> => {
  try {
    const user = pb.authStore.record;
    
    // Fetch agent to get platform_family
    const agent = await pb.collection('agents').getOne(agentId);

    const payload: Record<string, unknown> = {
      agent_id: agentId,
      user_id: user?.id,
      mode: 'dry-run',
      status: 'pending',
    };

    // Resolve lxc_id to proxmox_lxc record ID
    if (lxcId) {
      const proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        payload.lxc_id = proxmoxLxcId;
      }
    }

    const record = await pb.collection('patch_operations').create(payload);
    return record.id;
  } catch (error) {
    console.error('Error running patch check:', error);
    throw error;
  }
};

/**
 * Apply patches
 */
export const applyPatches = async (agentId: string, packageNames: string[], lxcId?: string): Promise<string> => {
  try {
    const user = pb.authStore.record;

    // Fetch agent to get platform_family
    const agent = await pb.collection('agents').getOne(agentId);

    const payload: Record<string, unknown> = {
      agent_id: agentId,
      user_id: user?.id,
      mode: 'apply',
      status: 'pending',
      metadata: {
        packages: packageNames,
      },
    };

    // Resolve lxc_id to proxmox_lxc record ID
    if (lxcId) {
      const proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        payload.lxc_id = proxmoxLxcId;
      }
    }

    const record = await pb.collection('patch_operations').create(payload);
    return record.id;
  } catch (error) {
    console.error('Error applying patches:', error);
    throw error;
  }
};

/**
 * Get patch history
 */
export const getPatchHistory = async (agentId: string, limit: number = 10): Promise<PatchOperation[]> => {
  try {
    const filter = pb.filter('agent_id = {:agentId}', { agentId });
    const result = await pb.collection('patch_operations').getList(1, limit, {
      filter,
      sort: '-id', // Changed from -created
    });
    
    return result.items.map((record) => ({
      ...record,
      created: record.created,
      updated: record.updated,
    })) as unknown as PatchOperation[];
  } catch (error) {
    console.error('Error fetching patch history:', error);
    return [];
  }
};

/**
 * Poll for operation completion
 */
export const waitForPatchOperation = async (
  operationId: string, 
  onProgress?: (status: string) => void
): Promise<PatchOperation | null> => {
  const pollInterval = 2000;
  const maxAttempts = 300; // 10 minutes
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const record = await pb.collection('patch_operations').getOne(operationId);
      
      if (onProgress) {
        onProgress(record.status);
      }
      
      if (record.status === 'completed' || record.status === 'failed') {
        return record as unknown as PatchOperation;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error polling patch operation:', error);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  return null;
};

/**
 * Get scheduled patches
 */
export const getScheduledPatches = async (agentId: string, lxcId?: string): Promise<PatchSchedule[]> => {
  try {
    const filter = pb.filter('agent_id = {:agentId} && lxc_id = {:lxcId}', { 
      agentId, 
      lxcId: lxcId || "" 
    });

    const result = await pb.collection('patch_schedules').getList(1, 50, {
      filter,
    });
    return result.items.map((record) => ({
      ...record,
    })) as unknown as PatchSchedule[];
  } catch (error) {
    console.error('Error fetching patch schedules:', error);
    return [];
  }
};

/**
 * Get package exceptions
 */
export const getPackageExceptions = async (agentId: string): Promise<PackageException[]> => {
  try {
    const result = await pb.collection('package_exceptions').getList(1, 50, {
      filter: `agent_id = "${agentId}"`,
    });
    return result.items.map((record) => ({
      ...record,
    })) as unknown as PackageException[];
  } catch (error) {
    console.error('Error fetching package exceptions:', error);
    return [];
  }
};

/**
 * Add a package exception
 */
export const addPackageException = async (
  agentId: string,
  packageName: string,
  reason: string,
  isActive: boolean = true
): Promise<PackageException | null> => {
  try {
    const user = pb.authStore.record;
    if (!user) throw new Error('User not authenticated');

    const record = await pb.collection('package_exceptions').create({
      agent_id: agentId,
      package_name: packageName,
      reason: reason,
      user_id: user.id,
      is_active: isActive,
    });

    return {
      ...record,
    } as unknown as PackageException;
  } catch (error) {
    console.error('Error adding package exception:', error);
    return null;
  }
};

/**
 * Remove a package exception
 */
export const removePackageException = async (exceptionId: string): Promise<boolean> => {
  try {
    await pb.collection('package_exceptions').delete(exceptionId);
    return true;
  } catch (error) {
    console.error('Error removing package exception:', error);
    return false;
  }
};

/**
 * Save cron schedule
 */
export const saveCronSchedule = async (
  agentId: string,
  cronExpression: string,
  isActive: boolean = true,
  lxcId?: string
): Promise<boolean> => {
  try {
    // Check if schedule exists
    const filter = pb.filter('agent_id = {:agentId} && lxc_id = {:lxcId}', { 
      agentId, 
      lxcId: lxcId || ""
    });

    const existing = await pb.collection('patch_schedules').getList(1, 1, {
      filter,
    });

    const payload: Record<string, unknown> = {
      user_id: pb.authStore.record?.id,
      agent_id: agentId,
      cron_expression: cronExpression,
      is_active: isActive,
    };

    // Resolve lxc_id to proxmox_lxc record ID
    if (lxcId) {
      const proxmoxLxcId = await getProxmoxLxcId(agentId, lxcId);
      if (proxmoxLxcId) {
        payload.lxc_id = proxmoxLxcId;
      }
    }

    if (existing.items.length > 0) {
      await pb.collection('patch_schedules').update(existing.items[0].id, payload);
    } else {
      await pb.collection('patch_schedules').create(payload);
    }
    return true;
  } catch (error) {
    console.error('Error saving cron schedule:', error);
    return false;
  }
};

/**
 * Trigger agent reboot
 */
export const triggerAgentReboot = async (agentId: string): Promise<boolean> => {
  try {
    await pb.collection('agent_commands').create({
      agent_id: agentId,
      command: 'reboot',
      status: 'pending',
    });
    return true;
  } catch (error) {
    console.error('Error triggering reboot:', error);
    return false;
  }
};

/**
 * Check agent connection
 * TO-DO : TO BE IMPLEMENTED BASED ON METRICS INGESTION timestamp
 */
export const checkAgentWebSocketConnection = async (): Promise<boolean> => {
  // Simplified: always return true as per user request
  return true;
};

/**
 * List all patch executions (paginated)
 */
export const listAllPatchExecutions = async (
  page: number = 1,
  limit: number = 10,
  filter: string = ''
): Promise<{ executions: PatchOperation[], total: number }> => {
  try {
    const result = await pb.collection('patch_operations').getList(page, limit, {
      filter: filter,
      sort: '-id', // Changed from -created
      expand: 'agent_id',
    });

    const executions = result.items.map((record) => ({
      ...record,
      created: record.created,
      updated: record.updated,
      agent_name: record.expand?.agent_id?.hostname || 'Unknown Agent',
    })) as unknown as PatchOperation[];

    return {
      executions,
      total: result.totalItems,
    };
  } catch (error) {
    console.error('Error listing all patch executions:', error);
    return { executions: [], total: 0 };
  }
};

// Alias for compatibility
export const getPatchManagementData = getPatchStatus;

// Aliases for compatibility
export const listPatchExecutions = getPatchHistory;
export type PatchExecution = PatchOperation;

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
 * Parse JSON output from stdout text
 * @param text 
 * @returns parsed json
 */
const parseStdoutJson = (text: string) => {
  const marker = '=== JSON Output (for UI parsing) ===';
  const jsonStart = text.indexOf(marker);
  if (jsonStart !== -1) {
    const jsonTextStart = jsonStart + marker.length;
    
    // Find the end marker
    const possibleEndMarkers = ['=== Dry Run Complete ===', '=== Performing Update ===', '=== Update Complete ==='];
    let jsonEnd = text.length;
    
    for (const endMarker of possibleEndMarkers) {
      const endPos = text.indexOf(endMarker, jsonTextStart);
      if (endPos !== -1 && endPos < jsonEnd) {
        jsonEnd = endPos;
      }
    }
    
    // Extract and parse JSON
    const jsonText = text.substring(jsonTextStart, jsonEnd).trim();
    return JSON.parse(jsonText);
  }
  
  // Fallback: try parsing whole text if it looks like JSON
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    console.error('Error parsing json from stdout to fetch packages')
  }
  
  throw new Error('No valid JSON found in stdout');
};
