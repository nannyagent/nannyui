import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import InvestigationDialog from './InvestigationDialog';
import * as investigationService from '@/services/investigationService';

// Mock InferenceDialog
vi.mock('./InferenceDialog', () => ({
  default: ({ open, onOpenChange }: any) => (
    open ? <div data-testid="inference-dialog">Inference Dialog <button onClick={() => onOpenChange(false)}>Close</button></div> : null
  )
}));

// Mock investigation service
vi.mock('@/services/investigationService', () => ({
  getInvestigation: vi.fn(),
  formatInvestigationTime: (time: string) => time,
}));

describe('InvestigationDialog', () => {
  const mockInvestigation = {
    id: 'inv-123',
    user_prompt: 'Test User Prompt',
    status: 'in_progress',
    priority: 'high',
    created: '2023-01-01T00:00:00Z',
    updated: '2023-01-02T00:00:00Z',
    agent: {
      id: 'agent-123',
      hostname: 'test-agent',
      os_type: 'linux',
      os_version: '22.04',
      primary_ip: '192.168.1.100',
    },
    metadata: {
      inferences: [
        {
          id: 'inf-1',
          title: 'Inference 1',
          status: 'completed',
          created: '2023-01-01T01:00:00Z',
          output: {
            resolution: 'Resolved issue',
            summary: 'Summary of resolution'
          }
        }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (investigationService.getInvestigation as any).mockResolvedValue(mockInvestigation);
  });

  it('renders nothing when closed', () => {
    render(
      <InvestigationDialog
        investigation={mockInvestigation as any}
        open={false}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.queryByText('Investigation Episode Details')).not.toBeInTheDocument();
  });

  it('renders investigation details when open', async () => {
    render(
      <InvestigationDialog
        investigation={mockInvestigation as any}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Investigation Episode Details')).toBeInTheDocument();
      expect(screen.getByText('Test User Prompt')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('in progress')).toBeInTheDocument();
    });
  });

  it('fetches full investigation data on open', async () => {
    render(
      <InvestigationDialog
        investigation={{ id: 'inv-123', status: 'pending', priority: 'low', user_prompt: 'Loading...' } as any}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(investigationService.getInvestigation).toHaveBeenCalledWith('inv-123');
      expect(screen.getByText('Investigation Episode Details')).toBeInTheDocument();
    });
  });

  it('displays agent information', async () => {
    render(
      <InvestigationDialog
        investigation={mockInvestigation as any}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('test-agent')).toBeInTheDocument();
    });
  });

  it('displays inferences list', async () => {
    render(
      <InvestigationDialog
        investigation={mockInvestigation as any}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Inference 1')).toBeInTheDocument();
    });
  });

  it('opens inference dialog when clicking view details', async () => {
    render(
      <InvestigationDialog
        investigation={mockInvestigation as any}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('View')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('View')[0]);
    expect(screen.getByTestId('inference-dialog')).toBeInTheDocument();
  });
});
