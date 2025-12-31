export interface DocMetadata {
  title: string;
  category: string;
  description: string;
  source: 'nannyapi' | 'nannyagent';
  filename: string;
  icon?: string;
  order?: number;
}

export const docRegistry: DocMetadata[] = [
  // NannyAPI Documentation
  {
    title: 'Quick Start Guide',
    category: 'Getting Started',
    description: 'Get NannyAPI running in 5 minutes',
    source: 'nannyapi',
    filename: 'QUICKSTART.md',
    icon: 'BookOpen',
    order: 1,
  },
  {
    title: 'API Installation',
    category: 'Getting Started',
    description: 'Install and configure NannyAPI',
    source: 'nannyapi',
    filename: 'INSTALLATION.md',
    icon: 'Download',
    order: 2,
  },
  {
    title: 'Deployment Guide',
    category: 'Getting Started',
    description: 'Deploy NannyAPI to production',
    source: 'nannyapi',
    filename: 'DEPLOYMENT.md',
    icon: 'Rocket',
    order: 3,
  },
  {
    title: 'API Reference',
    category: 'API Documentation',
    description: 'Complete API endpoint documentation',
    source: 'nannyapi',
    filename: 'API_REFERENCE.md',
    icon: 'Code',
    order: 1,
  },
  {
    title: 'API Architecture',
    category: 'API Documentation',
    description: 'Understanding NannyAPI architecture',
    source: 'nannyapi',
    filename: 'ARCHITECTURE.md',
    icon: 'Network',
    order: 2,
  },
  {
    title: 'Security',
    category: 'API Documentation',
    description: 'Security features and best practices',
    source: 'nannyapi',
    filename: 'SECURITY.md',
    icon: 'Shield',
    order: 3,
  },
  {
    title: 'Patch Management',
    category: 'Features',
    description: 'Automated patch management system',
    source: 'nannyapi',
    filename: 'PATCHING.md',
    icon: 'Package',
    order: 1,
  },
  {
    title: 'Proxmox Integration',
    category: 'Features',
    description: 'Integrate with Proxmox VE',
    source: 'nannyapi',
    filename: 'PROXMOX.md',
    icon: 'Server',
    order: 2,
  },
  {
    title: 'Contributing',
    category: 'Community',
    description: 'Contribute to NannyAPI development',
    source: 'nannyapi',
    filename: 'CONTRIBUTING.md',
    icon: 'GitPullRequest',
    order: 1,
  },
  
  // NannyAgent Documentation
  {
    title: 'Agent Installation',
    category: 'Agent Setup',
    description: 'Install NannyAgent on Linux systems',
    source: 'nannyagent',
    filename: 'INSTALLATION.md',
    icon: 'Terminal',
    order: 1,
  },
  {
    title: 'Agent Configuration',
    category: 'Agent Setup',
    description: 'Configure agent settings and options',
    source: 'nannyagent',
    filename: 'CONFIGURATION.md',
    icon: 'Settings',
    order: 2,
  },
  {
    title: 'API Integration',
    category: 'Agent Setup',
    description: 'Connect agents to NannyAPI',
    source: 'nannyagent',
    filename: 'API_INTEGRATION.md',
    icon: 'Link',
    order: 3,
  },
  {
    title: 'Agent Architecture',
    category: 'Advanced',
    description: 'Deep dive into agent internals',
    source: 'nannyagent',
    filename: 'ARCHITECTURE.md',
    icon: 'Cpu',
    order: 1,
  },
  {
    title: 'eBPF Monitoring',
    category: 'Advanced',
    description: 'Real-time system monitoring with eBPF',
    source: 'nannyagent',
    filename: 'EBPF_MONITORING.md',
    icon: 'Activity',
    order: 2,
  },
  {
    title: 'Proxmox Agent Integration',
    category: 'Advanced',
    description: 'Deploy agents on Proxmox infrastructure',
    source: 'nannyagent',
    filename: 'PROXMOX_INTEGRATION.md',
    icon: 'Cloud',
    order: 3,
  },
];

export const getDocsByCategory = () => {
  const categorized: Record<string, DocMetadata[]> = {};
  
  docRegistry.forEach(doc => {
    if (!categorized[doc.category]) {
      categorized[doc.category] = [];
    }
    categorized[doc.category].push(doc);
  });
  
  // Sort by order within each category
  Object.keys(categorized).forEach(category => {
    categorized[category].sort((a, b) => (a.order || 0) - (b.order || 0));
  });
  
  return categorized;
};

export const getDocBySlug = (slug: string): DocMetadata | undefined => {
  return docRegistry.find(doc => 
    doc.filename.replace('.md', '').toLowerCase() === slug.toLowerCase()
  );
};

export const searchDocs = (query: string): DocMetadata[] => {
  const lowerQuery = query.toLowerCase();
  return docRegistry.filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) ||
    doc.description.toLowerCase().includes(lowerQuery) ||
    doc.category.toLowerCase().includes(lowerQuery)
  );
};
