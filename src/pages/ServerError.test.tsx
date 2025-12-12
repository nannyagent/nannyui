import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
import ServerError from './ServerError';

describe('ServerError', () => {
  it('should render 500 heading', () => {
    renderWithProviders(<ServerError />);
    const heading = screen.getByRole('heading', { name: '500' });
    expect(heading).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderWithProviders(<ServerError />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render navbar and footer', () => {
    const { container } = renderWithProviders(<ServerError />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });
});
