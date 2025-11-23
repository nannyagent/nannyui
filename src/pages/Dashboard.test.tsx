
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as errorHandling from '@/utils/errorHandling';
import * as config from '@/utils/config';
import * as authUtils from '@/utils/authUtils';
import * as authService from '@/services/authService';
import * as activityService from '@/services/activityService';
import * as investigationService from '@/services/investigationService';
import * as statsService from '@/services/statsService';
import { placeholderStats, placeholderActivities } from '@/mocks/placeholderData';

// Mock the modules
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component) => Component
}));

vi.mock('@/components/TransitionWrapper', () => ({
  default: ({ children }) => <div data-testid="transition-wrapper">{children}</div>
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/utils/errorHandling', () => ({
  safeFetch: vi.fn(),
  showErrorToast: vi.fn(),
  ApiError: class ApiError extends Error {
    type: errorHandling.ErrorType;
    statusCode?: number;
    constructor(message: string, type = errorHandling.ErrorType.UNKNOWN, statusCode?: number) {
      super(message);
      this.name = 'ApiError';
      this.type = type;
      this.statusCode = statusCode;
    }
  },
  ErrorType: {
    NETWORK: 'network',
    AUTH: 'auth',
    SERVER: 'server',
    UNKNOWN: 'unknown'
  }
}));

vi.mock('@/utils/config', () => ({
  fetchApi: vi.fn(),
  getBackendURL: vi.fn()
}));

vi.mock('@/utils/authUtils', () => ({
  setAccessToken: vi.fn(),
  setUsername: vi.fn()
}));

// Mock Supabase services
vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
  getCurrentSession: vi.fn()
}));

vi.mock('@/services/activityService', () => ({
  getRecentActivities: vi.fn(),
  getActivityIcon: vi.fn(),
  formatActivityTime: vi.fn()
}));

vi.mock('@/services/investigationService', () => ({
  getRecentInvestigationsFromAPI: vi.fn(),
  formatInvestigationTime: vi.fn()
}));

vi.mock('@/services/statsService', () => ({
  getDashboardStats: vi.fn()
}));

describe('Dashboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  // TODO: Uncomment this test after implementing loading state
  // NOT WORKING
  // it('should display loading state initially', () => {
  //   // Mock fetchApi to return a promise that never resolves to keep component in loading state
  //   vi.mocked(config.fetchApi).mockReturnValue(new Promise(() => {}));
    
  //   render(
  //     <BrowserRouter>
  //       <Dashboard />
  //     </BrowserRouter>
  //   );

  //   expect(screen.getByTestId('transition-wrapper')).toBeInTheDocument();
  //   expect(screen.getByTestId('navbar')).toBeInTheDocument();
  //   expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
  //   // Check if loading spinner is displayed
  //   expect(screen.getByRole('status') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
  // });

  it('should fetch user session and dashboard data on mount', async () => {
    const mockUser = { 
      id: 'user-123', 
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z'
    };
    const mockSession = { 
      access_token: 'mock-token', 
      refresh_token: 'refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser 
    };
    const mockStats = {
      totalAgents: 10,
      activeTokens: 5,
      totalInvestigations: 20,
      openIssues: 3,
      totalUsers: 1,
      uptime: '99.9%'
    };

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(authService.getCurrentSession).mockResolvedValue(mockSession as any);
    vi.mocked(activityService.getRecentActivities).mockResolvedValue([]);
    vi.mocked(investigationService.getRecentInvestigationsFromAPI).mockResolvedValue([]);
    vi.mocked(statsService.getDashboardStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Verify that auth services were called
    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(authService.getCurrentSession).toHaveBeenCalled();
    });

    // Verify that dashboard data services were called
    await waitFor(() => {
      expect(activityService.getRecentActivities).toHaveBeenCalled();
      expect(investigationService.getRecentInvestigationsFromAPI).toHaveBeenCalled();
      expect(statsService.getDashboardStats).toHaveBeenCalled();
    });
  });

  it('should redirect to login when auth fails', async () => {
    // Mock auth services to return null (no session)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authService.getCurrentSession).mockResolvedValue(null);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // The component should redirect to login when auth fails
    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // TODO: Uncomment this test after implementing placeholder data
  // not working
  // it('should use placeholder data when API calls fail', async () => {
  //   // Mock GitHub API to succeed but dashboard API to fail
  //   const mockGitHubResponse = {
  //     ok: true,
  //     json: async () => ({ 
  //       access_token: 'mock-token',
  //       user: { name: 'Test User' }
  //     })
  //   };

  //   vi.mocked(config.fetchApi).mockResolvedValue(mockGitHubResponse as Response);
  //   vi.mocked(errorHandling.safeFetch).mockResolvedValue({ 
  //     data: null, 
  //     error: new errorHandling.ApiError('API error', errorHandling.ErrorType.NETWORK) 
  //   });

  //   render(
  //     <BrowserRouter>
  //       <Dashboard />
  //     </BrowserRouter>
  //   );

  //   // Wait for the dashboard to render with placeholder data
  //   await waitFor(() => {
  //     expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  //   });

  //   // Verify error state is shown
  //   await waitFor(() => {
  //     expect(screen.getByRole('alert')).toBeInTheDocument();
  //   });
  // });
});
