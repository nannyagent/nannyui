
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Terminal, 
  Code, 
  Server, 
  Shield,
  Copy,
  ExternalLink,
  Search,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';

const Documentation = () => {
  const categories = [
    { title: 'Getting Started', icon: BookOpen, count: 5 },
    { title: 'API Reference', icon: Code, count: 12 },
    { title: 'Agent Installation', icon: Server, count: 3 },
    { title: 'CLI Commands', icon: Terminal, count: 8 },
    { title: 'Security', icon: Shield, count: 4 },
  ];
  
  const popularArticles = [
    'Agent Installation Guide',
    'Authentication and API Keys',
    'API Request Rate Limits',
    'Monitoring Your Agents',
    'Troubleshooting Common Issues',
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
                className="w-full h-14 pl-14 pr-4 rounded-xl bg-muted/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ K</kbd>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories.map((category, i) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                >
                  <GlassMorphicCard className="h-full" hoverEffect>
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">{category.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.count} articles
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <a href="#" className="flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors">
                        <span>Browse {category.title}</span>
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </GlassMorphicCard>
                </motion.div>
              ))}
            </div>
            
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
                          curl -sSL https://download.nannyai.dev/install.sh | sudo bash
                        </div>
                        <button className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
                          <Copy className="h-4 w-4" />
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
                        <button className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
                          <Copy className="h-4 w-4" />
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
                        <button className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
                          <Copy className="h-4 w-4" />
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
                          nannyagent register
                        </div>
                        <button className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
                          <Copy className="h-4 w-4" />
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
                          nannyagent status
                        </div>
                        <button className="absolute top-2 right-2 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <a href="#" className="inline-flex items-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Full Documentation
                    </a>
                  </div>
                </GlassMorphicCard>
              </div>
              
              <div>
                <GlassMorphicCard>
                  <h3 className="font-medium mb-6">Popular Articles</h3>
                  
                  <div className="space-y-4">
                    {popularArticles.map((article, i) => (
                      <a 
                        key={i} 
                        href="#" 
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm">{article}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
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
