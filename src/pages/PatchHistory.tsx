import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  Terminal,
  AlertTriangle,
  Server,
  Calendar,
  TrendingUp,
  ExternalLink,
  ArrowUpCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface PatchExecutionWithAgent {
  id: string;
  agent_id: string;
  agent_name?: string;
  execution_type: string;
  status: string;
  exit_code: number | null;
  error_message: string | null;
  stdout_storage_path: string | null;
  stderr_storage_path: string | null;
  started_at: string | null;
  completed_at: string | null;
  should_reboot: boolean;
  rebooted_at: string | null;
}

const PatchHistory = () => {
  const [executions, setExecutions] = useState<PatchExecutionWithAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [outputs, setOutputs] = useState<Map<string, { stdout?: string; stderr?: string }>>(new Map());
  const [loadingOutputs, setLoadingOutputs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      // Get last 50 executions with agent info
      const { data: executionsData, error: execError } = await supabase
        .from('patch_executions')
        .select(`
          id,
          agent_id,
          execution_type,
          status,
          exit_code,
          error_message,
          stdout_storage_path,
          stderr_storage_path,
          started_at,
          completed_at,
          should_reboot,
          rebooted_at
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (execError) throw execError;

      // Get agent names
      if (executionsData && executionsData.length > 0) {
        const agentIds = [...new Set(executionsData.map(e => e.agent_id))];
        const { data: agentsData } = await supabase
          .from('agents')
          .select('id, name')
          .in('id', agentIds);

        const agentMap = new Map(agentsData?.map(a => [a.id, a.name]) || []);

        const enrichedData = executionsData.map(exec => ({
          ...exec,
          agent_name: agentMap.get(exec.agent_id) || `Agent ${exec.agent_id.substring(0, 8)}`
        }));

        setExecutions(enrichedData);
      }
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (executionId: string) => {
    const newExpanded = new Set(expandedIds);
    
    if (expandedIds.has(executionId)) {
      newExpanded.delete(executionId);
    } else {
      newExpanded.add(executionId);
      
      // Load output if not already loaded
      if (!outputs.has(executionId)) {
        await loadOutput(executionId);
      }
    }
    
    setExpandedIds(newExpanded);
  };

  const loadOutput = async (executionId: string) => {
    const execution = executions.find(e => e.id === executionId);
    if (!execution) return;

    setLoadingOutputs(prev => new Set(prev).add(executionId));

    try {
      const output: { stdout?: string; stderr?: string } = {};

      // Load stdout
      if (execution.stdout_storage_path) {
        const { data: stdoutData } = await supabase.storage
          .from('patch-execution-outputs')
          .download(execution.stdout_storage_path);
        
        if (stdoutData) {
          output.stdout = await stdoutData.text();
        }
      }

      // Load stderr
      if (execution.stderr_storage_path) {
        const { data: stderrData } = await supabase.storage
          .from('patch-execution-outputs')
          .download(execution.stderr_storage_path);
        
        if (stderrData) {
          output.stderr = await stderrData.text();
        }
      }

      setOutputs(prev => new Map(prev).set(executionId, output));
    } catch (error) {
      console.error('Error loading output:', error);
    } finally {
      setLoadingOutputs(prev => {
        const newSet = new Set(prev);
        newSet.delete(executionId);
        return newSet;
      });
    }
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
      case 'dry_run':
        return 'Dry Run';
      case 'apply':
        return 'Apply';
      case 'apply_with_reboot':
        return 'Apply + Reboot';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return '-';
    const seconds = Math.floor((new Date(completed).getTime() - new Date(started).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const parseJsonOutput = (stdout: string): any => {
    try {
      const lines = stdout.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{')) {
          return JSON.parse(trimmed);
        }
      }
      return null;
    } catch {
      return null;
    }
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
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                      <Shield className="h-8 w-8 text-primary" />
                      Patch Management History
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      Recent patch operations across all agents
                    </p>
                  </div>
                  <Button onClick={loadExecutions} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Info Banner */}
              {executions.length > 0 && (
                <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>💡 Tip:</strong> Click the <strong>"Details"</strong> button on any execution to view the complete package update table with version information.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Executions List */}
              {executions.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No patch executions found</p>
                      <p className="text-sm mt-2">Patch operations will appear here once executed</p>
                      <div className="mt-6">
                        <p className="text-xs text-muted-foreground mb-3">To execute patches:</p>
                        <ol className="text-xs text-left inline-block space-y-2">
                          <li className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                            Go to an agent page from the <Link to="/agents" className="text-primary hover:underline">Agents</Link> list
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                            Click "Patch Management" on the agent card
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                            Run "Dry Run" to preview or "Apply Patches" to update
                          </li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {executions.map((execution, idx) => {
                    const isExpanded = expandedIds.has(execution.id);
                    const output = outputs.get(execution.id);
                    const isLoadingOutput = loadingOutputs.has(execution.id);
                    const parsedOutput = output?.stdout ? parseJsonOutput(output.stdout) : null;

                    return (
                      <motion.div
                        key={execution.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                {/* Status and Type Row */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getStatusBadge(execution.status)}
                                  <Badge variant="outline" className="font-medium">
                                    {getExecutionTypeLabel(execution.execution_type)}
                                  </Badge>
                                  {execution.should_reboot && (
                                    <Badge variant="secondary">
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      Reboot
                                    </Badge>
                                  )}
                                </div>

                                {/* Agent and Time Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-blue-500" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground">Agent</span>
                                      <Link
                                        to={`/patch-management/${execution.agent_id}`}
                                        className="text-sm font-medium hover:underline flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {execution.agent_name}
                                        <ExternalLink className="h-3 w-3" />
                                      </Link>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground">Started</span>
                                      <span className="text-sm font-medium">{formatDate(execution.started_at)}</span>
                                    </div>
                                  </div>

                                  {execution.completed_at && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-purple-500" />
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Duration</span>
                                        <span className="text-sm font-medium">
                                          {getDuration(execution.started_at, execution.completed_at)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Quick Stats if available */}
                                {!isExpanded && output?.stdout && (() => {
                                  const quickParsed = parseJsonOutput(output.stdout);
                                  if (quickParsed) {
                                    return (
                                      <div className="flex items-center gap-4 pt-2 border-t">
                                        <div className="flex items-center gap-2">
                                          <Package className="h-4 w-4 text-blue-500" />
                                          <span className="text-sm">
                                            <span className="font-bold">{quickParsed.packages_checked || 0}</span>
                                            <span className="text-muted-foreground ml-1">checked</span>
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <TrendingUp className="h-4 w-4 text-amber-500" />
                                          <span className="text-sm">
                                            <span className="font-bold">
                                              {quickParsed.updates_available || quickParsed.packages_updated || 0}
                                            </span>
                                            <span className="text-muted-foreground ml-1">
                                              {execution.execution_type === 'dry_run' ? 'available' : 'updated'}
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {execution.error_message && (
                                  <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span className="flex-1">{execution.error_message}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2">
                                <Button
                                  asChild
                                  variant="default"
                                  size="sm"
                                >
                                  <Link to={`/patch-execution/${execution.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Details
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpand(execution.id)}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Collapse
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      Expand
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {isExpanded && (
                            <CardContent className="border-t">
                              {isLoadingOutput ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                  <span className="ml-2 text-muted-foreground">Loading output...</span>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Parsed JSON Output */}
                                  {parsedOutput && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                        <div>
                                          <div className="text-sm text-muted-foreground">Packages Checked</div>
                                          <div className="text-2xl font-bold">{parsedOutput.packages_checked || 0}</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-muted-foreground">
                                            {execution.execution_type === 'dry_run' ? 'Updates Available' : 'Packages Updated'}
                                          </div>
                                          <div className="text-2xl font-bold text-blue-600">
                                            {parsedOutput.updates_available || parsedOutput.packages_updated || 0}
                                          </div>
                                        </div>
                                      </div>

                                      {parsedOutput.updated_packages && parsedOutput.updated_packages.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="font-medium flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            {execution.execution_type === 'dry_run' ? 'Available Updates' : 'Updated Packages'}
                                          </div>
                                          <div className="max-h-60 overflow-y-auto space-y-1 p-3 bg-muted/30 rounded-lg">
                                            {parsedOutput.updated_packages.map((pkg: string, idx: number) => (
                                              <div key={idx} className="text-sm font-mono">{pkg}</div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Stdout */}
                                  {output?.stdout && (
                                    <div className="space-y-2">
                                      <div className="font-medium flex items-center gap-2">
                                        <Terminal className="h-4 w-4" />
                                        Standard Output
                                      </div>
                                      <pre className="p-4 bg-slate-950 text-green-400 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
                                        {output.stdout}
                                      </pre>
                                    </div>
                                  )}

                                  {/* Stderr */}
                                  {output?.stderr && (
                                    <div className="space-y-2">
                                      <div className="font-medium flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        Error Output
                                      </div>
                                      <pre className="p-4 bg-red-950 text-red-200 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
                                        {output.stderr}
                                      </pre>
                                    </div>
                                  )}

                                  {!output?.stdout && !output?.stderr && (
                                    <div className="text-center py-4 text-muted-foreground">
                                      <p className="text-sm">No output available</p>
                                    </div>
                                  )}
                                </div>
                              )}
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
