import { Activity } from '@/services/activityService'

// Mock Agent data
export const mockAgent = {
  id: "1",
  user_id: "user-123",
  hostname: "test-agent-001",
  os_type: "linux",
  os_info: "Ubuntu 22.04",
  os_version: "22.04",
  version: "1.0.0",
  primary_ip: "192.168.1.100",
  kernel_version: "5.15.0",
  arch: "x86_64",
  all_ips: ["192.168.1.100"],
  platform_family: "debian",
  status: "active" as const,
  last_seen: "2024-01-15T10:30:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  metadata: {},
  websocket_connected: true
};

// Mock Investigation data
export const mockInvestigation = {
  id: 'investigation-1',
  title: 'Test Investigation',
  description: 'A test investigation for unit tests',
  status: 'active' as const,
  priority: 'high' as const,
  agent_id: 'agent-1',
  created_at: '2023-12-12T09:00:00Z',
  updated_at: '2023-12-12T10:00:00Z',
  findings: [
    {
      id: 'finding-1',
      description: 'Suspicious file access',
      severity: 'medium' as const,
      timestamp: '2023-12-12T09:30:00Z'
    }
  ]
}

// Mock Patch data
export const mockPatch = {
  id: 'patch-1',
  title: 'Security Update KB123456',
  description: 'Critical security patch',
  severity: 'critical' as const,
  status: 'pending' as const,
  package_name: 'test-package',
  current_version: '1.0.0',
  target_version: '1.0.1',
  agent_id: 'agent-1',
  created_at: '2023-12-12T08:00:00Z',
  updated_at: '2023-12-12T10:00:00Z'
}

// Mock Activity data
export const mockActivity: Activity = {
  id: 'activity-1',
  user_id: 'user-1',
  agent_id: 'agent-1',
  activity_type: 'agent_registration',
  summary: 'Agent registered successfully',
  metadata: {
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'NannyAgent/1.0.0',
    device_type: 'server',
    duration_ms: 150
  },
  created_at: '2023-12-12T10:00:00Z',
  title: 'Agent Registration',
  description: 'Agent registered successfully',
  icon: 'CheckCircle'
}

// Mock Dashboard stats
export const mockDashboardStats = {
  total_agents: 5,
  online_agents: 3,
  offline_agents: 2,
  pending_patches: 12,
  critical_vulnerabilities: 3,
  active_investigations: 2,
  resolved_investigations: 8
}

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-12-12T10:00:00Z'
}

// Mock pricing tiers
export const mockPricingTiers = [
  {
    id: 'tier-free',
    name: 'Free',
    price: 0,
    billing_interval: 'month' as const,
    features: ['Up to 5 agents', 'Basic monitoring'],
    is_popular: false
  },
  {
    id: 'tier-pro',
    name: 'Professional',
    price: 29,
    billing_interval: 'month' as const,
    features: ['Up to 50 agents', 'Advanced monitoring', 'Priority support'],
    is_popular: true
  }
]

// Mock API responses
export const mockApiResponses = {
  agents: [mockAgent],
  investigations: [mockInvestigation],
  patches: [mockPatch],
  activities: [mockActivity],
  stats: mockDashboardStats,
  pricingTiers: mockPricingTiers
}

// Mock error responses
export const mockErrorResponse = {
  error: {
    message: 'Something went wrong',
    code: 500,
    details: 'Test error for unit tests'
  }
}

// Mock form data
export const mockFormData = {
  agent: {
    name: 'New Agent',
    hostname: 'new-host',
    description: 'A new test agent'
  },
  investigation: {
    title: 'New Investigation',
    description: 'A new test investigation',
    priority: 'medium' as const
  },
  patch: {
    package_name: 'new-package',
    target_version: '2.0.0',
    description: 'Test patch update'
  }
}