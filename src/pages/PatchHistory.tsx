import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Activity
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
  const [executions, setExecutions] = useState<PatchExecutionWithAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const data = await listAllPatchExecutions(500);
      setExecutions(data);
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const total = executions.length;
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const running = executions.filter(e => e.status === 'running').length;
    const pending = executions.filter(e => e.status === 'pending').length;
    const uniqueAgents = new Set(executions.map(e => e.agent_id)).size;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, failed, running, pending, uniqueAgents, successRate };
  }, [executions]);

  // Create agent summaries
  const agentSummaries = useMemo(() => {
    const summaryMap = new Map<string, AgentSummary>();

    executions.forEach(exec => {
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
  }, [executions, statusFilter, searchQuery]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBg = (rate: number) => {
    if (rate >= 90) return 'bg-green-600';
    if (rate >= 70) return 'bg-yellow-600';
    return 'bg-red-600';
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
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                      <Shield className="h-8 w-8 text-primary" />
                      Patch History
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      Overview of patch operations across all agents
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

              {/* Agent Cards Grid */}
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
            </div>
          </TransitionWrapper>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default withAuth(PatchHistory);
