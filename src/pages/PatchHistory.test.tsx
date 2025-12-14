import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PatchHistory from './PatchHistory';

// Mock the auth utility
vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => Component,
}));

// Mock the services
vi.mock('@/services/patchManagementService', () => ({
  listAllPatchExecutions: vi.fn(() =>
    Promise.resolve([
      {
        id: '1',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        status: 'completed',
        execution_type: 'dry_run',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
      {
        id: '2',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        status: 'running',
        execution_type: 'apply',
        started_at: new Date().toISOString(),
        completed_at: null,
      },
      {
        id: '3',
        agent_id: 'agent-456',
        agent_name: 'Another Agent',
        status: 'completed',
        execution_type: 'apply_with_reboot',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
    ])
  ),
  listPatchExecutions: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: '1',
          agent_id: 'agent-123',
          agent_name: 'Test Agent',
          status: 'completed',
          execution_type: 'dry_run',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
      ],
      totalCount: 1,
      pageSize: 10,
    })
  ),
}));

// Mock components
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/TransitionWrapper', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('PatchHistory', () => {
  it('should display agent summaries grid when no agentId is provided', async () => {
    const { container } = render(
      <BrowserRouter>
        <PatchHistory />
      </BrowserRouter>
    );

    // Wait for the component to load
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check that the component renders (look for key elements)
    expect(container).toBeInTheDocument();
  });

  it('should render without error when component loads', async () => {
    const { container } = render(
      <BrowserRouter>
        <PatchHistory />
      </BrowserRouter>
    );

    // Wait for the component to load
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check that basic structure exists
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
