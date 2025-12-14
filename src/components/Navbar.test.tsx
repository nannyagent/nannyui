import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
import Navbar from './Navbar';
import * as authService from '@/services/authService';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navbar header', () => {
    renderWithProviders(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithProviders(<Navbar />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render notification bell button', () => {
    renderWithProviders(<Navbar />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display user name when user is authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { name: 'John Doe' },
    };
    
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);
    
    renderWithProviders(<Navbar />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display email username when full name is not available', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'testuser@example.com',
      user_metadata: {},
    };
    
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);
    
    renderWithProviders(<Navbar />);
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should display default User when no user data is available', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
    
    renderWithProviders(<Navbar />);
    
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching user data', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Failed to fetch user'));
    
    renderWithProviders(<Navbar />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
    
    consoleErrorSpy.mockRestore();
  });
});
