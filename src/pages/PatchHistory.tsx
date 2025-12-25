import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import withAuth from '@/utils/withAuth';
import {
  Shield,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  ChevronRight,
  Search,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Activity,
  ChevronLeft,
  Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listAllPatchExecutions, type PatchExecution } from '@/services/patchManagementService';
import { Progress } from '@/components/ui/progress';

interface PatchExecutionWithAgent extends PatchExecution {
  agent_name?: string;
}

interface AgentSummary {
  agentId: string;
  agentName: string;
  totalExecutions: number;
  completedCount: number;
  failedCount: number;
  runningCount: number;
  pendingCount: number;
  lastExecutionAt: string | null;
  successRate: number;
}

const PatchHistory = () => {
  const { agentId } = useParams<{ agentId?: string }>();
  const [executions, setExecutions] = useState<PatchExecutionWithAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadExecutions();
    setCurrentPage(1);
  }, [agentId]);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const { executions } = await listAllPatchExecutions(1, 100);
      setExecutions(executions);
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    let filtered = executions;
    
    // Filter by agent if agentId is provided
    if (agentId) {
      filtered = filtered.filter(e => e.agent_id === agentId);
    }
    
    const total = filtered.length;
    const completed = filtered.filter(e => e.status === 'completed').length;
    const failed = filtered.filter(e => e.status === 'failed').length;
    const running = filtered.filter(e => e.status === 'running').length;
    const pending = filtered.filter(e => e.status === 'pending').length;
    const uniqueAgents = new Set(filtered.map(e => e.agent_id)).size;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, failed, running, pending, uniqueAgents, successRate };
  }, [executions, agentId]);

  // Create agent summaries
  const agentSummaries = useMemo(() => {
    let source = executions;
    
    // Filter by agent if agentId is provided
    if (agentId) {
      source = source.filter(e => e.agent_id === agentId);
    }
    
    const summaryMap = new Map<string, AgentSummary>();

    source.forEach(exec => {
      if (!summaryMap.has(exec.agent_id)) {
        summaryMap.set(exec.agent_id, {
          agentId: exec.agent_id,
          agentName: exec.agent_name || `Agent ${exec.agent_id.substring(0, 8)}`,
          totalExecutions: 0,
          completedCount: 0,
          failedCount: 0,
          runningCount: 0,
          pendingCount: 0,
          lastExecutionAt: null,
          successRate: 0
        });
      }

      const summary = summaryMap.get(exec.agent_id)!;
      summary.totalExecutions++;
      
      if (exec.status === 'completed') summary.completedCount++;
      if (exec.status === 'failed') summary.failedCount++;
      if (exec.status === 'running') summary.runningCount++;
      if (exec.status === 'pending') summary.pendingCount++;

      const execDate = exec.started_at ? new Date(exec.started_at).getTime() : 0;
      const lastDate = summary.lastExecutionAt ? new Date(summary.lastExecutionAt).getTime() : 0;
      if (execDate > lastDate) {
        summary.lastExecutionAt = exec.started_at;
      }
    });

    // Calculate success rates
    summaryMap.forEach(summary => {
      const finishedCount = summary.completedCount + summary.failedCount;
      summary.successRate = finishedCount > 0 ? Math.round((summary.completedCount / finishedCount) * 100) : 0;
    });

    let summaries = Array.from(summaryMap.values());

    // Apply filters
    if (statusFilter !== 'all') {
      summaries = summaries.filter(s => {
        switch (statusFilter) {
          case 'completed': return s.completedCount > 0;
          case 'failed': return s.failedCount > 0;
          case 'running': return s.runningCount > 0;
          case 'pending': return s.pendingCount > 0;
          default: return true;
        }
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      summaries = summaries.filter(s => 
        s.agentName.toLowerCase().includes(query) ||
        s.agentId.toLowerCase().includes(query)
      );
    }

    // Sort by last execution date
    summaries.sort((a, b) => {
      const dateA = a.lastExecutionAt ? new Date(a.lastExecutionAt).getTime() : 0;
      const dateB = b.lastExecutionAt ? new Date(b.lastExecutionAt).getTime() : 0;
      return dateB - dateA;
    });

    return summaries;
  }, [executions, statusFilter, searchQuery, agentId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Paginated executions when viewing single agent
  const paginatedExecutions = useMemo(() => {
    let filtered = executions;
    
    // Filter by agent if agentId is provided
    if (agentId) {
      filtered = filtered.filter(e => e.agent_id === agentId);
    }
    
    // Sort by date descending (newest first)
    filtered.sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return dateB - dateA;
    });
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      items: paginatedItems,
      total: filtered.length,
      totalPages,
      currentPage
    };
  }, [executions, agentId, currentPage, itemsPerPage]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading patch history...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          
          <TransitionWrapper className="flex-1 overflow-y-auto">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {agentId && (
                        <Link to="/patch-history">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        {agentId ? 'Patch Execution History' : 'Patch History'}
                      </h1>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      {agentId 
                        ? 'Detailed execution history for this agent'
                        : 'Overview of patch operations across all agents'}
                    </p>
                  </div>
                  <Button onClick={loadExecutions} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Metrics Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                >
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{overallMetrics.total}</p>
                      <p className="text-xs text-muted-foreground">Total Executions</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{overallMetrics.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-600">{overallMetrics.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <Activity className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{overallMetrics.running + overallMetrics.pending}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <Server className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{overallMetrics.uniqueAgents}</p>
                      <p className="text-xs text-muted-foreground">Agents</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className={`text-2xl font-bold ${getSuccessRateColor(overallMetrics.successRate)}`}>
                        {overallMetrics.successRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Agent Cards Grid or Execution List */}
              {agentId ? (
                // Single Agent Execution History with Pagination
                <>
                  {paginatedExecutions.total === 0 ? (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No patch executions found</p>
                          <p className="text-sm mt-2">No patch operations have been executed for this agent</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Execution History ({paginatedExecutions.total} total)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {paginatedExecutions.items.map((execution, idx) => (
                              <motion.div
                                key={execution.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <Link to={`/patch-execution/${execution.id}`}>
                                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4 flex-1">
                                      <Badge variant={
                                        execution.status === 'completed' ? 'default' :
                                        execution.status === 'failed' ? 'destructive' :
                                        'secondary'
                                      } className={
                                        execution.status === 'completed' ? 'bg-green-600' : ''
                                      }>
                                        {execution.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {execution.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                        {execution.status === 'running' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                        {execution.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                        {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {execution.mode === 'dry-run' ? 'dry-run' : 
                                         execution.mode === 'apply' ? 'apply' : 
                                         execution.mode === 'rollback' ? 'Rollback' : execution.mode}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(execution.created)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {execution.completed_at && (
                                        <span className="text-xs text-muted-foreground hidden sm:inline">
                                          {(() => {
                                            if (!execution.created || isNaN(Date.parse(execution.created))) {
                                              return 'N/A';
                                            } 
                                            const seconds = Math.floor((new Date(execution.completed_at).getTime() - new Date(execution.created).getTime()) / 1000);
                                            if (seconds < 60) return `${seconds}s`;
                                            return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
                                          })()}
                                        </span>
                                      )}
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pagination Controls */}
                      {paginatedExecutions.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <div className="text-sm text-muted-foreground">
                            Page {paginatedExecutions.currentPage} of {paginatedExecutions.totalPages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(paginatedExecutions.totalPages, currentPage + 1))}
                              disabled={currentPage === paginatedExecutions.totalPages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                // All Agents Grid View
                <>
                  {/* Filters */}
                  <Card className="mb-6">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search agents..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Agents</SelectItem>
                            <SelectItem value="completed">Has Completed</SelectItem>
                            <SelectItem value="failed">Has Failed</SelectItem>
                            <SelectItem value="running">Has Running</SelectItem>
                            <SelectItem value="pending">Has Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {agentSummaries.length === 0 ? (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No patch executions found</p>
                          <p className="text-sm mt-2">
                            {searchQuery || statusFilter !== 'all' 
                              ? 'Try adjusting your filters'
                              : 'Patch operations will appear here once executed'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {agentSummaries.map((summary, idx) => (
                        <motion.div
                          key={summary.agentId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <Link to={`/patch-management/${summary.agentId}`}>
                            <Card className="hover:border-primary/50 transition-all cursor-pointer group h-full">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                      <Server className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-base">{summary.agentName}</CardTitle>
                                      <CardDescription className="text-xs">
                                        {summary.totalExecutions} execution{summary.totalExecutions !== 1 ? 's' : ''}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {/* Success Rate Bar */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-muted-foreground">Success Rate</span>
                                    <span className={`text-sm font-semibold ${getSuccessRateColor(summary.successRate)}`}>
                                      {summary.successRate}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={summary.successRate} 
                                    className="h-2"
                                  />
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {summary.completedCount > 0 && (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      {summary.completedCount}
                                    </Badge>
                                  )}
                                  {summary.failedCount > 0 && (
                                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      {summary.failedCount}
                                    </Badge>
                                  )}
                                  {summary.runningCount > 0 && (
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      {summary.runningCount}
                                    </Badge>
                                  )}
                                  {summary.pendingCount > 0 && (
                                    <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {summary.pendingCount}
                                    </Badge>
                                  )}
                                </div>

                                {/* Last Execution */}
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Last: {formatDate(summary.lastExecutionAt)}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TransitionWrapper>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default withAuth(PatchHistory);
