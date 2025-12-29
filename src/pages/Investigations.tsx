import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Database, Server, Smartphone, Network, Globe, Activity as ActivityIcon, ChevronLeft, ChevronRight, Loader2, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import withAuth from '@/utils/withAuth';
import { getInvestigationsPaginated, formatInvestigationTime, type Investigation, type InvestigationsResponse } from '@/services/investigationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Investigations = () => {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [investigationsData, setInvestigationsData] = useState<InvestigationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchInvestigations = async (page: number) => {
    try {
      setLoading(true);
      setHasError(false);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      );
      
      const dataPromise = getInvestigationsPaginated(page, itemsPerPage);
      
      const data = await Promise.race([dataPromise, timeoutPromise]) as InvestigationsResponse;
      
      // Filter out investigations without episode_id on client side to be safe
      const filteredData = {
        ...data,
        investigations: data.investigations.filter(inv => inv.episode_id && inv.episode_id.trim() !== '')
      };
      
      setInvestigationsData(filteredData);
    } catch (error: any) {
      console.error('Error fetching investigations:', error);
      const errorMsg = error?.message === 'Request timeout' 
        ? 'Request timed out. The server may be slow or unavailable.'
        : 'Failed to load investigations. Please check your connection and try again.';
      setErrorMessage(errorMsg);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchInvestigations(currentPage);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleViewDetails = (investigation: Investigation) => {
    // Always use investigation_id as that's the indexed field in the database
    navigate(`/investigations/${investigation.id}`);
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'high':
        return 'destructive';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getApplicationGroupIcon = (applicationGroup: string) => {
    switch (applicationGroup) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'backend-api':
        return <Server className="h-4 w-4" />;
      case 'mobile-app':
        return <Smartphone className="h-4 w-4" />;
      case 'infrastructure':
        return <Network className="h-4 w-4" />;
      case 'web-app':
        return <Globe className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 py-6 pb-8 max-w-full overflow-x-hidden">
              {hasError && (
                <ErrorBanner 
                  message={errorMessage}
                  onDismiss={() => setHasError(false)}
                />
              )}
              
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investigations</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  View all system investigations, diagnostic reports, and analysis results.
                </p>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <>
                  <GlassMorphicCard>
                  <div className="space-y-4">
                    {investigationsData?.investigations && investigationsData.investigations.length > 0 ? (
                      investigationsData.investigations.map((investigation: Investigation) => (
                        <motion.div
                          key={investigation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >                          
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{investigation.user_prompt || 'No prompt'}</h3>
                                <div className="flex flex-col gap-1 mt-1">
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold">ID:</span> {investigation.id}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold">Episode:</span> {investigation.episode_id || 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold">Agent:</span> {investigation.agent?.hostname || investigation.agent_id}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                <div className="flex space-x-2">
                                  <Badge variant={getPriorityBadgeVariant(investigation.priority)}>
                                    {investigation.priority}
                                  </Badge>
                                  <Badge variant={getStatusBadgeVariant(investigation.status)}>
                                    {investigation.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatInvestigationTime(investigation.initiated_at)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(investigation)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Agent: {investigation.agent?.id || 'N/A'}</span>
                              {investigation.inference_count !== undefined && (
                                <span>Inferences: {investigation.inference_count}</span>
                              )}
                              <span>Episode: {investigation.episode_id?.substring(0, 8)}...</span>
                            </div>
                            
                            {investigation.resolution_plan && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {investigation.resolution_plan}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">No investigations found</h3>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Check back later for investigation results.
                        </p>
                      </div>
                    )}
                  </div>
                </GlassMorphicCard>

                {/* Pagination */}
                {investigationsData?.pagination && investigationsData.pagination.total_pages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {investigationsData.investigations.length} of {investigationsData.pagination.total} investigations
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!investigationsData.pagination.has_prev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, investigationsData.pagination.total_pages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!investigationsData.pagination.has_next}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TransitionWrapper>
      </div>
      </div>
      <Footer />
    </div>
  );
};

const InvestigationsPage = withAuth(Investigations);
export default InvestigationsPage;