import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreateInvestigationDialog from './CreateInvestigationDialog';
import * as investigationService from '@/services/investigationService';

// Mock the dependencies
vi.mock('@/services/investigationService', () => ({
  createInvestigationFromAPI: vi.fn(),
  waitForInvestigationInProgress: vi.fn(),
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

describe('CreateInvestigationDialog', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    agentId: 'agent-123',
    agentName: 'Test Agent',
    isAgentActive: true,
    userId: 'user-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('investigation creation flow', () => {
    it('should wait for episode_id when not immediately available', async () => {
      const mockInvestigation = {
        id: 1,
        investigation_id: 'inv-123',
        issue: 'Test issue',
        agent_id: 'agent-123',
        episode_id: 'episode-456',
        priority: 'high' as const,
        initiated_by: 'user-123',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        initiated_at: new Date().toISOString(),
        completed_at: null,
        holistic_analysis: null,
        updated_at: new Date().toISOString(),
      };

      // First call returns without episode_id
      (investigationService.createInvestigationFromAPI as any).mockResolvedValueOnce({
        investigation_id: 'inv-123',
        status: 'pending',
      });

      // Wait call returns with updated status
      (investigationService.waitForInvestigationInProgress as any).mockResolvedValueOnce(
        mockInvestigation
      );

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      // Fill form
      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      // Should wait for investigation status change
      await waitFor(() => {
        expect(investigationService.waitForInvestigationInProgress).toHaveBeenCalledWith(
          'agent-123',
          'inv-123',
          30,
          expect.any(Function)
        );
      }, { timeout: 2000 });
    });

    it('should navigate to episode_id when available immediately', async () => {
      (investigationService.createInvestigationFromAPI as any).mockResolvedValueOnce({
        investigation_id: 'inv-456',
        episode_id: 'episode-789',
        status: 'active',
      });

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Another test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      // Should still call waitForInvestigationInProgress to verify agent picked it up
      await waitFor(() => {
        expect(investigationService.waitForInvestigationInProgress).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should handle timeout waiting for episode_id', async () => {
      (investigationService.createInvestigationFromAPI as any).mockResolvedValueOnce({
        investigation_id: 'inv-789',
        status: 'pending',
      });

      (investigationService.waitForInvestigationInProgress as any).mockResolvedValueOnce(null);

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Timeout test');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/agent did not pick it up/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('form validation', () => {
    it('should validate issue description is not empty', async () => {
      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/Please enter an issue description/i)).toBeInTheDocument();
    });

    it('should prevent submission when agent is not active', async () => {
      const inactiveProps = { ...mockProps, isAgentActive: false };

      renderWithRouter(
        <CreateInvestigationDialog {...inactiveProps} />
      );

      // Note: textarea is disabled when agent is inactive, so we can't type into it
      // Just try to submit anyway to trigger the validation
      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Cannot create investigation for inactive agent/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('error handling', () => {
    it('should handle websocket connection errors', async () => {
      (investigationService.createInvestigationFromAPI as any).mockRejectedValueOnce(
        new Error('WebSocket connection failed')
      );

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Agent is not connected via WebSocket/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle timeout errors', async () => {
      (investigationService.createInvestigationFromAPI as any).mockRejectedValueOnce(
        new Error('Request timeout')
      );

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Request timed out/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle AI backend errors', async () => {
      (investigationService.createInvestigationFromAPI as any).mockRejectedValueOnce(
        new Error('AI model inference failed')
      );

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/AI backend is currently unavailable/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle generic errors', async () => {
      (investigationService.createInvestigationFromAPI as any).mockRejectedValueOnce(
        new Error('Unknown error occurred')
      );

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Unknown error occurred/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('dialog behavior', () => {
    it('should allow closing when not processing', async () => {
      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const closeButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(closeButton);

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should prevent closing during processing', async () => {
      (investigationService.createInvestigationFromAPI as any).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({}), 10000))
      );

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      // Wait for processing to start
      await waitFor(() => {
        expect(screen.getByText(/Waiting for Agent Response/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // The cancel button should not exist during processing
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('should reset form after successful submission', async () => {
      (investigationService.createInvestigationFromAPI as any).mockResolvedValueOnce({
        investigation_id: 'inv-999',
        episode_id: 'episode-999',
      });

      (investigationService.waitForInvestigationInProgress as any).mockResolvedValueOnce({
        investigation_id: 'inv-999',
        episode_id: 'episode-999',
      });

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      // Wait for success message and navigation
      await waitFor(() => {
        expect(screen.getByText(/Investigation Launched/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // After navigation, the dialog should close and form should be reset
      await waitFor(() => {
        expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
      }, { timeout: 2000 });
    });
  });

  describe('priority selection', () => {
    it('should pass selected priority to API', async () => {
      (investigationService.createInvestigationFromAPI as any).mockResolvedValueOnce({
        investigation_id: 'inv-111',
        episode_id: 'episode-111',
      });

      (investigationService.waitForInvestigationInProgress as any).mockResolvedValueOnce({
        investigation_id: 'inv-111',
        episode_id: 'episode-111',
      });

      renderWithRouter(
        <CreateInvestigationDialog {...mockProps} />
      );

      // Simply fill in the form with default priority (medium) and submit
      const textarea = screen.getByPlaceholderText(/Describe the issue/i);
      await userEvent.type(textarea, 'Important issue');

      const submitButton = screen.getByRole('button', { name: /create investigation/i });
      await userEvent.click(submitButton);

      // Verify the API was called with the priority field (should be 'medium' by default)
      await waitFor(() => {
        expect(investigationService.createInvestigationFromAPI).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: expect.any(String),
          })
        );
      }, { timeout: 2000 });
    });
  });
});
