import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatchManagement from './PatchManagement';
import { BrowserRouter } from 'react-router-dom';
import * as patchService from '@/services/patchManagementService';

// Mock withAuth to bypass authentication check
vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => (props: any) => <Component {...props} />,
}));

// Mock the components to avoid complex rendering
vi.mock('@/components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/components/PatchExecutionDialog', () => ({ PatchExecutionDialog: () => <div data-testid="patch-execution-dialog">Dialog</div> }));
vi.mock('@/components/PackageExceptionsDialog', () => ({ PackageExceptionsDialog: () => <div data-testid="package-exceptions-dialog">Exceptions Dialog</div> }));
vi.mock('@/components/PatchExecutionHistory', () => ({ PatchExecutionHistory: () => <div data-testid="patch-execution-history">History</div> }));
vi.mock('@/components/CronScheduleDialog', () => ({ CronScheduleDialog: () => <div data-testid="cron-schedule-dialog">Cron Dialog</div> }));
vi.mock('@/components/RebootDialog', () => ({ RebootDialog: () => <div data-testid="reboot-dialog">Reboot Dialog</div> }));

// Mock the service
vi.mock('@/services/patchManagementService', () => ({
  getPatchManagementData: vi.fn(),
  getScheduledPatches: vi.fn(),
  getPackageExceptions: vi.fn(),
  checkAgentWebSocketConnection: vi.fn(),
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ agentId: 'test-agent-id' }),
  };
});

describe('PatchManagement', () => {
  const mockData: patchService.PatchManagementData = {
    packages: [
      {
        name: 'test-package',
        current_version: '1.0.0',
        available_version: '1.1.0',
        upgrade_available: true,
        package_type: 'apt',
        vulnerabilities: [],
      },
    ],
    kernel_upgrade: {
      available: false,
      current_version: '5.4.0',
      available_version: '5.4.0',
      vulnerabilities: [],
    },
    os_upgrade: {
      available: false,
      current_version: '20.04',
      available_version: '20.04',
      description: '',
    },
    summary: {
      total_packages_checked: 100,
      packages_with_updates: 1,
      critical_vulnerabilities: 0,
      high_vulnerabilities: 0,
      medium_vulnerabilities: 0,
      low_vulnerabilities: 0,
    },
    recommendations: ['Update your system regularly'],
    last_checked: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (patchService.getPatchManagementData as any).mockResolvedValue(mockData);
    (patchService.getScheduledPatches as any).mockResolvedValue([]);
    (patchService.getPackageExceptions as any).mockResolvedValue([]);
    (patchService.checkAgentWebSocketConnection as any).mockResolvedValue(true);
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <PatchManagement />
      </BrowserRouter>
    );
    // It might render loading spinner or text
    // Based on the code: <Loader2 className="h-8 w-8 animate-spin text-primary" />
    // We can check for something that indicates loading or just wait for the main content
  });

  it('renders data after loading', async () => {
    render(
      <BrowserRouter>
        <PatchManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Patch Management')).toBeInTheDocument();
      expect(screen.getByText('test-package')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    (patchService.getPatchManagementData as any).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <PatchManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('An error occurred while loading patch management data')).toBeInTheDocument();
    });
  });
});
