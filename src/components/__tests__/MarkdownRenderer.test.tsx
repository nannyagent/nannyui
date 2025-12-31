import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownRenderer from '../MarkdownRenderer';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Logo Rendering', () => {
    it('should convert HTML image tags to proper markdown images', async () => {
      const htmlContent = `<p align="center"><img src="https://avatars.githubusercontent.com/u/110624612" alt="NannyAgent Logo" width="200" /></p>`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => htmlContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const img = container.querySelector('img[alt="NannyAgent Logo"]');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://avatars.githubusercontent.com/u/110624612');
      });
    });

    it('should render logos at 120px width', async () => {
      const markdownContent = `![NannyAgent Logo](https://avatars.githubusercontent.com/u/110624612)`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const img = container.querySelector('img[alt="NannyAgent Logo"]');
        expect(img).toBeInTheDocument();
        expect(img).toHaveStyle({ width: '120px' });
      });
    });

    it('should not render raw HTML div tags', async () => {
      const htmlContent = `<p align="center"><img src="test.png" alt="Test Logo" width="200" /></p>`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => htmlContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        
        // Should not have div wrapper that causes hydration error
        // Images should be rendered directly without div wrapper
        const textContent = container.textContent || '';
        expect(textContent).not.toContain('<div style=');
      });
    });
  });

  describe('Code Block Rendering', () => {
    it('should render code blocks with syntax highlighting', async () => {
      const markdownContent = '```bash\necho "test"\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const codeBlock = container.querySelector('pre');
        expect(codeBlock).toBeInTheDocument();
        
        // Check that SyntaxHighlighter is rendering
        const code = container.querySelector('code');
        expect(code).toBeInTheDocument();
      });
    });

    it('should handle code blocks without language specification', async () => {
      const markdownContent = '```\nsome code\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const codeBlock = container.querySelector('pre');
        expect(codeBlock).toBeInTheDocument();
      });
    });

    it('should render copy button on code blocks', async () => {
      const markdownContent = '```bash\necho "test"\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const copyButton = container.querySelector('button[title="Copy code"]');
        expect(copyButton).toBeInTheDocument();
      });
    });

    it('should copy code to clipboard when copy button is clicked', async () => {
      const markdownContent = '```bash\necho "test"\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const copyButton = container.querySelector('button[title="Copy code"]');
        expect(copyButton).toBeInTheDocument();
        
        if (copyButton) {
          fireEvent.click(copyButton);
        }
      });

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('echo "test"');
      });
    });

    it('should use muted color scheme for inline code', async () => {
      const markdownContent = '`inline code`';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const code = container.querySelector('code');
        expect(code).toBeInTheDocument();
        expect(code).toHaveClass('bg-muted');
        expect(code).toHaveClass('text-foreground');
      });
    });
  });

  describe('Content Clarity', () => {
    it('should not apply blur effects to text', async () => {
      const markdownContent = '# Test Heading\n\nTest paragraph content.';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const style = container.querySelector('style');
        const styleContent = style?.textContent || '';
        
        // Check for proper font smoothing
        expect(styleContent).toContain('-webkit-font-smoothing: antialiased');
        expect(styleContent).toContain('-moz-osx-font-smoothing: grayscale');
        
        // Should not contain blur or filter effects
        expect(styleContent).not.toContain('blur');
        expect(styleContent).not.toContain('filter');
      });
    });

    it('should use Courier New for terminal-like code display', async () => {
      const markdownContent = '```bash\nls -la\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const codeBlock = container.querySelector('pre');
        expect(codeBlock).toBeInTheDocument();
        
        // Check for Courier font in style attribute
        const codeElement = container.querySelector('[style*="Courier"]');
        expect(codeElement).toBeInTheDocument();
      });
    });
  });

  describe('Heading Extraction for TOC', () => {
    it('should extract headings and call onHeadingsExtracted callback', async () => {
      const markdownContent = `# Main Title
## Section 1
### Subsection 1.1
## Section 2`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const mockCallback = vi.fn();

      render(
        <MarkdownRenderer 
          source="nannyapi" 
          filename="test.md" 
          onHeadingsExtracted={mockCallback}
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith([
          { level: 1, text: 'Main Title', id: 'main-title' },
          { level: 2, text: 'Section 1', id: 'section-1' },
          { level: 3, text: 'Subsection 1.1', id: 'subsection-1-1' },
          { level: 2, text: 'Section 2', id: 'section-2' },
        ]);
      });
    });

    it('should generate proper IDs from heading text', async () => {
      const markdownContent = `## API Integration & Setup
### Configuration (Advanced)`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const mockCallback = vi.fn();

      render(
        <MarkdownRenderer 
          source="nannyapi" 
          filename="test.md" 
          onHeadingsExtracted={mockCallback}
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith([
          { level: 2, text: 'API Integration & Setup', id: 'api-integration-setup' },
          { level: 3, text: 'Configuration (Advanced)', id: 'configuration-advanced-' },
        ]);
      });
    });
  });

  describe('HTML Cleanup', () => {
    it('should remove navigation HTML elements', async () => {
      const htmlContent = `<div align="center"><p><strong>Next:</strong> <a href="test.md">Test</a></p></div>\n\n# Content`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => htmlContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const textContent = container.textContent || '';
        expect(textContent).not.toContain('Next:');
      });
    });

    it('should remove centered div wrappers', async () => {
      const htmlContent = `<div align="center">Centered Text</div>\n\n# Content`;
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => htmlContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const textContent = container.textContent || '';
        expect(textContent).not.toContain('<div align="center">');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when fetch fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<MarkdownRenderer source="nannyapi" filename="test.md" />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load documentation/i)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      (global.fetch as any).mockImplementation(() => new Promise(() => {}));

      const { container } = render(<MarkdownRenderer source="nannyapi" filename="test.md" />);

      // Check for loading spinner by class or test-id
      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Flowchart Rendering', () => {
    it('should render flowchart ASCII art as plain monospace text', async () => {
      const markdownContent = '```flowchart\n┌─────────┐\n│  Agent  │\n└────┬────┘\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        // Flowcharts should render as pre with plain styling
        const pre = container.querySelector('pre.flowchart-fix');
        expect(pre).toBeInTheDocument();
        
        // Check for inline styles that we applied
        expect(pre).toHaveStyle({ whiteSpace: 'pre' });
        expect(pre).toHaveStyle({ background: '#ffffff' });
        expect(pre).toHaveStyle({ color: '#000000' });
        
        // Check for font stack
        const fontFamily = pre?.style.fontFamily || '';
        expect(fontFamily).toContain('Menlo');
      });
    });

    it('should render mermaid blocks as visual SVG diagrams', async () => {
      const markdownContent = '```mermaid\ngraph TD\n    A --> B\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const mermaidDiv = container.querySelector('.mermaid-diagram');
        expect(mermaidDiv).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should not show copy button for flowcharts or mermaid', async () => {
      const markdownContent = '```flowchart\n┌─────────┐\n│  Test   │\n└─────────┘\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        // Flowcharts should not have copy button
        const copyButton = container.querySelector('button[title="Copy code"]');
        expect(copyButton).not.toBeInTheDocument();
      });
    });

    it('should render regular code blocks with dark background', async () => {
      const markdownContent = '```bash\necho "test"\n```';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        const syntaxHighlighter = container.querySelector('div[style*="background"]');
        expect(syntaxHighlighter).toBeInTheDocument();
        
        // Should have copy button for regular code
        const copyButton = container.querySelector('button[title="Copy code"]');
        expect(copyButton).toBeInTheDocument();
      });
    });
  });
});
