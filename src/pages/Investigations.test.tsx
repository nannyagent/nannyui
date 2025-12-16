import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('episode_id filtering', () => {
    it('should filter investigations to only show those with episode_id', async () => {
      const mockData = {
        investigations: [
          {
            id: 1,
            investigation_id: 'inv-1',
            episode_id: 'episode-1',
            issue: 'Issue 1',
            agent_id: 'agent-1',
            priority: 'high' as const,
            initiated_by: 'user-1',
            status: 'completed' as const,
            created_at: new Date().toISOString(),
            initiated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            inference_count: 5,
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
        filters: {
          status: 'all',
          agent_id: 'all',
        },
      };

      (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

      renderWithRouter(<Investigations />);

      await waitFor(() => {
        expect(investigationService.getInvestigationsPaginated).toHaveBeenCalledWith(
          1,
          10,
          true,
          true // onlyWithEpisodes should be true
        );
      });

      // Should display investigation
      await waitFor(() => {
        expect(screen.getByText('Issue 1')).toBeInTheDocument();
      });
    });

    it('should display empty state when no investigations with episode_id exist', async () => {
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

    it('should exclude investigations without episode_id from list', async () => {
      // Mock returning mixed results (though API should filter these)
      const mockData = {
        investigations: [
          {
            id: 1,
            investigation_id: 'inv-1',
            episode_id: 'episode-1',
            issue: 'With Episode',
            agent_id: 'agent-1',
            priority: 'high' as const,
            initiated_by: 'user-1',
            status: 'completed' as const,
            created_at: new Date().toISOString(),
            initiated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            inference_count: 5,
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
        filters: {
          status: 'all',
          agent_id: 'all',
        },
      };

      (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

      renderWithRouter(<Investigations />);

      await waitFor(() => {
        expect(screen.getByText('With Episode')).toBeInTheDocument();
      });

      // The API call should request only investigations with episode_id
      expect(investigationService.getInvestigationsPaginated).toHaveBeenCalledWith(
        1,
        10,
        true,
        true
      );
    });
  });

  describe('investigation navigation', () => {
    it('should navigate to investigation detail using episode_id', async () => {
      const mockNavigate = vi.fn();
      vi.mocked(require('react-router-dom')).useNavigate.mockReturnValue(mockNavigate);

      const mockData = {
        investigations: [
          {
            id: 1,
            investigation_id: 'inv-1',
            episode_id: 'episode-abc123',
            issue: 'Test issue',
            agent_id: 'agent-1',
            priority: 'high' as const,
            initiated_by: 'user-1',
            status: 'in_progress' as const,
            created_at: new Date().toISOString(),
            initiated_at: new Date().toISOString(),
            completed_at: null,
            updated_at: new Date().toISOString(),
            inference_count: 3,
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
        filters: {
          status: 'all',
          agent_id: 'all',
        },
      };

      (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

      renderWithRouter(<Investigations />);

      // Wait for the investigation to be displayed
      await waitFor(() => {
        expect(screen.getByText('Test issue')).toBeInTheDocument();
      });

      // Click on the Details button
      const detailsButton = screen.getByRole('button', { name: /details/i });
      await userEvent.click(detailsButton);

      // Should navigate using episode_id
      expect(mockNavigate).toHaveBeenCalledWith('/investigations/episode-abc123');
    });
  });

  describe('pagination', () => {
    it('should handle pagination correctly with episode_id filter', async () => {
      const mockData = {
        investigations: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          investigation_id: `inv-${i + 1}`,
          episode_id: `episode-${i + 1}`,
          issue: `Issue ${i + 1}`,
          agent_id: 'agent-1',
          priority: 'high' as const,
          initiated_by: 'user-1',
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          initiated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          inference_count: 5,
        })),
        pagination: {
          page: 1,
          limit: 10,
          total: 20,
          total_pages: 2,
          has_next: true,
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
        expect(screen.getByText('Issue 1')).toBeInTheDocument();
      });

      // Pagination should use onlyWithEpisodes=true
      expect(investigationService.getInvestigationsPaginated).toHaveBeenCalledWith(
        1,
        10,
        true,
        true
      );

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      // Should call API with page 2 and same filter settings
      await waitFor(() => {
        const calls = (investigationService.getInvestigationsPaginated as any).mock.calls;
        expect(calls[calls.length - 1]).toEqual([2, 10, true, true]);
      });
    });

    it('should display pagination info correctly', async () => {
      const mockData = {
        investigations: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          investigation_id: `inv-${i + 1}`,
          episode_id: `episode-${i + 1}`,
          issue: `Issue ${i + 1}`,
          agent_id: 'agent-1',
          priority: 'high' as const,
          initiated_by: 'user-1',
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          initiated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          inference_count: 5,
        })),
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          total_pages: 3,
          has_next: true,
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
        expect(screen.getByText(/Showing 10 of 25 investigations/i)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error message on fetch failure', async () => {
      (investigationService.getInvestigationsPaginated as any).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      renderWithRouter(<Investigations />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load investigations/i)).toBeInTheDocument();
      });
    });

    it('should display timeout error correctly', async () => {
      (investigationService.getInvestigationsPaginated as any).mockRejectedValueOnce(
        new Error('Request timeout')
      );

      renderWithRouter(<Investigations />);

      await waitFor(() => {
        expect(screen.getByText(/Request timed out/i)).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    it('should show loading state while fetching', async () => {
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

      (investigationService.getInvestigationsPaginated as any).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve(mockData), 100))
      );

      renderWithRouter(<Investigations />);

      // Should show loader
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

      // Should eventually show empty state
      await waitFor(() => {
        expect(screen.getByText(/No investigations found/i)).toBeInTheDocument();
      });
    });
  });
});
