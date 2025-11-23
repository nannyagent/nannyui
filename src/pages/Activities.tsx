import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Key, Users, Activity as ActivityIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import withAuth from '@/utils/withAuth';
import { getActivitiesPaginated, getActivityIcon, formatActivityTime, type Activity, type ActivitiesResponse } from '@/services/activityService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Activities = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activitiesData, setActivitiesData] = useState<ActivitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 10;

  const fetchActivities = async (page: number, currentFilter: string) => {
    try {
      setLoading(true);
      const data = await getActivitiesPaginated(page, itemsPerPage, currentFilter);
      setActivitiesData(data);
      setHasError(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setErrorMessage('Failed to load activities. Please try again.');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(currentPage, filter);
  }, [currentPage, filter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getActivityTypeIcon = (activityType: string) => {
    const iconName = getActivityIcon(activityType);
    switch (iconName) {
      case 'Server':
        return <Server className="h-4 w-4" />;
      case 'Key':
        return <Key className="h-4 w-4" />;
      case 'Users':
        return <Users className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
    return `${(durationMs / 60000).toFixed(1)}m`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper className="flex-1 p-6">
            <div className="container pb-8">
              {hasError && (
                <ErrorBanner 
                  message={errorMessage}
                  onDismiss={() => setHasError(false)}
                />
              )}
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
                <p className="text-muted-foreground mt-2">
                  View all system activities, agent interactions, and user events.
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="mb-6 flex flex-wrap gap-2">
                {['all', 'data_sync', 'token_generated', 'session_started', 'websocket_connected'].map((filterOption) => (
                  <Button
                    key={filterOption}
                    variant={filter === filterOption ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(filterOption)}
                >
                  {filterOption.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : (
              <>
                <GlassMorphicCard>
                  <div className="space-y-4">
                    {activitiesData?.activities && activitiesData.activities.length > 0 ? (
                      activitiesData.activities.map((activity: Activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                            {getActivityTypeIcon(activity.activity_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{activity.summary}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Activity Type: {activity.activity_type.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Agent ID: {activity.agent_id}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                <Badge variant={getStatusBadgeVariant(activity.metadata?.status)}>
                                  {activity.metadata?.status || 'unknown'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatActivityTime(activity.created_at)}
                                </span>
                              </div>
                            </div>
                            
                            {activity.metadata && (
                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {activity.metadata.ip_address && (
                                  <span>IP: {activity.metadata.ip_address}</span>
                                )}
                                {activity.metadata.device_type && (
                                  <span>Device: {activity.metadata.device_type}</span>
                                )}
                                {activity.metadata.duration_ms && (
                                  <span>Duration: {formatDuration(activity.metadata.duration_ms)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <ActivityIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">No activities found</h3>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Try adjusting your filter or check back later.
                        </p>
                      </div>
                    )}
                  </div>
                </GlassMorphicCard>

                {/* Pagination */}
                {activitiesData?.pagination && activitiesData.pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {activitiesData.activities.length} of {activitiesData.pagination.total} activities
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!activitiesData.pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, activitiesData.pagination.totalPages) }, (_, i) => {
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
                        disabled={!activitiesData.pagination.hasNext}
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

const ActivitiesPage = withAuth(Activities);
export default ActivitiesPage;