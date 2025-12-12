import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('should render 404 heading', () => {
    renderWithProviders(<NotFound />);
    const heading = screen.getByRole('heading', { name: '404' });
    expect(heading).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    renderWithProviders(<NotFound />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render navbar and footer', () => {
    const { container } = renderWithProviders(<NotFound />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });
});
