import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test-utils/test-utils';
import { NannyAILogo } from './NannyAILogo';

describe('NannyAILogo', () => {
  it('should render img logo', () => {
    const { container } = renderWithProviders(<NannyAILogo />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { container } = renderWithProviders(<NannyAILogo size="lg" />);
    const img = container.querySelector('img');
    expect(img).toHaveClass('h-10', 'w-10');
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(<NannyAILogo className="custom-class" />);
    const img = container.querySelector('img');
    expect(img).toHaveClass('custom-class');
  });
});
