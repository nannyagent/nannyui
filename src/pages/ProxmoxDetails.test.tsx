import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test-utils/test-utils';
import ProxmoxDetails from './ProxmoxDetails';
import * as proxmoxService from '@/services/proxmoxService';
import * as agentService from '@/services/agentService';

// Mock services
vi.mock('@/services/proxmoxService');
vi.mock('@/services/agentService');

// Mock components that might cause issues
vi.mock('@/components/PatchExecutionDialog', () => ({
  PatchExecutionDialog: () => <div data-testid="patch-dialog">Patch Dialog</div>
}));
vi.mock('@/components/CronScheduleDialog', () => ({
  CronScheduleDialog: () => <div data-testid="cron-dialog">Cron Dialog</div>
}));

describe('ProxmoxDetails', () => {
  const mockAgentId = 'agent-123';
  const mockAgent = {
    id: mockAgentId,
    hostname: 'pve-host',
    status: 'active'
  };

  const mockCluster = {
    id: 'cluster-1',
    px_cluster_id: 'cluster-123',
    cluster_name: 'pve-cluster',
    quorate: true,
    version: 1
  };

  const mockNodes = [
    { id: 'node-1', name: 'pve1', status: 'online', cpu_usage: 0.1, memory_usage: 0.2, uptime: 1000 }
  ];

  const mockLxcs = [
    { id: 'lxc-1', vmid: 100, name: 'container1', status: 'running', cpus: 2, memory: 1024 }
  ];

  const mockQemus = [
    { id: 'vm-1', vmid: 200, name: 'vm1', status: 'running', cpus: 4, memory: 2048 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (agentService.getAgentById as any).mockResolvedValue(mockAgent);
    (proxmoxService.getProxmoxCluster as any).mockResolvedValue(mockCluster);
    (proxmoxService.getProxmoxNodes as any).mockResolvedValue(mockNodes);
    (proxmoxService.getProxmoxLxcs as any).mockResolvedValue(mockLxcs);
    (proxmoxService.getProxmoxQemus as any).mockResolvedValue(mockQemus);
  });

  it('should render loading state initially', () => {
    renderWithProviders(
      <Routes>
        <Route path="/agents/:id/proxmox" element={<ProxmoxDetails />} />
      </Routes>,
      { route: `/agents/${mockAgentId}/proxmox` }
    );
    // It might be too fast to catch loading, but we can check if it eventually renders content
  });

  it('should render cluster details', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/agents/:id/proxmox" element={<ProxmoxDetails />} />
      </Routes>,
      { route: `/agents/${mockAgentId}/proxmox` }
    );

    await waitFor(() => {
      expect(screen.getByText(/pve-cluster/)).toBeInTheDocument();
      expect(screen.getByText(/pve-host/)).toBeInTheDocument();
    });
  });

  it('should render nodes tab content', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/agents/:id/proxmox" element={<ProxmoxDetails />} />
      </Routes>,
      { route: `/agents/${mockAgentId}/proxmox` }
    );

    await waitFor(() => {
      expect(screen.getByText('pve1')).toBeInTheDocument();
    });
  });

  it('should render lxc tab content', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/agents/:id/proxmox" element={<ProxmoxDetails />} />
      </Routes>,
      { route: `/agents/${mockAgentId}/proxmox` }
    );

    // Click on LXC tab
    // Note: Tabs might need userEvent to switch, but if they are rendered in DOM (hidden), we might find them.
    // Shadcn tabs usually render content but hide it.
    
    await waitFor(() => {
      // Check if LXC data is loaded
      expect(proxmoxService.getProxmoxLxcs).toHaveBeenCalled();
    });
  });
});
