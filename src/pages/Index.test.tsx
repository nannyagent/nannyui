import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './Index';

// Mock the landing components
vi.mock('@/components/landing/NavigationHeader', () => ({
  default: () => <div>NavigationHeader</div>
}));
vi.mock('@/components/landing/Hero', () => ({
  default: () => <div>Hero Section</div>
}));
vi.mock('@/components/landing/Features', () => ({
  default: () => <div>Features Section</div>
}));
vi.mock('@/components/landing/DemoSection', () => ({
  default: () => <div>DemoSection</div>
}));
vi.mock('@/components/landing/CallToAction', () => ({
  default: () => <div>CallToAction</div>
}));
vi.mock('@/components/Footer', () => ({
  default: () => <div>Footer</div>
}));

const renderWithHelmet = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Index (Landing Page)', () => {
  it('should render NavigationHeader', () => {
    renderWithHelmet(<Index />);
    expect(screen.getByText('NavigationHeader')).toBeInTheDocument();
  });

  it('should render Hero section', () => {
    renderWithHelmet(<Index />);
    expect(screen.getByText('Hero Section')).toBeInTheDocument();
  });

  it('should render Features section', () => {
    renderWithHelmet(<Index />);
    expect(screen.getByText('Features Section')).toBeInTheDocument();
  });
});
