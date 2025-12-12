import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test-utils/test-utils';
import { NannyAILogo } from './NannyAILogo';

describe('NannyAILogo', () => {
  it('should render svg logo', () => {
    const { container } = renderWithProviders(<NannyAILogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { container } = renderWithProviders(<NannyAILogo size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(<NannyAILogo className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });
});
