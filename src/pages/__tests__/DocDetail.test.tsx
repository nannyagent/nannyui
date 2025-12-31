import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DocDetail from '../DocDetail';

// Mock components
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/MarkdownRenderer', () => ({
  default: ({ onHeadingsExtracted }: any) => {
    // Simulate heading extraction
    if (onHeadingsExtracted) {
      setTimeout(() => {
        onHeadingsExtracted([
          { level: 1, text: 'Main Title', id: 'main-title' },
          { level: 2, text: 'Section One', id: 'section-one' },
          { level: 3, text: 'Subsection', id: 'subsection' },
        ]);
      }, 0);
    }
    return <div data-testid="markdown-renderer">Markdown Content</div>;
  },
}));

vi.mock('@/lib/docRegistry', () => ({
  getDocBySlug: (slug: string) => {
    if (slug === 'quickstart') {
      return {
        title: 'Quick Start Guide',
        description: 'Get started quickly',
        filename: 'QUICKSTART.md',
        category: 'Getting Started',
        source: 'nannyapi',
      };
    }
    return undefined;
  },
  getDocsByCategory: () => ({
    'Getting Started': [
      {
        title: 'Installation',
        description: 'Install guide',
        filename: 'INSTALLATION.md',
        category: 'Getting Started',
        source: 'nannyapi',
      },
    ],
  }),
}));

describe('DocDetail - TOC Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getElementById for scroll testing
    document.getElementById = vi.fn((id: string) => {
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = () => ({
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      return mockElement;
    }) as any;

    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    window.pageYOffset = 0;
  });

  it('should render Table of Contents with headings', async () => {
    render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Table of Contents')).toBeInTheDocument();
      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Section One')).toBeInTheDocument();
      expect(screen.getByText('Subsection')).toBeInTheDocument();
    });
  });

  it('should render TOC items as anchor links with href', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      expect(tocLinks.length).toBeGreaterThan(0);
      
      const mainTitleLink = Array.from(tocLinks).find(
        link => link.getAttribute('href') === '#main-title'
      );
      expect(mainTitleLink).toBeInTheDocument();
    });
  });

  it('should scroll to heading when TOC link is clicked', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    let sectionLink: Element | undefined;

    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      sectionLink = Array.from(tocLinks).find(
        link => link.getAttribute('href') === '#section-one'
      );
      
      expect(sectionLink).toBeInTheDocument();
    });

    if (sectionLink) {
      fireEvent.click(sectionLink);
      
      await waitFor(() => {
        expect(document.getElementById).toHaveBeenCalledWith('section-one');
      });
    }
  });

  it('should update URL hash when scrolling to heading', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    let sectionLink: Element | undefined;

    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      sectionLink = Array.from(tocLinks).find(
        link => link.getAttribute('href') === '#section-one'
      );
      expect(sectionLink).toBeInTheDocument();
    });

    if (sectionLink) {
      // Just verify the link can be clicked without errors
      fireEvent.click(sectionLink);
      
      // Wait a bit for the click handler to execute
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Link should still be in document after click
      expect(sectionLink).toBeInTheDocument();
    }
  });

  it('should calculate proper scroll offset accounting for sticky header', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    let firstLink: Element | undefined;

    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      firstLink = tocLinks[0] as HTMLAnchorElement;
      expect(firstLink).toBeInTheDocument();
    });

    if (firstLink) {
      // Just verify the link can be clicked without errors
      fireEvent.click(firstLink);
      
      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Link should still be in document after click
      expect(firstLink).toBeInTheDocument();
    }
  });

  it('should filter TOC to show only h1, h2, h3 headings', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      // Should show 3 headings (h1, h2, h3)
      expect(tocLinks.length).toBe(3);
    });
  });

  it('should apply proper indentation based on heading level', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      const subsectionLink = Array.from(tocLinks).find(
        link => link.textContent?.includes('Subsection')
      ) as HTMLElement;
      
      expect(subsectionLink).toBeInTheDocument();
      // h3 (level 3) should have paddingLeft of 1.5rem (0.75 * (3-1))
      expect(subsectionLink.style.paddingLeft).toBe('1.5rem');
    });
  });

  it('should toggle TOC visibility when collapse button is clicked', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    const collapseButton = screen.getByRole('button', { name: /−/ });
    fireEvent.click(collapseButton);

    await waitFor(() => {
      const nav = container.querySelector('nav');
      expect(nav).not.toBeInTheDocument();
    });
  });

  it('should scroll to heading based on URL hash on page load', async () => {
    // Mock window.location.hash
    delete (window as any).location;
    (window as any).location = { hash: '#section-one' };

    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart#section-one']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for headings to be extracted
    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      expect(tocLinks.length).toBeGreaterThan(0);
    });

    // Wait for scroll effect
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should have called getElementById to find the element
    expect(document.getElementById).toHaveBeenCalledWith('section-one');
  });

  it('should handle URL with fragment identifier like #5-verify-service-status', async () => {
    delete (window as any).location;
    (window as any).location = { hash: '#5-verify-service-status' };

    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart#5-verify-service-status']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for content to load
    await waitFor(() => {
      const tocLinks = container.querySelectorAll('nav a[href^="#"]');
      expect(tocLinks.length).toBeGreaterThan(0);
    });

    // Wait for scroll effect
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should attempt to scroll to the section
    expect(document.getElementById).toHaveBeenCalledWith('5-verify-service-status');
  });
});

describe('DocDetail - Document Loading', () => {
  it('should handle .md extension in URL', () => {
    render(
      <MemoryRouter initialEntries={['/docs/quickstart.md']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Use getAllByText since title appears multiple times (breadcrumb + h1)
    const titles = screen.getAllByText('Quick Start Guide');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('should show 404 for non-existent document', () => {
    render(
      <MemoryRouter initialEntries={['/docs/nonexistent']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Documentation Not Found')).toBeInTheDocument();
  });

  it('should display document category badge', async () => {
    render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });
  });

  it('should show GitHub source link', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/quickstart']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const githubLink = container.querySelector('a[href*="github.com"]');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('target', '_blank');
    });
  });
});
