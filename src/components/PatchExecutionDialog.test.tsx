import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatchExecutionDialog } from './PatchExecutionDialog';
import * as patchManagementService from '@/services/patchManagementService';

// Mock the dependencies
vi.mock('@/services/patchManagementService', () => ({
  runPatchCheck: vi.fn(),
  applyPatches: vi.fn(),
  waitForPatchOperation: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PatchExecutionDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    agentId: 'agent-123',
    agentName: 'Test Agent',
    executionType: 'dry_run' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    renderWithRouter(<PatchExecutionDialog {...defaultProps} />);
    expect(screen.getByText('Dry Run Preview')).toBeInTheDocument();
    expect(screen.getByText('Preview available updates for Test Agent')).toBeInTheDocument();
  });

  it('starts execution on mount', async () => {
    (patchManagementService.runPatchCheck as any).mockResolvedValue('exec-123');
    (patchManagementService.waitForPatchOperation as any).mockImplementation((id: string, cb: any) => {
      // Simulate running
      cb('running');
      return Promise.resolve({ status: 'completed', id });
    });

    renderWithRouter(<PatchExecutionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(patchManagementService.runPatchCheck).toHaveBeenCalledWith('agent-123');
    });
  });

  it('handles execution failure', async () => {
    (patchManagementService.runPatchCheck as any).mockRejectedValue(new Error('Failed to start'));

    renderWithRouter(<PatchExecutionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Execution Failed')).toBeInTheDocument();
      expect(screen.getByText('Failed to start')).toBeInTheDocument();
    });
  });

  it('handles completion', async () => {
    (patchManagementService.runPatchCheck as any).mockResolvedValue('exec-123');
    (patchManagementService.waitForPatchOperation as any).mockResolvedValue({ 
      status: 'completed', 
      id: 'exec-123',
      metadata: { should_reboot: false }
    });

    renderWithRouter(<PatchExecutionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Dry Run Complete')).toBeInTheDocument();
    });
  });
});
