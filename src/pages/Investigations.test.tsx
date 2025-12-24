import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Investigations from './Investigations';
import * as investigationService from '@/services/investigationService';

// Mock dependencies
vi.mock('@/services/investigationService', () => ({
  getInvestigationsPaginated: vi.fn(),
  getApplicationGroupIcon: vi.fn(() => null),
  formatInvestigationTime: vi.fn((time: string) => new Date(time).toLocaleDateString()),
  getPriorityColor: vi.fn(() => 'text-red-600'),
  getStatusColor: vi.fn(() => 'bg-blue-100'),
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => Component,
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

describe('Investigations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getInvestigationsPaginated with correct parameters on mount', async () => {
    const mockData = {
      investigations: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
      filters: {
        status: 'all',
        agent_id: 'all',
      },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(investigationService.getInvestigationsPaginated).toHaveBeenCalled();
    });
  });

  it('should display investigations when data is fetched', async () => {
    const mockData = {
      investigations: [
        {
          id: 'inv-1',
          user_prompt: 'Test Issue',
          episode_id: 'episode-1',
          agent_id: 'agent-1',
          agent: { hostname: 'agent-host' },
          priority: 'high' as const,
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          initiated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          inference_count: 5,
          metadata: {},
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByText('Test Issue')).toBeInTheDocument();
      
      const idLabel = screen.getByText('ID:');
      expect(idLabel.parentElement).toHaveTextContent('inv-1');
      
      const episodeLabel = screen.getByText('Episode:');
      expect(episodeLabel.parentElement).toHaveTextContent('episode-1');
      
      const agentLabel = screen.getByText('Agent:');
      expect(agentLabel.parentElement).toHaveTextContent('agent-host');
    });
  });

  it('should display empty state when no investigations exist', async () => {
    const mockData = {
      investigations: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
      filters: {
        status: 'all',
        agent_id: 'all',
      },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByText(/No investigations found/i)).toBeInTheDocument();
    });
  });
});
