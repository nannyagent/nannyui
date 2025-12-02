import { supabase } from '@/lib/supabase';

const getSupabaseUrl = (): string => {
  return 'https://gpqzsricripnvbrpsyws.supabase.co';
};

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
  architecture: string;
  package_manager: string;
  os_distribution: string;
  os_version: string;
  kernel_version: string;
  analysis_timestamp: string;
  packages: Package[];
  kernel_upgrade: KernelUpgrade;
  os_upgrade: OsUpgrade;
  summary: Summary;
  recommendations: string[];
}

export interface PatchExecution {
  id: string;
  agent_id: string;
  script_id: string;
  execution_type: 'dry_run' | 'apply' | 'apply_with_reboot';
  status: 'pending' | 'running' | 'completed' | 'failed';
  command: string;
  exit_code: number | null;
  error_message: string | null;
  stdout_storage_path: string | null;
  stderr_storage_path: string | null;
  started_at: string | null;
  completed_at: string | null;
  triggered_by: string;
  should_reboot: boolean;
  rebooted_at: string | null;
}

export interface PatchExecutionResponse {
  execution_id: string;
  agent_id: string;
  status: string;
  execution_type: string;
  exit_code: number | null;
  output: any;
  stdout: string | null;
  stderr: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  should_reboot: boolean;
  rebooted_at: string | null;
  stdout_storage_path?: string | null;
  stderr_storage_path?: string | null;
}

export interface PackageException {
  id: string;
  agent_id: string;
  package_name: string;
  reason: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface TriggerPatchRequest {
  agent_id: string;
  execution_type: 'dry_run' | 'apply';
  reboot?: boolean;
}

export interface TriggerPatchResponse {
  success: boolean;
  execution_id: string;
  agent_id: string;
  execution_type: string;
  status: string;
  message: string;
}

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  };
};

export const getPatchManagementData = async (agentId: string): Promise<PatchManagementData> => {
  const supabaseUrl = getSupabaseUrl();
  const apiUrl = `${supabaseUrl.replace('supabase.co', 'supabase.co')}/functions/v1/diagnostic/packages/${agentId}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patch management data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Silently fail - diagnostic endpoint may not exist yet
    // This is expected for new installations
    throw error;
  }
};

export const triggerPatchExecution = async (
  request: TriggerPatchRequest
): Promise<TriggerPatchResponse> => {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patch-management`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to trigger patch execution');
  }

  return await response.json();
};

export const getPatchExecutionStatus = async (
  executionId: string
): Promise<PatchExecutionResponse> => {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patch-management/${executionId}`,
    {
      method: 'GET',
      headers
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to get execution status');
  }

  return await response.json();
};

export const listPatchExecutions = async (
  agentId: string,
  limit: number = 10
): Promise<PatchExecution[]> => {
  const { data, error } = await supabase
    .from('patch_executions')
    .select('*')
    .eq('agent_id', agentId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getPackageExceptions = async (
  agentId: string
): Promise<PackageException[]> => {
  const { data, error } = await supabase
    .from('package_exceptions')
    .select('*')
    .eq('agent_id', agentId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const addPackageException = async (
  agentId: string,
  packageName: string,
  reason?: string,
  expiresAt?: string
): Promise<PackageException> => {
  const { data, error } = await supabase
    .from('package_exceptions')
    .insert({
      agent_id: agentId,
      package_name: packageName,
      reason: reason || null,
      expires_at: expiresAt || null,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const removePackageException = async (exceptionId: string): Promise<void> => {
  const { error } = await supabase
    .from('package_exceptions')
    .update({ is_active: false })
    .eq('id', exceptionId);

  if (error) {
    throw new Error(error.message);
  }
};

export const checkAgentWebSocketConnection = async (agentId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('agents')
    .select('websocket_connected, websocket_connected_at')
    .eq('id', agentId)
    .single();

  if (error || !data) {
    return false;
  }

  if (!data.websocket_connected) {
    return false;
  }

  if (data.websocket_connected_at) {
    const connectedAt = new Date(data.websocket_connected_at);
    const now = new Date();
    const diffSeconds = (now.getTime() - connectedAt.getTime()) / 1000;
    
    if (diffSeconds > 60) {
      return false;
    }
  }

  return true;
};

export const listAllPatchExecutions = async (
  limit: number = 50
): Promise<(PatchExecution & { agent_name?: string })[]> => {
  const { data: executionsData, error: execError } = await supabase
    .from('patch_executions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (execError) {
    throw new Error(execError.message);
  }

  if (!executionsData || executionsData.length === 0) {
    return [];
  }

  const agentIds = [...new Set(executionsData.map(e => e.agent_id))];
  const { data: agentsData } = await supabase
    .from('agents')
    .select('id, name')
    .in('id', agentIds);

  const agentMap = new Map(agentsData?.map(a => [a.id, a.name]) || []);

  return executionsData.map(exec => ({
    ...exec,
    agent_name: agentMap.get(exec.agent_id) || `Agent ${exec.agent_id.substring(0, 8)}`
  }));
};
