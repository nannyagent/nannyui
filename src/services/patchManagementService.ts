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

export const getPatchManagementData = async (agentId: string): Promise<PatchManagementData> => {
  const supabaseUrl = getSupabaseUrl();
  const apiUrl = `${supabaseUrl.replace('supabase.co', 'supabase.co')}/functions/v1/diagnostic/packages/${agentId}`;
  
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
};
