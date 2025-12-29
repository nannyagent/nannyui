import { pb } from '@/lib/pocketbase';

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
  last_checked: string;
}

export interface PatchOperation {
  id: string;
  agent_id: string;
  mode: 'dry-run' | 'apply' | 'rollback';
  status: 'pending' | 'running' | 'completed' | 'failed';
  script_url: string;
  stdout_file: string;
  stderr_file: string;
  exit_code: number;
  metadata: Record<string, any>;
  started_at: string;
  completed_at: string;
  created: string;
  updated: string;
}

/**
 * Get the latest patch status for an agent
 */
export const getPatchStatus = async (agentId: string): Promise<PatchManagementData | null> => {
  try {
    // Get the latest completed 'check' operation
    const result = await pb.collection('patch_operations').getList(1, 1, {
      filter: `agent_id = "${agentId}" && mode = "dry-run" && status = "completed"`,
      sort: '-id', // Changed from -created
    });

    if (result.items.length === 0) {
      return null;
    }

    const operation = result.items[0];
    
    // Fetch the stdout file content
    if (operation.stdout_file) {
      const url = pb.files.getUrl(operation, operation.stdout_file);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
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
export const getPatchOperationDetails = async (id: string): Promise<PatchOperation & { parsedOutput?: any }> => {
  try {
    const operation = await pb.collection('patch_operations').getOne(id);
    
    let parsedOutput = null;
    if (operation.stdout_file) {
      const url = pb.files.getUrl(operation, operation.stdout_file);
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
                parsedOutput = JSON.parse(text);
            } catch (e) {
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
    } as unknown as PatchOperation & { parsedOutput?: any };
  } catch (error) {
    console.error('Error fetching patch operation details:', error);
    throw error;
  }
};


/**
 * Run a patch check
 */
export const runPatchCheck = async (agentId: string): Promise<string> => {
  try {
    const user = pb.authStore.record;
    
    // Fetch agent to get platform_family
    const agent = await pb.collection('agents').getOne(agentId);
    const platformFamily = agent.platform_family;

    if (!platformFamily) {
      throw new Error('Agent platform_family not found');
    }

    // Fetch script for this platform_family
    const scripts = await pb.collection('scripts').getList(1, 1, {
      filter: `platform_family = "${platformFamily}"`,
    });

    if (scripts.items.length === 0) {
      throw new Error(`No script found for platform_family: ${platformFamily}`);
    }
    const scriptId = scripts.items[0].id;

    const record = await pb.collection('patch_operations').create({
      agent_id: agentId,
      user_id: user?.id,
      script_id: scriptId,
      mode: 'dry-run',
      status: 'pending',
    });
    return record.id;
  } catch (error) {
    console.error('Error running patch check:', error);
    throw error;
  }
};

/**
 * Apply patches
 */
export const applyPatches = async (agentId: string, packageNames: string[]): Promise<string> => {
  try {
    const user = pb.authStore.record;

    // Fetch agent to get platform_family
    const agent = await pb.collection('agents').getOne(agentId);
    const platformFamily = agent.platform_family;

    if (!platformFamily) {
      throw new Error('Agent platform_family not found');
    }

    // Fetch script for this platform_family
    const scripts = await pb.collection('scripts').getList(1, 1, {
      filter: `platform_family = "${platformFamily}"`,
    });

    if (scripts.items.length === 0) {
      throw new Error(`No script found for platform_family: ${platformFamily}`);
    }
    const scriptId = scripts.items[0].id;

    const record = await pb.collection('patch_operations').create({
      agent_id: agentId,
      user_id: user?.id,
      script_id: scriptId,
      mode: 'apply',
      status: 'pending',
      metadata: {
        packages: packageNames,
      },
    });
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
    const result = await pb.collection('patch_operations').getList(1, limit, {
      filter: `agent_id = "${agentId}"`,
      sort: '-id', // Changed from -created
    });
    
    return result.items.map((record: any) => ({
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

export interface PatchSchedule {
  id: string;
  agent_id: string;
  cron_expr: string;
  next_run: string;
  last_run: string;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface PackageException {
  id: string;
  agent_id: string;
  package_name: string;
  reason: string;
  expires_at: string;
  user_id: string;
  created: string;
  updated: string;
}

/**
 * Get scheduled patches
 */
export const getScheduledPatches = async (agentId: string): Promise<PatchSchedule[]> => {
  try {
    const result = await pb.collection('patch_schedules').getList(1, 50, {
      filter: `agent_id = "${agentId}"`,
    });
    return result.items.map((record: any) => ({
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
    return result.items.map((record: any) => ({
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
  expiresAt?: string
): Promise<PackageException | null> => {
  try {
    const user = pb.authStore.record;
    if (!user) throw new Error('User not authenticated');

    const record = await pb.collection('package_exceptions').create({
      agent_id: agentId,
      package_name: packageName,
      reason: reason,
      user_id: user.id,
      expires_at: expiresAt,
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
  enabled: boolean = true
): Promise<boolean> => {
  try {
    // Check if schedule exists
    const existing = await pb.collection('patch_schedules').getList(1, 1, {
      filter: `agent_id = "${agentId}"`,
    });

    if (existing.items.length > 0) {
      await pb.collection('patch_schedules').update(existing.items[0].id, {
        cron_expression: cronExpression,
        enabled: enabled,
      });
    } else {
      await pb.collection('patch_schedules').create({
        agent_id: agentId,
        cron_expression: cronExpression,
        enabled: enabled,
      });
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
 */
export const checkAgentWebSocketConnection = async (agentId: string): Promise<boolean> => {
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

    const executions = result.items.map((record: any) => ({
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
