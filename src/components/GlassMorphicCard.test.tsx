import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test-utils/test-utils';
import GlassMorphicCard from './GlassMorphicCard';

describe('GlassMorphicCard', () => {
  it('should render children', () => {
    const { container } = renderWithProviders(
      <GlassMorphicCard>
        <div>Test Content</div>
      </GlassMorphicCard>
    );
    expect(container.textContent).toContain('Test Content');
  });

  it('should apply glass-card class', () => {
    const { container } = renderWithProviders(
      <GlassMorphicCard>Test</GlassMorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card');
  });

  it('should accept custom className', () => {
    const { container } = renderWithProviders(
      <GlassMorphicCard className="custom-class">Test</GlassMorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('should apply hover effect when enabled', () => {
    const { container } = renderWithProviders(
      <GlassMorphicCard hoverEffect>Test</GlassMorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-xl');
  });
});
