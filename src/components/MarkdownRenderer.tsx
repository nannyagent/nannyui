/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2, AlertCircle, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mermaid from 'mermaid';

interface MarkdownRendererProps {
  source: 'nannyapi' | 'nannyagent';
  filename: string;
  className?: string;
  onHeadingsExtracted?: (headings: { text: string; level: number; id: string }[]) => void;
}

// Initialize mermaid with configuration
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit'
});

// Mermaid component for rendering diagrams with zoom capability
const MermaidDiagram: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (ref.current && chart) {
      const renderDiagram = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg: renderedSvg } = await mermaid.render(id, chart);
          setSvg(renderedSvg);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setSvg('<div style="color: red; padding: 1rem;">Error rendering diagram</div>');
        }
      };
      renderDiagram();
    }
  }, [chart]);

  const handleDiagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(true);
  };

  const handleOverlayClick = () => {
    setIsZoomed(false);
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="my-6">
        <div 
          ref={ref} 
          className="mermaid-diagram flex justify-center items-center p-4 bg-white rounded border border-gray-200 overflow-auto cursor-pointer hover:border-blue-400 transition-colors"
          onClick={handleDiagramClick}
          dangerouslySetInnerHTML={{ __html: svg }}
          title="Click to zoom"
        />
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleOpenInNewTab}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            📂 Open in new tab
          </button>
          <span className="text-sm text-gray-500">💡 Click diagram to zoom</span>
        </div>
      </div>

      {/* Zoom overlay */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={handleOverlayClick}
        >
          <div 
            className="relative max-w-[95vw] max-h-[95vh] overflow-auto bg-white rounded-lg shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleOverlayClick}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg z-10"
              title="Close (or click outside)"
            >
              ×
            </button>
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      )}
    </>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  source, 
  filename,
  className = '',
  onHeadingsExtracted
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Code snippet copied successfully',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from local docs first
        const localPath = `/docs/${source}/${filename}`;
        const response = await fetch(localPath);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documentation: ${response.statusText}`);
        }
        
        let text = await response.text();
        
        // Fix broken HTML image tags in markdown and make them smaller
        text = text.replace(
          /<p align="center">\s*<img src="([^"]+)"\s+alt="([^"]*)"\s+width="(\d+)"\s*\/>\s*<\/p>/gi,
          (match, src, alt) => {
            // Convert to markdown with smaller width (120px instead of original)
            return `\n![${alt}](${src})\n`;
          }
        );
        
        // Remove broken HTML div tags and navigation elements
        text = text.replace(
          /<div align="center">\s*<p><strong>Next:<\/strong>.*?<\/p>.*?<\/div>/gis,
          ''
        );
        
        text = text.replace(
          /<div align="center">.*?<\/div>/gis,
          ''
        );
        
        // Extract headings for TOC
        if (onHeadingsExtracted) {
          const headingMatches = text.matchAll(/^(#{1,6})\s+(.+)$/gm);
          const headings = Array.from(headingMatches).map(match => ({
            level: match[1].length,
            text: match[2].trim(),
            id: match[2].trim().toLowerCase().replace(/[^\w]+/g, '-')
          }));
          onHeadingsExtracted(headings);
        }
        
        setContent(text);
      } catch (err) {
        console.error('Error fetching documentation:', err);
        setError('Unable to load documentation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [source, filename, onHeadingsExtracted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  // Enhanced blockquote processing to detect note types
  const processBlockquote = (children: any) => {
    const text = String(children);
    const lowerText = text.toLowerCase();
    
    if (lowerText.startsWith('**note') || lowerText.includes('> **note')) {
      return { type: 'info', icon: Info, color: 'blue' };
    } else if (lowerText.startsWith('**warning') || lowerText.includes('⚠️')) {
      return { type: 'warning', icon: AlertTriangle, color: 'yellow' };
    } else if (lowerText.startsWith('**tip') || lowerText.startsWith('**💡')) {
      return { type: 'tip', icon: Lightbulb, color: 'green' };
    } else if (lowerText.startsWith('**important') || lowerText.includes('❗')) {
      return { type: 'important', icon: AlertCircle, color: 'red' };
    } else if (lowerText.startsWith('**success') || lowerText.includes('✅')) {
      return { type: 'success', icon: CheckCircle, color: 'green' };
    } else if (lowerText.startsWith('**danger') || lowerText.includes('❌')) {
      return { type: 'danger', icon: XCircle, color: 'red' };
    }
    return { type: 'default', icon: Info, color: 'gray' };
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <style>{`
        .markdown-body {
          color: hsl(var(--foreground));
          line-height: 1.8;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .markdown-body p {
          margin: 1rem 0;
        }
        .markdown-body strong {
          color: hsl(var(--primary));
          font-weight: 600;
        }
        .markdown-body em {
          color: hsl(var(--muted-foreground));
        }
        .markdown-body code:not(pre code) {
          background: hsl(var(--muted));
          color: hsl(var(--primary));
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Courier New', 'Monaco', monospace;
        }
        .markdown-body pre {
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .markdown-body hr {
          border-color: hsl(var(--border));
          margin: 2rem 0;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className;
            const codeString = String(children).replace(/\n$/, '');
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
            const language = match ? match[1] : 'text';
            
            // Mermaid diagrams should be rendered visually
            const isMermaid = language === 'mermaid';
            // Flowcharts are ASCII art and should be plain text
            const isFlowchart = language === 'flowchart';
            
            // Handle both with and without language specification
            return !isInline ? (
              isMermaid ? (
                // Render mermaid diagrams visually with zoom
                <MermaidDiagram chart={codeString} />
              ) : isFlowchart ? (
                // Render flowchart ASCII art as plain text - NO STYLING like GitHub
                <pre className="my-4 overflow-x-auto" style={{ 
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  margin: '1rem 0'
                }}>
                  <code className="font-mono text-sm" style={{
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    padding: 0
                  }}>
                    {codeString}
                  </code>
                </pre>
              ) : (
                // Regular code blocks with dark blue background
                <div className="relative group my-4">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(codeString, codeId)}
                      className="p-2 rounded-md bg-slate-700/80 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Copy code"
                    >
                      {copiedCode === codeId ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-200" />
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1.25rem',
                      paddingTop: '1.5rem',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#e2e8f0',
                      fontFamily: '"Courier New", "Monaco", monospace',
                    }}
                    codeTagProps={{
                      style: {
                        color: '#e2e8f0',
                        fontFamily: '"Courier New", "Monaco", monospace',
                        textShadow: 'none',
                      }
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              )
            ) : (
              <code className="px-1.5 py-0.5 rounded text-sm bg-slate-800 text-blue-400 font-mono border border-slate-700" {...props}>
                {children}
              </code>
            );
          },
          a({ children, href, ...props }: any) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-all"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1({ children, ...props }: any) {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h1 
                id={id}
                className="text-4xl font-bold mt-8 mb-4 pb-3 border-b-2 border-primary/20 text-foreground scroll-mt-20" 
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }: any) {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h2 
                id={id}
                className="text-3xl font-semibold mt-8 mb-3 text-foreground flex items-center gap-2 scroll-mt-20" 
                {...props}
              >
                <span className="text-primary">›</span>
                {children}
              </h2>
            );
          },
          h3({ children, ...props }: any) {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h3 
                id={id}
                className="text-2xl font-medium mt-6 mb-2 text-foreground scroll-mt-20" 
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4({ children, ...props }: any) {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h4 
                id={id}
                className="text-xl font-medium mt-5 mb-2 text-muted-foreground scroll-mt-20" 
                {...props}
              >
                {children}
              </h4>
            );
          },
          ul({ children, ...props }: any) {
            return (
              <ul className="list-none space-y-2 my-4 ml-4" {...props}>
                {React.Children.map(children, (child: any) => {
                  if (child?.type === 'li') {
                    return React.cloneElement(child, {
                      className: 'flex items-start gap-2 text-foreground/90',
                      children: (
                        <>
                          <span className="text-primary mt-1.5 text-xs">▪</span>
                          <span className="flex-1">{child.props.children}</span>
                        </>
                      )
                    });
                  }
                  return child;
                })}
              </ul>
            );
          },
          ol({ children, ...props }: any) {
            return (
              <ol className="list-decimal list-inside space-y-2 my-4 ml-4 text-foreground/90" {...props}>
                {children}
              </ol>
            );
          },
          blockquote({ children, ...props }: any) {
            const noteInfo = processBlockquote(children);
            const Icon = noteInfo.icon;
            
            const colorClasses = {
              blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
              yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
              green: 'border-green-500 bg-green-500/10 text-green-400',
              red: 'border-red-500 bg-red-500/10 text-red-400',
              gray: 'border-muted bg-muted/30 text-muted-foreground',
            };
            
            const colorClass = colorClasses[noteInfo.color as keyof typeof colorClasses] || colorClasses.gray;
            
            return (
              <blockquote 
                className={`border-l-4 pl-4 pr-4 py-3 my-6 rounded-r-lg ${colorClass} flex gap-3`} 
                {...props}
              >
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 [&>p]:my-1">{children}</div>
              </blockquote>
            );
          },
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto my-6 rounded-lg border border-border max-w-full">
                <table className="min-w-full divide-y divide-border break-words" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }: any) {
            return (
              <th className="px-6 py-3 bg-muted/50 font-semibold text-left text-foreground text-sm break-words" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }: any) {
            return (
              <td className="px-6 py-4 text-foreground/80 text-sm border-t border-border break-words" {...props}>
                {children}
              </td>
            );
          },
          img({ src, alt, ...props }: any) {
            // Check if this is a logo (NannyAgent logo)
            const isLogo = alt?.toLowerCase().includes('logo') || alt?.toLowerCase().includes('nannyagent');
            return (
              <img 
                src={src} 
                alt={alt}
                className="max-w-full h-auto rounded-lg shadow-lg border border-border my-6 block mx-auto"
                style={{ 
                  width: isLogo ? '120px' : 'auto',
                  maxWidth: '100%',
                  display: 'block',
                  margin: '1.5rem auto',
                }}
                {...props}
              />
            );
          },
          p({ children, ...props }: any) {
            const text = String(children);
            // Don't wrap pre-formatted text in p tags
            if (text.includes('```') || text.match(/^\s+\w+/)) {
              return <>{children}</>;
            }
            return <p className="text-foreground/90 leading-relaxed my-4" {...props}>{children}</p>;
          },
          pre({ children, ...props }: any) {
            // Check if this contains a mermaid or flowchart code block
            const codeChild = children?.props;
            const className = codeChild?.className || '';
            const isMermaid = className.includes('language-mermaid');
            const isFlowchart = className.includes('language-flowchart');
            
            // For mermaid diagrams, don't wrap in pre tag - the MermaidDiagram component handles it
            if (isMermaid) {
              return <>{children}</>;
            }
            
            // For flowcharts, don't add extra pre wrapper - code component handles it
            if (isFlowchart) {
              return <>{children}</>;
            }
            
            return <pre className="my-4" {...props}>{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
