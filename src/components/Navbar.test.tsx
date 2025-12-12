import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
import Navbar from './Navbar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

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
});
