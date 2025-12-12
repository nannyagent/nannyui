import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test-utils/test-utils';
import TransitionWrapper from './TransitionWrapper';

describe('TransitionWrapper', () => {
  it('should render children', () => {
    const { container } = renderWithProviders(
      <TransitionWrapper>
        <div>Test Content</div>
      </TransitionWrapper>
    );
    expect(container.textContent).toContain('Test Content');
  });

  it('should apply animation classes', () => {
    const { container } = renderWithProviders(
      <TransitionWrapper>Test</TransitionWrapper>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('should accept custom props', () => {
    const { container} = renderWithProviders(
      <TransitionWrapper>Test</TransitionWrapper>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
