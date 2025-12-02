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
  Eye,
  RefreshCw,
  Server,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search
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

interface PatchExecutionWithAgent extends PatchExecution {
  agent_name?: string;
}

interface GroupedExecutions {
  [agentId: string]: {
    agentName: string;
    executions: PatchExecutionWithAgent[];
  };
}

const PatchHistory = () => {
  const [executions, setExecutions] = useState<PatchExecutionWithAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const data = await listAllPatchExecutions(100);
      setExecutions(data);
      
      // Auto-expand first 3 agents
      const agentIds: string[] = [...new Set(data.map(e => e.agent_id))].slice(0, 3);
      setExpandedAgents(new Set(agentIds));
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group executions by agent
  const groupedExecutions = useMemo(() => {
    let filtered = executions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.agent_name?.toLowerCase().includes(query) ||
        e.agent_id.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query)
      );
    }

    // Group by agent
    const grouped: GroupedExecutions = {};
    filtered.forEach(exec => {
      if (!grouped[exec.agent_id]) {
        grouped[exec.agent_id] = {
          agentName: exec.agent_name || `Agent ${exec.agent_id.substring(0, 8)}`,
          executions: []
        };
      }
      grouped[exec.agent_id].executions.push(exec);
    });

    // Sort each agent's executions by date
    Object.values(grouped).forEach(group => {
      group.executions.sort((a, b) => {
        const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
        const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
        return dateB - dateA;
      });
    });

    return grouped;
  }, [executions, statusFilter, searchQuery]);

  const toggleAgent = (agentId: string) => {
    const newExpanded = new Set(expandedAgents);
    if (expandedAgents.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-600">
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
      case 'running':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExecutionTypeLabel = (type: string) => {
    switch (type) {
      case 'dry_run': return 'Dry Run';
      case 'apply': return 'Apply';
      case 'apply_with_reboot': return 'Apply + Reboot';
      default: return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return '-';
    const seconds = Math.floor((new Date(completed).getTime() - new Date(started).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
                      All patch operations grouped by agent
                    </p>
                  </div>
                  <Button onClick={loadExecutions} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by agent name or ID..."
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
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Grouped Executions */}
              {Object.keys(groupedExecutions).length === 0 ? (
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
                <div className="space-y-4">
                  {Object.entries(groupedExecutions)
                    .sort(([, a], [, b]) => {
                      const latestA = a.executions[0]?.started_at ? new Date(a.executions[0].started_at).getTime() : 0;
                      const latestB = b.executions[0]?.started_at ? new Date(b.executions[0].started_at).getTime() : 0;
                      return latestB - latestA;
                    })
                    .map(([agentId, group], idx) => {
                      const isExpanded = expandedAgents.has(agentId);
                      const latestExecution = group.executions[0];
                      const completedCount = group.executions.filter(e => e.status === 'completed').length;
                      const failedCount = group.executions.filter(e => e.status === 'failed').length;

                      return (
                        <motion.div
                          key={agentId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="overflow-hidden">
                            {/* Agent Header */}
                            <button
                              onClick={() => toggleAgent(agentId)}
                              className="w-full text-left"
                            >
                              <CardHeader className="hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Server className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        {group.agentName}
                                        <Link 
                                          to={`/patch-management/${agentId}`}
                                          className="text-primary hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </Link>
                                      </CardTitle>
                                      <CardDescription className="flex items-center gap-3 mt-1">
                                        <span>{group.executions.length} execution{group.executions.length !== 1 ? 's' : ''}</span>
                                        <span className="text-green-600">{completedCount} completed</span>
                                        {failedCount > 0 && (
                                          <span className="text-red-600">{failedCount} failed</span>
                                        )}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {latestExecution && (
                                      <div className="text-right hidden sm:block">
                                        <p className="text-xs text-muted-foreground">Latest</p>
                                        <p className="text-sm font-medium">{formatDate(latestExecution.started_at)}</p>
                                      </div>
                                    )}
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </button>

                            {/* Executions List */}
                            {isExpanded && (
                              <CardContent className="border-t pt-4">
                                <div className="space-y-3">
                                  {group.executions.map((execution) => (
                                    <div
                                      key={execution.id}
                                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 flex-wrap">
                                        {getStatusBadge(execution.status)}
                                        <Badge variant="outline">
                                          {getExecutionTypeLabel(execution.execution_type)}
                                        </Badge>
                                        {execution.should_reboot && (
                                          <Badge variant="secondary" className="hidden sm:flex">
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            Reboot
                                          </Badge>
                                        )}
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {formatDate(execution.started_at)}
                                        </span>
                                        {execution.completed_at && (
                                          <span className="text-sm text-muted-foreground hidden md:flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {getDuration(execution.started_at, execution.completed_at)}
                                          </span>
                                        )}
                                      </div>
                                      <Link to={`/patch-execution/${execution.id}`}>
                                        <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4 mr-1" />
                                          Details
                                        </Button>
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
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
