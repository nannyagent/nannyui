import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LxcDetail from './LxcDetail';
import * as proxmoxService from '@/services/proxmoxService';
import { pb } from '@/lib/pocketbase';

// Mock services
vi.mock('@/services/proxmoxService');
vi.mock('@/lib/pocketbase');
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

describe('LxcDetail Page', () => {
  const mockLxc = {
    id: 'lxc-1',
    agent_id: 'agent-1',
    name: 'lxc100',
    vmid: 100,
    status: 'running',
    ostype: 'debian',
    uptime: 3600,
    node: 'pve1',
    lxc_id: '100',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };

  const mockHistory = [
    { id: 'op-1', status: 'completed', mode: 'dry-run', created: new Date().toISOString() }
  ];

  const mockSchedule = {
    id: 'sch-1',
    cron_expression: '0 0 * * *',
    is_active: true,
    next_run: new Date().toISOString(),
    execution_type: 'dry_run'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pb.collection as any).mockReturnValue({
      getOne: vi.fn().mockResolvedValue(mockLxc)
    });
    (proxmoxService.getLxcPatchHistory as any).mockResolvedValue(mockHistory);
    (proxmoxService.getLxcPatchSchedule as any).mockResolvedValue(mockSchedule);
    (proxmoxService.hasExistingSchedule as any).mockResolvedValue(true);
  });

  it('should render LXC details', async () => {
    render(
      <MemoryRouter initialEntries={['/proxmox/lxc/lxc-1']}>
        <Routes>
          <Route path="/proxmox/lxc/:lxcId" element={<LxcDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('lxc100')).toBeInTheDocument();
      expect(screen.getByText('VMID: 100 • Node: pve1 • OS: debian')).toBeInTheDocument();
    });
  });

  it('should render patch history', async () => {
    render(
      <MemoryRouter initialEntries={['/proxmox/lxc/lxc-1']}>
        <Routes>
          <Route path="/proxmox/lxc/:lxcId" element={<LxcDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Patch History')).toBeInTheDocument();
      // Check for history item (Dry Run badge)
      expect(screen.getByText('Dry Run')).toBeInTheDocument();
    });
  });
});
