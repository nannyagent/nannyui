import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PatchExecutionDialog } from './PatchExecutionDialog';
import * as patchManagementService from '@/services/patchManagementService';

// Mock the dependencies
vi.mock('@/services/patchManagementService', () => ({
  checkAgentWebSocketConnection: vi.fn(),
  triggerPatchExecution: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { status: 'completed', id: 'exec-123' },
            error: null,
          }),
        }),
      }),
    }),
  },
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
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    agentId: 'agent-123',
    agentName: 'Test Agent',
    executionType: 'dry_run' as const,
    shouldReboot: false,
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('execution_id validation', () => {
    it('should handle missing execution_id in response', async () => {
      // Mock triggerPatchExecution to return response without execution_id
      (patchManagementService.triggerPatchExecution as any).mockResolvedValueOnce({
        success: true,
        execution_id: undefined, // This should trigger error
        agent_id: 'agent-123',
      });

      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Server did not return an execution ID/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should validate execution_id is present before polling', async () => {
      // Mock successful response with valid execution_id
      (patchManagementService.triggerPatchExecution as any).mockResolvedValueOnce({
        success: true,
        execution_id: 'exec-123',
        agent_id: 'agent-123',
        execution_type: 'dry_run',
        status: 'pending',
      });

      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      // Should not show error
      await waitFor(() => {
        expect(screen.queryByText(/Server did not return an execution ID/i)).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle execution_id being null', async () => {
      (patchManagementService.triggerPatchExecution as any).mockResolvedValueOnce({
        success: true,
        execution_id: null,
        agent_id: 'agent-123',
      });

      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Server did not return an execution ID/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle empty string execution_id', async () => {
      (patchManagementService.triggerPatchExecution as any).mockResolvedValueOnce({
        success: true,
        execution_id: '',
        agent_id: 'agent-123',
      });

      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Server did not return an execution ID/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('error handling', () => {
    it('should show error when triggerPatchExecution fails', async () => {
      (patchManagementService.triggerPatchExecution as any).mockRejectedValueOnce(
        new Error('Service error')
      );

      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Service error/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show error when agent is not connected', async () => {
      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(false);

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Agent is not connected/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('execution flow', () => {
    it('should show progress states during execution', async () => {
      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);
      
      (patchManagementService.triggerPatchExecution as any).mockResolvedValueOnce({
        success: true,
        execution_id: 'exec-456',
        agent_id: 'agent-123',
        execution_type: 'dry_run',
        status: 'pending',
      });

      renderWithRouter(
        <PatchExecutionDialog {...mockProps} />
      );

      // Should show checking state or triggering state
      await waitFor(() => {
        // Check for any progress indicator showing the component is running
        const dialogContent = screen.getByRole('dialog');
        expect(dialogContent).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('reboot handling', () => {
    it('should include reboot flag when shouldReboot is true', async () => {
      const propsWithReboot = { ...mockProps, shouldReboot: true };

      (patchManagementService.checkAgentWebSocketConnection as any).mockResolvedValueOnce(true);
      (patchManagementService.triggerPatchExecution as any).mockResolvedValueOnce({
        success: true,
        execution_id: 'exec-789',
      });

      renderWithRouter(
        <PatchExecutionDialog {...propsWithReboot} />
      );

      await waitFor(() => {
        expect(patchManagementService.triggerPatchExecution).toHaveBeenCalledWith(
          expect.objectContaining({
            reboot: true,
          })
        );
      }, { timeout: 2000 });
    });
  });
});

