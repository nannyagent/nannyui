import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Proxmox from './Proxmox';
import * as proxmoxService from '@/services/proxmoxService';

// Mock services
vi.mock('@/services/proxmoxService');
vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => (props: any) => <Component {...props} />
}));

// Mock components
vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

describe('Proxmox Page', () => {
  const mockClusters = [
    { id: 'c1', cluster_name: 'Cluster 1', nodes: 3, quorate: true, version: '7.4', px_cluster_id: 'cluster-id-1' }
  ];
  const mockNodes = [
    { id: 'n1', name: 'pve1', online: true, ip: '10.0.0.1', pve_version: '7.4', level: 'user', agent_id: 'agent-1' }
  ];
  const mockLxcs = {
    items: [{ id: 'l1', name: 'lxc100', vmid: 100, status: 'running', node: 'pve1', uptime: 3600, ostype: 'debian', agent_id: 'agent-1' }],
    total: 1,
    totalPages: 1
  };
  const mockQemus = {
    items: [{ id: 'q1', name: 'vm100', vmid: 100, status: 'running', node: 'pve1', uptime: 3600, ostype: 'linux', agent_id: 'agent-1' }],
    total: 1,
    totalPages: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (proxmoxService.getAllProxmoxClusters as any).mockResolvedValue(mockClusters);
    (proxmoxService.getAllProxmoxNodes as any).mockResolvedValue(mockNodes);
    (proxmoxService.getAllProxmoxLxcsPaginated as any).mockResolvedValue(mockLxcs);
    (proxmoxService.getAllProxmoxQemusPaginated as any).mockResolvedValue(mockQemus);
  });

  it('should render clusters by default', async () => {
    render(
      <MemoryRouter>
        <Proxmox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cluster 1')).toBeInTheDocument();
    });
  });

  it('should show empty state when no clusters', async () => {
    (proxmoxService.getAllProxmoxClusters as any).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <Proxmox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Proxmox Clusters Found')).toBeInTheDocument();
    });
  });
});
