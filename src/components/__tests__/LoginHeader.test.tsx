import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithoutProviders as render } from '@/test-utils/test-utils';
import LoginHeader from '../LoginHeader';

describe('LoginHeader', () => {
  it('should render the NannyAI title', () => {
    render(<LoginHeader />);
    
    expect(screen.getByText('NannyAI')).toBeInTheDocument();
  });

  it('should render the subtitle text', () => {
    render(<LoginHeader />);
    
    expect(screen.getByText('Intelligent Linux Agent Diagnostics')).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    const { container } = render(<LoginHeader />);
    
    // Check for main container
    const mainDiv = container.querySelector('.flex.flex-col.items-center');
    expect(mainDiv).toBeInTheDocument();
  });

  it('should render NannyAI logo', () => {
    render(<LoginHeader />);
    
    // The NannyAILogo component should be rendered
    const heading = screen.getByText('NannyAI');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });
});
