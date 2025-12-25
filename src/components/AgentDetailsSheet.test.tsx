
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentDetailsSheet from './AgentDetailsSheet';
import * as agentService from '@/services/agentService';

// Mock getAgentMetrics
vi.mock('@/services/agentService', async () => {
  const actual = await vi.importActual('@/services/agentService');
  return {
    ...actual,
    getAgentMetrics: vi.fn().mockResolvedValue([
      {
        id: 'metric-1',
        agent_id: 'agent-123',
        cpu_percent: 45.5,
        memory_used_gb: 2,
        memory_total_gb: 8,
        memory_percent: 25,
        disk_used_gb: 50,
        disk_total_gb: 100,
        disk_usage_percent: 50,
        network_in_gb: 1,
        network_out_gb: 1,
        created_at: '2024-01-01T00:00:00Z',
        filesystems: [],
        load_avg_1min: 0.5,
        load_avg_5min: 0.5,
        load_avg_15min: 0.5,
        cpu_cores: 4,
      }
    ]),
  };
});

describe('AgentDetailsSheet component', () => {
  const mockAgent = {
    id: 'agent-123',
    user_id: 'user-123',
    fingerprint: 'agent-123-fingerprint',
    hostname: 'test-server',
    status: 'active' as const,
    version: 'v1.5.0',
    location: 'US East',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    primary_ip: '10.0.0.1',
    all_ips: ['10.0.0.1'],
    kernel_version: '5.4.0-42-generic',
    os_version: 'Ubuntu 20.04 LTS',
    os_info: 'Ubuntu',
    os_type: 'linux',
    arch: 'x64',
    platform_family: 'debian',
    owner: 'user-123456',    
    metadata: {},
    last_seen: '2024-01-01T00:30:00Z',
    lastMetric: {
      id: 'metric-1',
      agent_id: 'agent-123',
      created_at: '2024-01-01T00:00:00Z',
      cpu_percent: 45.5,
      memory_used_gb: 2,
      memory_total_gb: 8,
      memory_percent: 25,
      disk_used_gb: 50,
      disk_total_gb: 100,
      disk_usage_percent: 50,
      network_in_gb: 1,
      network_out_gb: 1,
      filesystems: [],
      load_avg_1min: 0.5,
      load_avg_5min: 0.5,
      load_avg_15min: 0.5,
      cpu_cores: 4,
      last_seen: '2024-01-01T00:30:00Z',      
    }
  };

  const mockOnOpenChange = vi.fn();

  it('should render correctly when open', async () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Wait for metrics to load
    await waitFor(() => {
      expect(agentService.getAgentMetrics).toHaveBeenCalledWith(mockAgent.id);
    });

    // Verify agent hostname appears
    const nameElements = screen.getAllByText(mockAgent.hostname);
    expect(nameElements.length).toBeGreaterThan(0);
    
    // Verify status badge
    const statusElements = screen.getAllByText(mockAgent.status);
    expect(statusElements.length).toBeGreaterThan(0);
    
    // Verify ID is displayed
    expect(screen.getByText(`ID: ${mockAgent.id}`)).toBeInTheDocument();
    
    // Verify system information section exists
    expect(screen.getByText('System Information')).toBeInTheDocument();
  });

  it('should display "Unknown" for missing system information', async () => {
    // Mock empty metrics response
    (agentService.getAgentMetrics as any).mockResolvedValueOnce([]);

    const agentWithMissingInfo = {
      ...mockAgent,
      lastMetric: undefined,
      primary_ip: '',
      platform_family: '',
      arch: '',
      kernel_version: '',
      os_info: '',
      os_version: '',
      version: ''
    };

    render(
      <AgentDetailsSheet 
        agent={agentWithMissingInfo} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Wait for metrics to load (which will be empty)
    await waitFor(() => expect(agentService.getAgentMetrics).toHaveBeenCalled());

    // Verify "Unknown" is shown for missing info
    const unknownElements = screen.getAllByText('Unknown');
    expect(unknownElements.length).toBeGreaterThan(0);
    
    // Verify no metrics message is shown
    expect(screen.getByText('No metrics data available')).toBeInTheDocument();
  });

  it('should call onOpenChange when close button is clicked', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Verify onOpenChange was called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display offline status correctly', () => {
    const offlineAgent = {
      ...mockAgent,
      status: 'inactive' as const
    };

    render(
      <AgentDetailsSheet 
        agent={offlineAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify offline status is displayed (appears multiple times in badges)
    const offlineElements = screen.getAllByText('inactive');
    expect(offlineElements.length).toBeGreaterThan(0);
  });

  it('should display the timeline information correctly', async () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Wait for metrics to load and UI to update
    await screen.findByText(/Last updated:/i);
    
    // Verify System Information section exists (which shows OS info)
    expect(screen.getByText('System Information')).toBeInTheDocument();
  });

  it('should render the Performance Details section', async () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Wait for metrics to load and UI to update
    await screen.findByText('Detailed Metrics');
    
    // Verify metrics are displayed
    expect(screen.getByText('Load Average')).toBeInTheDocument();
  });
});
