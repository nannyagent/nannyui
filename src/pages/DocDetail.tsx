import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Github,
  ExternalLink,
  ChevronRight,
  List
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getDocBySlug, getDocsByCategory } from '@/lib/docRegistry';

const DocDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Remove .md extension if present
  const cleanSlug = slug?.toLowerCase().replace(/\.md$/, '');
  const doc = cleanSlug ? getDocBySlug(cleanSlug) : undefined;
  
  const [headings, setHeadings] = useState<{ text: string; level: number; id: string }[]>([]);
  const [showToc, setShowToc] = useState(true);
  
  const categorizedDocs = getDocsByCategory();
  const relatedDocs = categorizedDocs[doc?.category || '']?.filter(d => d.filename !== doc?.filename) || [];
  
  const sourceUrl = doc?.source === 'nannyapi' 
    ? `https://github.com/nannyagent/nannyapi/blob/add-docs/docs/${doc?.filename}`
    : `https://github.com/nannyagent/nannyagent/blob/add-docs/docs/${doc?.filename}`;

  const scrollToHeading = React.useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Find the scrollable container (TransitionWrapper)
      const scrollContainer = element.closest('.overflow-y-auto');
      if (scrollContainer) {
        const offset = 120; // Account for sticky header
        const elementPosition = element.getBoundingClientRect().top;
        const containerPosition = scrollContainer.getBoundingClientRect().top;
        const scrollPosition = scrollContainer.scrollTop + (elementPosition - containerPosition) - offset;
        
        scrollContainer.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        
        // Update URL hash without triggering a jump
        window.history.pushState(null, '', `#${id}`);
      }
    }
  }, []);

  // Handle URL hash navigation on page load
  React.useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash && headings.length > 0) {
      // Wait for content to render, then scroll
      setTimeout(() => {
        scrollToHeading(hash);
      }, 100);
    }
  }, [headings, scrollToHeading]);
  
  if (!doc) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
          <Navbar />
          <TransitionWrapper className="flex-1 overflow-y-auto p-6">
            <div className="container max-w-4xl mx-auto py-12 text-center">
              <h1 className="text-3xl font-bold mb-4">Documentation Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The documentation you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate('/docs')}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documentation
              </button>
            </div>
          </TransitionWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto">
          <div className="container max-w-7xl mx-auto p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <button
                onClick={() => navigate('/docs')}
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{doc.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <GlassMorphicCard className="mb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                        {doc.category}
                      </div>
                      <h1 className="text-3xl font-bold">{doc.title}</h1>
                      <p className="text-muted-foreground mt-2">{doc.description}</p>
                    </div>
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      View on GitHub
                    </a>
                  </div>

                  <div className="border-t border-border/40 pt-6">
                    <MarkdownRenderer 
                      source={doc.source} 
                      filename={doc.filename}
                      onHeadingsExtracted={setHeadings}
                    />
                  </div>
                </GlassMorphicCard>

                {/* Feedback Section */}
                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-3">Was this helpful?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Help us improve our documentation by providing feedback.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      👍 Yes
                    </button>
                    <button className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                      👎 No
                    </button>
                  </div>
                </GlassMorphicCard>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <GlassMorphicCard className="sticky top-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Table of Contents
                      </h3>
                      <button
                        onClick={() => setShowToc(!showToc)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showToc ? '−' : '+'}
                      </button>
                    </div>
                    {showToc && (
                      <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                        {headings
                          .filter(h => h.level <= 3)
                          .map((heading, i) => (
                            <a
                              key={i}
                              href={`#${heading.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                scrollToHeading(heading.id);
                              }}
                              className="block w-full text-left py-1.5 px-2 text-sm hover:bg-muted/50 rounded transition-colors"
                              style={{
                                paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                              }}
                            >
                              <span className={
                                heading.level === 1 
                                  ? 'font-semibold text-foreground' 
                                  : heading.level === 2
                                  ? 'font-medium text-foreground/90'
                                  : 'text-muted-foreground'
                              }>
                                {heading.text}
                              </span>
                            </a>
                          ))}
                      </nav>
                    )}
                  </GlassMorphicCard>
                )}

                {/* Related Articles */}
                {relatedDocs.length > 0 && (
                  <GlassMorphicCard>
                    <h3 className="font-semibold mb-4">Related Articles</h3>
                    <div className="space-y-2">
                      {relatedDocs.slice(0, 5).map((relatedDoc) => (
                        <button
                          key={relatedDoc.filename}
                          onClick={() => navigate(`/docs/${relatedDoc.filename.replace('.md', '').toLowerCase()}`)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {relatedDoc.title}
                            </span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </GlassMorphicCard>
                )}
              </div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default DocDetail;
