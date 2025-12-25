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
  extra?: Record<string, any>;
  ip_address?: string;
  location?: string;
  agent_version?: string;
  os_info?: Record<string, any>;
  kernel_version?: string;
  filesystem_info?: Record<string, any>[];
  block_devices?: Record<string, any>[];
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
