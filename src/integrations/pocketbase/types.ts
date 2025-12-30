// PocketBase collection types
export interface UserRecord {
  id: string;
  username: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  created: string;
  updated: string;
  name?: string;
  avatar?: string;
}

export interface AgentRecord {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'offline';
  owner: string;
  fingerprint?: string;
  created: string;
  updated: string;
  ip_address?: string;
  version?: string;
  os_version?: string;
  kernel_version?: string;
  location?: string;
  registered_ip?: string;
  public_key?: string;
  websocket_connected?: boolean;
  websocket_connected_at?: string;
  websocket_disconnected_at?: string;
}

export interface AgentMetricRecord {
  id: string;
  agent_id: string;
  recorded_at: string;
  cpu_percent?: number;
  memory_mb?: number;
  disk_percent?: number;
  network_in_kbps?: number;
  network_out_kbps?: number;
  extra?: Record<string, unknown>;
  ip_address?: string;
  location?: string;
  agent_version?: string;
  os_info?: Record<string, unknown>;
  kernel_version?: string;
  filesystem_info?: Record<string, unknown>[];
  block_devices?: Record<string, unknown>[];
  device_fingerprint?: string;
  load_averages?: Record<string, number>;
  load1?: number;
  load5?: number;
  load15?: number;
  network_stats?: Record<string, number>;
}

export interface AuthResponse {
  record?: UserRecord;
  token?: string;
  error?: string;
}

export interface ProxmoxClusterRecord {
  id: string;
  cluster_name: string;
  nodes: number;
  quorate: number;
  version: number;
  px_cluster_id: string;
  created: string;
  updated: string;
}

export interface ProxmoxNodeRecord {
  id: string;
  agent_id: string;
  cluster_id?: string;
  ip: string;
  level: string;
  local: number;
  name: string;
  px_node_id: number;
  online: number;
  pve_version: string;
  created: string;
  updated: string;
}

export interface ProxmoxLxcRecord {
  id: string;
  agent_id: string;
  cluster_id?: string;
  node_id: string;
  name: string;
  lxc_id: string;
  status: string;
  ostype: string;
  uptime: number;
  vmid: number;
  node: string;
  created: string;
  updated: string;
}

export interface ProxmoxQemuRecord {
  id: string;
  agent_id: string;
  cluster_id?: string;
  node_id: string;
  name: string;
  qemu_id: string;
  status: string;
  ostype: string;
  uptime: number;
  vmid: number;
  vmgenid?: string;
  kvm?: number;
  boot?: string;
  host_cpu?: string;
  node: string;
  created: string;
  updated: string;
}

export interface PatchOperationRecord {
  id: string;
  user_id: string;
  agent_id: string;
  mode: 'dry-run' | 'apply';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  script_url: string;
  output_path: string;
  error_msg: string;
  started_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
  created: string;
  updated: string;
}

export interface PatchScheduleRecord {
  id: string;
  agent_id: string;
  lxc_id?: string;
  cron_expression: string;
  next_run?: string;
  is_active: boolean;
  execution_type?: 'dry_run' | 'apply';
  created: string;
  updated: string;
}

export interface PackageExceptionRecord {
  id: string;
  agent_id: string;
  package_name: string;
  reason?: string;
  is_active: boolean;
  created: string;
  updated: string;
}
