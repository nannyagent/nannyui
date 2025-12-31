import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownRenderer from '../MarkdownRenderer';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg>mocked mermaid</svg>' }),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('MarkdownRenderer Advanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GitHub Fetch Fallback', () => {
    it('should try GitHub first and use it if successful', async () => {
      const githubContent = '# GitHub Content';
      
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('raw.githubusercontent.com')) {
          return Promise.resolve({
            ok: true,
            text: async () => githubContent,
          });
        }
        return Promise.reject(new Error('Should not reach local'));
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        expect(container.textContent).toContain('GitHub Content');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('raw.githubusercontent.com/nannyagent/nannyapi/add-docs/docs/test.md')
      );
    });

    it('should fallback to local docs if GitHub fetch fails', async () => {
      const localContent = '# Local Content';
      
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('raw.githubusercontent.com')) {
          return Promise.resolve({
            ok: false,
          });
        }
        if (url.includes('/docs/')) {
          return Promise.resolve({
            ok: true,
            text: async () => localContent,
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        expect(container.textContent).toContain('Local Content');
      });

      // Should have called both
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('raw.githubusercontent.com')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/docs/nannyapi/test.md')
      );
    });
  });

  describe('Diagram Rendering', () => {
    it('should render mermaid diagrams using MermaidDiagram component', async () => {
      const markdownContent = '```mermaid\ngraph TD;\nA-->B;\n```';
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        // Check for the mermaid diagram container
        const mermaidContainer = container.querySelector('.mermaid-diagram');
        expect(mermaidContainer).toBeInTheDocument();
        
        // Check for "Open in new tab" button
        const openButton = container.querySelector('button');
        expect(openButton).toHaveTextContent('Open in new tab');
      });
    });

    it('should render flowcharts as plain text pre blocks', async () => {
      const markdownContent = '```flowchart\n[Start] -> [End]\n```';
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => markdownContent,
      });

      const { container } = render(
        <MarkdownRenderer source="nannyapi" filename="test.md" />
      );

      await waitFor(() => {
        // Should find the pre block with flowchart-fix class
        const preBlock = container.querySelector('pre.flowchart-fix');
        expect(preBlock).toBeInTheDocument();
        expect(preBlock).toHaveTextContent('[Start] -> [End]');
        
        // Should NOT be a mermaid diagram
        const mermaidContainer = container.querySelector('.mermaid-diagram');
        expect(mermaidContainer).not.toBeInTheDocument();
      });
    });
  });
});
