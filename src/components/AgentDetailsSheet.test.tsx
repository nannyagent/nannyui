
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentDetailsSheet from './AgentDetailsSheet';

describe('AgentDetailsSheet component', () => {
  const mockAgent = {
    id: 'agent-123',
    fingerprint: 'agent-123-fingerprint',
    name: 'test-server',
    status: 'active' as const,
    version: 'v1.5.0',
    location: 'US East',
    created_at: '2024-01-01T00:00:00Z',
    ip_address: '10.0.0.1',
    kernel_version: '5.4.0-42-generic',
    os_version: 'Ubuntu 20.04 LTS',
    owner: 'user-123456',
    last_seen: '2024-01-01T00:30:00Z',
    lastMetric: {
      agent_id: 'agent-123',
      recorded_at: '2024-01-01T00:00:00Z',
      cpu_percent: 45.5,
      memory_mb: 2048,
      disk_percent: 65.0,
      os_info: {
        platform: 'Ubuntu 20.04 LTS',
        kernel_version: '5.4.0-42-generic'
      }
    }
  };

  const mockOnOpenChange = vi.fn();

  it('should render correctly when open', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify agent name appears (may appear multiple times in sheet)
    const nameElements = screen.getAllByText(mockAgent.name);
    expect(nameElements.length).toBeGreaterThan(0);
    
    // Verify status badge (appears multiple times)
    const statusElements = screen.getAllByText(mockAgent.status);
    expect(statusElements.length).toBeGreaterThan(0);
    
    // Verify fingerprint is displayed (truncated in badge)
    expect(screen.getByText(/ID: agent-123/i)).toBeInTheDocument();
    
    // Verify system information section exists
    expect(screen.getByText('System Information')).toBeInTheDocument();
  });

  it('should display "Unknown" for missing system information', () => {
    const agentWithMissingInfo = {
      ...mockAgent,
      lastMetric: undefined
    };

    render(
      <AgentDetailsSheet 
        agent={agentWithMissingInfo} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify "Unknown" is shown for missing metrics
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
      status: 'offline' as const
    };

    render(
      <AgentDetailsSheet 
        agent={offlineAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify offline status is displayed (appears multiple times in badges)
    const offlineElements = screen.getAllByText('offline');
    expect(offlineElements.length).toBeGreaterThan(0);
  });

  it('should display the timeline information correctly', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify that last updated timestamp is shown
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    
    // Verify System Information section exists (which shows OS info)
    expect(screen.getByText('System Information')).toBeInTheDocument();
  });

  it('should render the Performance Details section', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify Performance Details section is present
    expect(screen.getByText('Performance Details')).toBeInTheDocument();
    
    // Verify metrics are displayed
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    
    // Disk Usage appears multiple times (in overview and details)
    const diskUsageElements = screen.getAllByText('Disk Usage');
    expect(diskUsageElements.length).toBeGreaterThan(0);
  });
});
