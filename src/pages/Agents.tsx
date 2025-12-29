
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import withAuth from '@/utils/withAuth';
import {
  Server,
  Plus,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Search,
  Clock,
  Eye,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Monitor,
  Zap,
  Trash2,
  Key,
  Globe,
  Folder,
  Calendar,
  Network,
  ShieldCheck,
  AlertTriangle,
  Info,
  Tag,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAgentsPaginated, getAgentDetails, getAgentRealTimeStatus, type AgentWithRelations } from '@/services/agentService';
import { deleteAgent } from '@/services/agentManagementService';
import AgentDeleteDialog from '@/components/AgentDeleteDialog';
import CreateInvestigationDialog from '@/components/CreateInvestigationDialog';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/services/authService';

// Helper function to format JSON data
const formatJsonData = (data: any): string => {
  if (!data) return 'N/A';
  if (typeof data === 'string') return data;
  return JSON.stringify(data, null, 2);
};

const Agents = () => {
  const [agents, setAgents] = useState<AgentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  
  // Delete dialog state
  const [agentToDelete, setAgentToDelete] = useState<AgentWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  
  // Agent details dialog state
  const [agentDetailsDialogOpen, setAgentDetailsDialogOpen] = useState(false);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<AgentWithRelations | null>(null);
  
  // Investigation dialog state
  const [investigationDialogOpen, setInvestigationDialogOpen] = useState(false);
  const [selectedAgentForInvestigation, setSelectedAgentForInvestigation] = useState<AgentWithRelations | null>(null);
  
  // Real-time status updates
  const [lastStatusUpdate, setLastStatusUpdate] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { toast } = useToast();
  const pageSize = 10;

  const loadAgents = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setHasError(false);
    
    try {
      const result = await getAgentsPaginated(currentPage, pageSize, statusFilter);
      setAgents(result.agents);
      setTotalPages(result.totalPages);
      setLastStatusUpdate(Date.now());
      
      if (isManualRefresh) {
        toast({
          title: "Agents refreshed",
          description: "Agent data has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setHasError(true);
      
      if (isManualRefresh) {
        toast({
          title: "Refresh failed",
          description: "Failed to refresh agent data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, statusFilter, toast]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Get current user session
  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user as any);
      }
    };
    loadCurrentUser();
  }, []);

  const handleManualRefresh = () => {
    loadAgents(true);
  };

  // Filter agents based on search term
  const filteredAgents = searchTerm 
    ? agents.filter(agent => 
        agent.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.primary_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : agents;

  const handleViewDetails = async (agent: AgentWithRelations) => {
    // Fetch detailed data including metrics when user clicks
    const detailedAgent = await getAgentDetails(agent);
    setSelectedAgentForDetails(detailedAgent);
    setAgentDetailsDialogOpen(true);
  };

  const handleDeleteClick = (agent: AgentWithRelations) => {
    // Don't allow new delete operations while one is in progress
    if (deletingAgentId) return;
    
    setAgentToDelete(agent);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;
    
    setDeletingAgentId(agentToDelete.id);
    
    try {
      const result = await deleteAgent(agentToDelete.id);      // Always close dialogs first
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
      
      if (result.success) {
        // Show success message
        toast({
          title: "Agent Deleted",
          description: `${result.agent_name || 'Agent'} deleted successfully.`,
        });
        
        // Simply reload the agents to get fresh state
        loadAgents();
      } else {
        // Show error message
        toast({
          title: "Deletion Failed",
          description: result.message || "Failed to delete agent.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Close dialogs
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingAgentId(null);
    }
  };

  const handleInvestigationClick = (agent: AgentWithRelations) => {
    setSelectedAgentForInvestigation(agent);
    setInvestigationDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper className="flex-1 p-4 sm:p-6">
            <div className="container pb-8 max-w-full overflow-x-hidden">
              {hasError && (
                <ErrorBanner 
                  message="There was an issue loading your agents. Some data may not be current."
                  onDismiss={() => setHasError(false)}
                />
              )}
              
              {/* Header section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agents</h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Manage and monitor your Linux agent deployments.
                  </p>
                </div>
                
                <button 
                  className="flex items-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm sm:text-base whitespace-nowrap"
                  onClick={() => window.location.href = '/agents/register'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register Agent
                </button>
            </div>
            
            {/* Status Filter and Search section */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Show:</span>
                <div className="flex items-center bg-muted/30 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setStatusFilter('active');
                      setCurrentPage(1);
                    }}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      statusFilter === 'active' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Active Only
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setCurrentPage(1);
                    }}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      statusFilter === 'all' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    All Agents
                  </button>
                </div>
                
                {statusFilter === 'all' && (
                  <div className="flex items-center text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-md ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Including pending agents
                  </div>
                )}
              </div>

              {/* Search and additional filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Last: {new Date(lastStatusUpdate).toLocaleTimeString()}</span>
                  </div>
                  <button 
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center py-2 px-3 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button className="flex items-center py-2 px-3 border border-border rounded-md hover:bg-muted/50 transition-colors whitespace-nowrap">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <span className="text-sm hidden sm:inline">Sort</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Agents list */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-muted/50 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No {statusFilter === 'active' ? 'active ' : ''}agents found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {statusFilter === 'active' 
                      ? 'Try switching to "All Agents" to see pending agents.' 
                      : searchTerm 
                        ? 'Try adjusting your search terms.' 
                        : 'Register your first agent to get started.'
                    }
                  </p>
                  {statusFilter === 'active' && (
                    <button 
                      onClick={() => setStatusFilter('all')}
                      className="text-sm text-primary hover:underline"
                    >
                      Show all agents
                    </button>
                  )}
                </div>
              ) : (
                filteredAgents.map((agent, i) => {
                  const lastMetric = agent.lastMetric;
                  const osInfoString = `${agent.os_info || ''} ${agent.os_version || ''}`.trim();
                  
                  // Get real-time status
                  const realTimeStatus = getAgentRealTimeStatus(agent);
                  const isAgentActive = realTimeStatus === 'active';
                  
                  return (
                    <motion.div
                      key={agent.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                    >
                      <GlassMorphicCard className="p-6 hover:shadow-lg transition-all">
                        {/* Main agent info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              isAgentActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              <Server className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{agent.hostname || 'Unnamed Agent'}</h3>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>ID: {agent.id.substring(0, 8)}...</span>
                                {agent.primary_ip && (
                                  <span className="flex items-center">
                                    <Globe className="h-3 w-3 mr-1" />
                                    {agent.primary_ip}
                                  </span>
                                )}
                                {agent.last_seen && (
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(agent.last_seen).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isAgentActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isAgentActive ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              )}
                              <span className="capitalize">{isAgentActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewDetails(agent)}
                                className="h-8 px-2 text-xs"
                              >
                                <Activity className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => window.location.href = `/agents/${agent.id}/proxmox`}
                                className="h-8 px-2 text-xs text-orange-600 hover:text-orange-700"
                                title="View Proxmox Cluster Details"
                              >
                                <Server className="h-3 w-3 mr-1" />
                                Proxmox
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => window.location.href = `/patch-management/${agent.id}`}
                                className="h-8 px-2 text-xs text-green-600 hover:text-green-700"
                                title="View patch management and vulnerabilities"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Patches
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleInvestigationClick(agent)}
                                disabled={!isAgentActive}
                                className={`h-8 px-2 text-xs ${
                                  isAgentActive 
                                    ? 'text-blue-600 hover:text-blue-700' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                title={isAgentActive ? 'Start diagnostic investigation' : 'Agent must be active to run investigations'}
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Investigate
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteClick(agent)}
                                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                          {/* System Info */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">System</h4>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Monitor className="h-3 w-3 mr-2 text-muted-foreground" />
                                <span>{osInfoString || 'Unknown OS'}</span>
                              </div>
                              {agent.kernel_version && (
                                <div className="flex items-center text-sm">
                                  <Cpu className="h-3 w-3 mr-2 text-muted-foreground" />
                                  <span>Kernel: {agent.kernel_version}</span>
                                </div>
                              )}
                              {agent.version && (
                                <div className="flex items-center text-sm">
                                  <Zap className="h-3 w-3 mr-2 text-muted-foreground" />
                                  <span>Agent v{agent.version}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          {lastMetric && (
                            <>
                              <div className="space-y-2">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CPU</h4>
                                <div className="flex items-center">
                                  <Cpu className="h-3 w-3 mr-2 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {lastMetric.cpu_percent ? `${Number(lastMetric.cpu_percent).toFixed(1)}%` : 'N/A'}
                                  </span>
                                </div>
                                {lastMetric.load_avg_1min !== undefined && (
                                  <div className="text-xs text-muted-foreground">
                                    Load: {Number(lastMetric.load_avg_1min).toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Memory</h4>
                                <div className="flex items-center">
                                  <MemoryStick className="h-3 w-3 mr-2 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {lastMetric.memory_percent ? `${Number(lastMetric.memory_percent).toFixed(1)}%` : 'N/A'}
                                  </span>
                                </div>
                                {lastMetric.disk_usage_percent !== undefined && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <HardDrive className="h-3 w-3 mr-1" />
                                    Disk: {Number(lastMetric.disk_usage_percent).toFixed(1)}%
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Network</h4>
                                <div className="space-y-1">

                                  {(lastMetric.network_in_gb !== undefined || lastMetric.network_out_gb !== undefined) && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Wifi className="h-3 w-3 mr-1" />
                                      {lastMetric.network_in_gb !== undefined && `↓${Number(lastMetric.network_in_gb).toFixed(2)} GB`}
                                      {lastMetric.network_out_gb !== undefined && ` ↑${Number(lastMetric.network_out_gb).toFixed(2)} GB`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* No metrics case */}
                          {!lastMetric && (
                            <div className="col-span-3 flex items-center justify-center py-4 text-muted-foreground">
                              <Activity className="h-4 w-4 mr-2" />
                              <span className="text-sm">No metrics data available</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end pt-4 border-t border-border/40">
                          <button 
                            className="py-2 px-4 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center"
                            onClick={() => handleViewDetails(agent)}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </GlassMorphicCard>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </TransitionWrapper>
      </div>

      {/* Delete confirmation dialog */}
      <AgentDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        agentName={agentToDelete?.hostname || 'Unknown Agent'}
        onConfirm={handleDeleteConfirm}
        isDeleting={!!deletingAgentId}
      />

      {/* Agent details dialog */}
      <Dialog open={agentDetailsDialogOpen} onOpenChange={setAgentDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agent Details - {selectedAgentForDetails?.hostname}</DialogTitle>
            <DialogDescription>
              Detailed system information and metrics for this agent
            </DialogDescription>
          </DialogHeader>
          
          {selectedAgentForDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Agent Name</span>
                    </div>
                    <p className="text-sm font-semibold">{selectedAgentForDetails.hostname || 'Unnamed Agent'}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAgentForDetails.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-sm capitalize">{selectedAgentForDetails.status}</span>
                    </div>
                  </div>

                  {selectedAgentForDetails.id && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Key className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Fingerprint</span>
                      </div>
                      <p className="font-mono text-xs break-all">{selectedAgentForDetails.id}</p>
                    </div>
                  )}

                  {selectedAgentForDetails.primary_ip && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium">IP Address</span>
                      </div>
                      <p className="text-sm font-mono">{selectedAgentForDetails.primary_ip}</p>
                    </div>
                  )}




                </div>
              </div>

              {/* System Information */}
              {selectedAgentForDetails.lastMetric && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">System Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Operating System</span>
                      </div>
                      <p className="text-sm">{(selectedAgentForDetails.os_info + ' ' + selectedAgentForDetails.os_version) || 'Unknown'}</p>
                      {selectedAgentForDetails.arch && (
                        <p className="text-xs text-gray-500">{selectedAgentForDetails.arch}</p>
                      )}
                    </div>

                    {(selectedAgentForDetails.kernel_version) && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Kernel Version</span>
                        </div>
                        <p className="text-sm">{selectedAgentForDetails.kernel_version}</p>
                      </div>
                    )}

                    {(selectedAgentForDetails.version) && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Server className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Agent Version</span>
                        </div>
                        <p className="text-sm">{selectedAgentForDetails.version}</p>
                      </div>
                    )}

                    {(selectedAgentForDetails.platform_family) && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Server className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Platform Family</span>
                        </div>
                        <p className="text-sm">{selectedAgentForDetails.platform_family}</p>
                      </div>
                    )}


                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {selectedAgentForDetails.lastMetric && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedAgentForDetails.lastMetric.load_avg_1min !== undefined && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Load Average</span>
                        </div>
                        <p className="text-sm">
                          {selectedAgentForDetails.lastMetric.load_avg_1min?.toFixed(2)} / {selectedAgentForDetails.lastMetric.load_avg_5min?.toFixed(2)} / {selectedAgentForDetails.lastMetric.load_avg_15min?.toFixed(2)}
                        </p>
                      </div>
                    )}

                     <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Cpu className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">CPU Cores</span>
                      </div>
                      <p className="text-sm font-semibold">{selectedAgentForDetails.lastMetric.cpu_cores}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Cpu className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <p className="text-sm font-semibold">{selectedAgentForDetails.lastMetric.cpu_percent?.toFixed(1)}%</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MemoryStick className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Memory Total Size</span>
                      </div>
                      <p className="text-sm font-semibold">{(selectedAgentForDetails.lastMetric.memory_total_gb)} GB</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MemoryStick className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Memory Used Size</span>
                      </div>
                      <p className="text-sm font-semibold">{(selectedAgentForDetails.lastMetric.memory_used_gb)} GB</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MemoryStick className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <p className="text-sm font-semibold">{(selectedAgentForDetails.lastMetric.memory_percent)}%</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Disk Total Size</span>
                      </div>
                      <p className="text-sm font-semibold">{(selectedAgentForDetails.lastMetric.disk_total_gb)} GB</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Disk Used Size</span>
                      </div>
                      <p className="text-sm font-semibold">{(selectedAgentForDetails.lastMetric.disk_used_gb)} GB</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Disk Usage</span>
                      </div>
                      <p className="text-sm font-semibold">{selectedAgentForDetails.lastMetric.disk_usage_percent?.toFixed(1)}%</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Network className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Ingress</span>
                      </div>
                      <p className="text-sm font-semibold">{selectedAgentForDetails.lastMetric.network_in_gb} GB</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Network className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Egress</span>
                      </div>
                      <p className="text-sm font-semibold">{selectedAgentForDetails.lastMetric.network_out_gb} GB</p>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Timestamps</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedAgentForDetails.created_at && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Created</span>
                      </div>
                      <p className="text-sm">{new Date(selectedAgentForDetails.created_at).toLocaleString()}</p>
                    </div>
                  )}

                  {selectedAgentForDetails.last_seen && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Last Seen</span>
                      </div>
                      <p className="text-sm">{new Date(selectedAgentForDetails.last_seen).toLocaleString()}</p>
                    </div>
                  )}


                </div>
              </div>

              {/* Storage & Filesystem Information */}
              {selectedAgentForDetails.lastMetric?.filesystems && Array.isArray(selectedAgentForDetails.lastMetric.filesystems) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Filesystem Information</h3>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {selectedAgentForDetails.lastMetric.filesystems.slice(0, 10).map((fs: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">{fs.mount_path || 'Unknown'}</span>
                          </div>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">{fs.fstype}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Used:</span> {fs.used_gb} GiB
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span> {fs.total_gb} GiB
                          </div>
                          <div>
                            <span className="text-gray-500">Free:</span> {fs.free_gb} GiB
                          </div>
                          <div>
                            <span className="text-gray-500">Usage:</span> {fs.usage_percent?.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Statistics */}






              {/* Metadata Information */}
              {selectedAgentForDetails.metadata && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Additional Data</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Agent Metadata</span>
                      </div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {formatJsonData(selectedAgentForDetails.metadata)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Investigation dialog */}
      {selectedAgentForInvestigation && currentUser && (
        <CreateInvestigationDialog
          open={investigationDialogOpen}
          onOpenChange={setInvestigationDialogOpen}
          agentId={selectedAgentForInvestigation.id}
          agentName={selectedAgentForInvestigation.hostname || 'Unknown Agent'}
          isAgentActive={getAgentRealTimeStatus(selectedAgentForInvestigation) === 'active'}
          userId={currentUser.id}
        />
      )}
      </div>
      <Footer />
    </div>
  );
};

const AgentsPage = withAuth(Agents);
export default AgentsPage;
