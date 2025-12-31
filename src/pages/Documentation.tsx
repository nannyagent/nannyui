
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Terminal, 
  Code, 
  Server, 
  Shield,
  Copy,
  Check,
  Search,
  ChevronRight,
  Package,
  Settings,
  Link,
  Cpu,
  Activity,
  Cloud,
  Download,
  Rocket,
  Network,
  GitPullRequest
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import { useToast } from '@/hooks/use-toast';
import { getDocsByCategory, DocMetadata } from '@/lib/docRegistry';

const Documentation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Command copied successfully',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const categorizedDocs = getDocsByCategory();
  
  // Filter docs based on search
  const filteredCategorizedDocs = React.useMemo(() => {
    if (!searchQuery.trim()) return categorizedDocs;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, DocMetadata[]> = {};
    
    Object.entries(categorizedDocs).forEach(([category, docs]) => {
      const matchingDocs = docs.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        doc.filename.toLowerCase().includes(query)
      );
      
      if (matchingDocs.length > 0) {
        filtered[category] = matchingDocs;
      }
    });
    
    return filtered;
  }, [categorizedDocs, searchQuery]);
  
  const totalResults = Object.values(filteredCategorizedDocs).reduce((acc, docs) => acc + docs.length, 0);
  
  const iconMap: Record<string, typeof BookOpen> = {
    BookOpen, Terminal, Code, Server, Shield, Package, Settings,
    Link, Cpu, Activity, Cloud, Download, Rocket, Network, GitPullRequest
  };

  const getCategoryIcon = (category: string) => {
    const iconMapping: Record<string, typeof BookOpen> = {
      'Getting Started': BookOpen,
      'API Documentation': Code,
      'Agent Setup': Terminal,
      'Features': Package,
      'Advanced': Cpu,
      'Community': GitPullRequest,
    };
    return iconMapping[category] || BookOpen;
  };

  const handleDocClick = (doc: DocMetadata) => {
    const slug = doc.filename.replace('.md', '').toLowerCase();
    navigate(`/docs/${slug}`);
  };
  
  const popularDocs = [
    { title: 'Quick Start Guide', slug: 'quickstart' },
    { title: 'Agent Installation', slug: 'installation' },
    { title: 'API Reference', slug: 'api_reference' },
    { title: 'Configuration Guide', slug: 'configuration' },
    { title: 'Proxmox Integration', slug: 'proxmox' },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="text-muted-foreground mt-2">
                Learn how to install, configure, and use our Linux Agents API.
              </p>
            </div>
            

            <div className="relative max-w-2xl mx-auto mb-10">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-4 rounded-xl bg-muted/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {totalResults} {totalResults === 1 ? 'result' : 'results'}
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            
            {/* Documentation Categories */}
            {totalResults === 0 && searchQuery ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try searching with different keywords or browse all documentation below.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-8 mb-12">
                {Object.entries(filteredCategorizedDocs).map(([category, docs], categoryIndex) => {
                const CategoryIcon = getCategoryIcon(category);
                const docsCount = docs.length;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * categoryIndex, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">{category}</h2>
                      <span className="text-sm text-muted-foreground">({docsCount} {docsCount === 1 ? 'article' : 'articles'})</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {docs.map((doc, docIndex) => {
                        const DocIcon = doc.icon && iconMap[doc.icon] ? iconMap[doc.icon] : BookOpen;
                        
                        return (
                          <motion.div
                            key={doc.filename}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * docIndex, duration: 0.3 }}
                            onClick={() => handleDocClick(doc)}
                            className="cursor-pointer"
                          >
                            <GlassMorphicCard 
                              className="h-full" 
                              hoverEffect
                            >
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <DocIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium mb-1 truncate">{doc.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {doc.description}
                                  </p>
                                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="px-2 py-1 rounded bg-muted">
                                      {doc.source === 'nannyapi' ? 'API' : 'Agent'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </GlassMorphicCard>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassMorphicCard>
                  <h2 className="text-xl font-semibold mb-6">Quick Start Guide</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-2">1. Install the Agent</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Run the following command to install the agent on your Linux server:
                      </p>
                      <div className="relative">
                        <div className="bg-sidebar p-3 rounded-md font-mono text-sm text-sidebar-foreground">
                          curl -fsSL https://raw.githubusercontent.com/nannyagent/nannyagent/main/install.sh | sudo bash
                        </div>
                        <button 
                          onClick={() => copyToClipboard('curl -fsSL https://raw.githubusercontent.com/nannyagent/nannyagent/main/install.sh | sudo bash', 0)}
                          className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        >
                          {copiedIndex === 0 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">2. Configure Your Agent</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Edit the configuration file to set your API key and other options:
                      </p>
                      <div className="relative">
                        <div className="bg-sidebar p-3 rounded-md font-mono text-sm text-sidebar-foreground">
                          sudo nano /etc/nannyagent/config.yaml
                        </div>
                        <button 
                          onClick={() => copyToClipboard('sudo nano /etc/nannyagent/config.yaml', 1)}
                          className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        >
                          {copiedIndex === 1 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">3. Start the Agent Service</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Start and enable the agent service to run on system boot:
                      </p>
                      <div className="relative">
                        <div className="bg-sidebar p-3 rounded-md font-mono text-sm text-sidebar-foreground">
                          sudo systemctl enable --now nannyagent
                        </div>
                        <button 
                          onClick={() => copyToClipboard('sudo systemctl enable --now nannyagent', 2)}
                          className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        >
                          {copiedIndex === 2 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">4. Register Your Agent</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Register your agent with the API using device authentication:
                      </p>
                      <div className="relative">
                        <div className="bg-sidebar p-3 rounded-md font-mono text-sm text-sidebar-foreground">
                          nannyagent --register
                        </div>
                        <button 
                          onClick={() => copyToClipboard('nannyagent --register', 3)}
                          className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        >
                          {copiedIndex === 3 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        The agent will provide codes that you enter at <a href="/agents/register" className="text-primary hover:underline">the agent registration page</a>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">5. Verify Connection</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Check if your agent is properly connected:
                      </p>
                      <div className="relative">
                        <div className="bg-sidebar p-3 rounded-md font-mono text-sm text-sidebar-foreground">
                          nannyagent --status
                        </div>
                        <button 
                          onClick={() => copyToClipboard('nannyagent --status', 4)}
                          className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        >
                          {copiedIndex === 4 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => navigate('/docs/quickstart')}
                      className="inline-flex items-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Full Documentation
                    </button>
                  </div>
                </GlassMorphicCard>
              </div>
              
              <div>
                <GlassMorphicCard>
                  <h3 className="font-medium mb-6">Popular Articles</h3>
                  
                  <div className="space-y-4">
                    {popularDocs.map((article, i) => (
                      <button 
                        key={i} 
                        onClick={() => navigate(`/docs/${article.slug}`)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm text-left">{article.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </GlassMorphicCard>
                
                <GlassMorphicCard className="mt-6">
                  <h3 className="font-medium mb-4">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can't find what you're looking for? Our support team is ready to help.
                  </p>
                  <a 
                    href="/contact" 
                    className="inline-flex items-center py-2 px-4 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    Contact Support
                  </a>
                </GlassMorphicCard>
              </div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Documentation;
