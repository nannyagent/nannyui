import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import withAuth from '@/utils/withAuth';
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  ChevronRight,
  Search,
  TrendingUp,
  BarChart3,
  Activity,
  ChevronLeft,
  Eye,
  AlertCircle,
  Timer,
  CalendarClock,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Pencil,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  listAllRebootOperations,
  listAllRebootSchedules,
  toggleRebootSchedule,
  deleteRebootSchedule,
  RebootOperation,
  RebootSchedule,
} from '@/services/rebootService';
import { RebootScheduleDialog } from '@/components/RebootScheduleDialog';

interface RebootOperationWithAgent extends RebootOperation {
  agent_name?: string;
  lxc_name?: string;
}

interface RebootScheduleWithAgent extends RebootSchedule {
  agent_name?: string;
  lxc_name?: string;
}

interface AgentSummary {
  agentId: string;
  agentName: string;
  totalReboots: number;
  completedCount: number;
  failedCount: number;
  timeoutCount: number;
  rebootingCount: number;
  pendingCount: number;
  lastRebootAt: string | null;
  successRate: number;
}

const RebootHistory = () => {
  const { agentId } = useParams<{ agentId?: string }>();
  const { toast } = useToast();
  const [operations, setOperations] = useState<RebootOperationWithAgent[]>([]);
  const [schedules, setSchedules] = useState<RebootScheduleWithAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('history');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<RebootScheduleWithAgent | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [agentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [opsResult, schedulesResult] = await Promise.all([
        listAllRebootOperations(1, 100),
        listAllRebootSchedules(1, 100),
      ]);
      setOperations(opsResult.operations);
      setSchedules(schedulesResult.schedules);
    } catch (error) {
      console.error('Error loading reboot data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reboot data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, currentState: boolean) => {
    try {
      const success = await toggleRebootSchedule(scheduleId, !currentState);
      if (success) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === scheduleId ? { ...s, is_active: !currentState } : s))
        );
        toast({
          title: 'Success',
          description: `Schedule ${!currentState ? 'enabled' : 'disabled'}`,
        });
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const success = await deleteRebootSchedule(scheduleId);
      if (success) {
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
        toast({
          title: 'Success',
          description: 'Schedule deleted',
        });
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    let filtered = operations;

    if (agentId) {
      filtered = filtered.filter((e) => e.agent_id === agentId);
    }

    const total = filtered.length;
    const completed = filtered.filter((e) => e.status === 'completed').length;
    const failed = filtered.filter((e) => e.status === 'failed').length;
    const timeout = filtered.filter((e) => e.status === 'timeout').length;
    const rebooting = filtered.filter((e) => e.status === 'rebooting').length;
    const pending = filtered.filter((e) => ['pending', 'sent'].includes(e.status)).length;
    const uniqueAgents = new Set(filtered.map((e) => e.agent_id)).size;
    const finishedTotal = completed + failed + timeout;
    const successRate = finishedTotal > 0 ? Math.round((completed / finishedTotal) * 100) : 0;

    return { total, completed, failed, timeout, rebooting, pending, uniqueAgents, successRate };
  }, [operations, agentId]);

  // Create agent summaries
  const agentSummaries = useMemo(() => {
    let source = operations;

    if (agentId) {
      source = source.filter((e) => e.agent_id === agentId);
    }

    const summaryMap = new Map<string, AgentSummary>();

    source.forEach((op) => {
      if (!summaryMap.has(op.agent_id)) {
        summaryMap.set(op.agent_id, {
          agentId: op.agent_id,
          agentName: op.agent_name || `Agent ${op.agent_id.substring(0, 8)}`,
          totalReboots: 0,
          completedCount: 0,
          failedCount: 0,
          timeoutCount: 0,
          rebootingCount: 0,
          pendingCount: 0,
          lastRebootAt: null,
          successRate: 0,
        });
      }

      const summary = summaryMap.get(op.agent_id)!;
      summary.totalReboots++;

      if (op.status === 'completed') summary.completedCount++;
      if (op.status === 'failed') summary.failedCount++;
      if (op.status === 'timeout') summary.timeoutCount++;
      if (op.status === 'rebooting') summary.rebootingCount++;
      if (['pending', 'sent'].includes(op.status)) summary.pendingCount++;

      const opDate = op.requested_at ? new Date(op.requested_at).getTime() : 0;
      const lastDate = summary.lastRebootAt ? new Date(summary.lastRebootAt).getTime() : 0;
      if (opDate > lastDate) {
        summary.lastRebootAt = op.requested_at;
      }
    });

    // Calculate success rates
    summaryMap.forEach((summary) => {
      const finishedCount = summary.completedCount + summary.failedCount + summary.timeoutCount;
      summary.successRate =
        finishedCount > 0 ? Math.round((summary.completedCount / finishedCount) * 100) : 0;
    });

    let summaries = Array.from(summaryMap.values());

    // Apply filters
    if (statusFilter !== 'all') {
      summaries = summaries.filter((s) => {
        switch (statusFilter) {
          case 'completed':
            return s.completedCount > 0;
          case 'failed':
            return s.failedCount > 0;
          case 'timeout':
            return s.timeoutCount > 0;
          case 'rebooting':
            return s.rebootingCount > 0;
          case 'pending':
            return s.pendingCount > 0;
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      summaries = summaries.filter(
        (s) =>
          s.agentName.toLowerCase().includes(query) || s.agentId.toLowerCase().includes(query)
      );
    }

    // Sort by last reboot date
    summaries.sort((a, b) => {
      const dateA = a.lastRebootAt ? new Date(a.lastRebootAt).getTime() : 0;
      const dateB = b.lastRebootAt ? new Date(b.lastRebootAt).getTime() : 0;
      return dateB - dateA;
    });

    return summaries;
  }, [operations, statusFilter, searchQuery, agentId]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtered and sorted operations (by agent and date)
  const filteredAndSortedOperations = useMemo(() => {
    const filtered = agentId
      ? operations.filter((e) => e.agent_id === agentId)
      : operations;

    // Sort by date descending on a copied array to avoid mutating the original
    return [...filtered].sort((a, b) => {
      const dateA = a.requested_at ? new Date(a.requested_at).getTime() : 0;
      const dateB = b.requested_at ? new Date(b.requested_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [operations, agentId]);

  // Paginated operations
  const paginatedOperations = useMemo(() => {
    const total = filteredAndSortedOperations.length;
    const totalPages = Math.ceil(total / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredAndSortedOperations.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return {
      items: paginatedItems,
      total,
      totalPages,
      currentPage,
    };
  }, [filteredAndSortedOperations, currentPage, itemsPerPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'timeout':
        return (
          <Badge variant="destructive" className="bg-orange-600">
            <Timer className="h-3 w-3 mr-1" />
            Timeout
          </Badge>
        );
      case 'rebooting':
        return (
          <Badge className="bg-yellow-600">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Rebooting
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="secondary">
            <Activity className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
                <p className="text-muted-foreground">Loading reboot history...</p>
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
                        <Link to="/reboot-history">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                        <RefreshCw className="h-8 w-8 text-primary" />
                        {agentId ? 'Reboot History' : 'Reboot Management'}
                      </h1>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      {agentId
                        ? 'Detailed reboot history for this agent'
                        : 'Manage reboots and schedules across all agents'}
                    </p>
                  </div>
                  <Button onClick={loadData} variant="outline">
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
                      <p className="text-xs text-muted-foreground">Total Reboots</p>
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
                      <p className="text-2xl font-bold text-red-600">
                        {overallMetrics.failed + overallMetrics.timeout}
                      </p>
                      <p className="text-xs text-muted-foreground">Failed/Timeout</p>
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
                      <p className="text-2xl font-bold text-yellow-600">
                        {overallMetrics.rebooting + overallMetrics.pending}
                      </p>
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

              {/* Tabs for History and Schedules */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Reboot History
                  </TabsTrigger>
                  <TabsTrigger value="schedules" className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Schedules
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                  {agentId ? (
                    // Single Agent Reboot History
                    <>
                      {paginatedOperations.total === 0 ? (
                        <Card>
                          <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                              <RefreshCw className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">No reboots found</p>
                              <p className="text-sm mt-2">
                                No reboot operations have been executed for this agent
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Reboot History ({paginatedOperations.total} total)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {paginatedOperations.items.map((operation, idx) => (
                                  <motion.div
                                    key={operation.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                  >
                                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center gap-4 flex-1">
                                        {getStatusBadge(operation.status)}
                                        {operation.lxc_name && (
                                          <Badge variant="outline" className="text-xs">
                                            LXC: {operation.lxc_name}
                                          </Badge>
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                          {formatDate(operation.requested_at)}
                                        </span>
                                        {operation.reason && (
                                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {operation.reason}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {operation.completed_at && operation.acknowledged_at && (
                                          <span className="text-xs text-muted-foreground hidden sm:inline">
                                            {(() => {
                                              const seconds = Math.floor(
                                                (new Date(operation.completed_at).getTime() -
                                                  new Date(operation.acknowledged_at).getTime()) /
                                                  1000
                                              );
                                              if (seconds < 60) return `${seconds}s`;
                                              return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
                                            })()}
                                          </span>
                                        )}
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Pagination */}
                          {paginatedOperations.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                              <div className="text-sm text-muted-foreground">
                                Page {paginatedOperations.currentPage} of {paginatedOperations.totalPages}
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
                                  onClick={() =>
                                    setCurrentPage(
                                      Math.min(paginatedOperations.totalPages, currentPage + 1)
                                    )
                                  }
                                  disabled={currentPage === paginatedOperations.totalPages}
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
                                <SelectItem value="timeout">Has Timeout</SelectItem>
                                <SelectItem value="rebooting">Has Rebooting</SelectItem>
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
                              <RefreshCw className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">No reboots found</p>
                              <p className="text-sm mt-2">
                                {searchQuery || statusFilter !== 'all'
                                  ? 'Try adjusting your filters'
                                  : 'Reboot operations will appear here once executed'}
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
                              <Link to={`/reboot-history/${summary.agentId}`}>
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
                                            {summary.totalReboots} reboot
                                            {summary.totalReboots !== 1 ? 's' : ''}
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
                                        <span
                                          className={`text-sm font-semibold ${getSuccessRateColor(
                                            summary.successRate
                                          )}`}
                                        >
                                          {summary.successRate}%
                                        </span>
                                      </div>
                                      <Progress value={summary.successRate} className="h-2" />
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {summary.completedCount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="bg-green-500/10 text-green-600 border-green-500/30"
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          {summary.completedCount}
                                        </Badge>
                                      )}
                                      {summary.failedCount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="bg-red-500/10 text-red-600 border-red-500/30"
                                        >
                                          <XCircle className="h-3 w-3 mr-1" />
                                          {summary.failedCount}
                                        </Badge>
                                      )}
                                      {summary.timeoutCount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="bg-orange-500/10 text-orange-600 border-orange-500/30"
                                        >
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          {summary.timeoutCount}
                                        </Badge>
                                      )}
                                      {summary.rebootingCount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                        >
                                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                          {summary.rebootingCount}
                                        </Badge>
                                      )}
                                      {summary.pendingCount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="bg-gray-500/10 text-gray-600 border-gray-500/30"
                                        >
                                          <Clock className="h-3 w-3 mr-1" />
                                          {summary.pendingCount}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Last Reboot */}
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Last: {formatDate(summary.lastRebootAt)}
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
                </TabsContent>

                <TabsContent value="schedules">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarClock className="h-5 w-5" />
                            Scheduled Reboots
                          </CardTitle>
                          <CardDescription>
                            Configure automatic reboot schedules for agents and LXC containers
                          </CardDescription>
                        </div>
                        <Button size="sm" onClick={() => { setEditingSchedule(null); setScheduleDialogOpen(true); }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Schedule
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {schedules.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <CalendarClock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No schedules configured</p>
                          <p className="text-sm mt-2">
                            Click "Add Schedule" to configure automatic reboots
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Agent</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Schedule</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Next Run</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {schedules.map((schedule) => (
                              <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                  {schedule.agent_name ||
                                    schedule.expand?.agent_id?.hostname ||
                                    schedule.agent_id.substring(0, 8)}
                                </TableCell>
                                <TableCell>
                                  {schedule.lxc_name ||
                                    schedule.expand?.lxc_id?.name ||
                                    'Host'}
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {schedule.cron_expression}
                                  </code>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {schedule.reason || '-'}
                                </TableCell>
                                <TableCell>{formatDate(schedule.next_run_at)}</TableCell>
                                <TableCell>
                                  <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                                    {schedule.is_active ? 'Active' : 'Disabled'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingSchedule(schedule);
                                        setScheduleDialogOpen(true);
                                      }}
                                      title="Edit schedule"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleToggleSchedule(schedule.id, schedule.is_active)
                                      }
                                      title={schedule.is_active ? 'Disable' : 'Enable'}
                                    >
                                      {schedule.is_active ? (
                                        <ToggleRight className="h-4 w-4" />
                                      ) : (
                                        <ToggleLeft className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteSchedule(schedule.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TransitionWrapper>

          <Footer />
        </div>
      </div>

      {/* Schedule Dialog */}
      <RebootScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={(open) => {
          setScheduleDialogOpen(open);
          if (!open) {
            setEditingSchedule(null);
            loadData(); // Refresh data when dialog closes
          }
        }}
        agentId={editingSchedule?.agent_id || ''}
        lxcId={editingSchedule?.lxc_id || undefined}
        agentName={editingSchedule?.agent_name}
        lxcName={editingSchedule?.lxc_name}
      />
    </div>
  );
};

export default withAuth(RebootHistory);
