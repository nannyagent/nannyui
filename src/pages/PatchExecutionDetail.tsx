import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import withAuth from '@/utils/withAuth';
import {
  Shield,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Terminal,
  AlertTriangle,
  Server,
  Calendar,
  TrendingUp,
  ArrowUpCircle,
  CheckCircle,
  XCircleIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface PackageUpdate {
  name?: string;
  package?: string;
  package_name?: string;
  current_version?: string;
  available_version?: string;
  from_version?: string;
  to_version?: string;
  current?: string;
  available?: string;
  version?: string;
  new_version?: string;
}

interface ParsedOutput {
  packages_checked?: number;
  updates_available?: number;
  packages_updated?: number;
  updated_packages?: string[] | PackageUpdate[];
  packages_to_update?: PackageUpdate[];
  updated_packages_detail?: PackageUpdate[];
  packages?: PackageUpdate[];
  updates?: PackageUpdate[];
  // Allow any additional fields
  [key: string]: any;
}

const PatchExecutionDetail = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<PatchExecutionWithAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [parsedOutput, setParsedOutput] = useState<ParsedOutput | null>(null);

  useEffect(() => {
    if (executionId) {
      loadExecutionDetails();
    }
  }, [executionId]);

  const loadExecutionDetails = async () => {
    setLoading(true);
    try {
      // Get execution details
      const { data: execData, error: execError } = await supabase
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
        .eq('id', executionId)
        .single();

      if (execError) throw execError;

      // Get agent name
      const { data: agentData } = await supabase
        .from('agents')
        .select('id, name')
        .eq('id', execData.agent_id)
        .single();

      const enrichedExecution = {
        ...execData,
        agent_name: agentData?.name || `Agent ${execData.agent_id.substring(0, 8)}`
      };

      setExecution(enrichedExecution);

      // Load JSON output file from storage: {agent-id}/{execution-id}-output.json
      const jsonFilePath = `${execData.agent_id}/${executionId}-output.json`;
      try {
        const { data: jsonData, error: jsonError } = await supabase.storage
          .from('patch-execution-outputs')
          .download(jsonFilePath);

        if (!jsonError && jsonData) {
          const text = await jsonData.text();
          const parsed = JSON.parse(text);
          console.log('✅ Loaded package JSON:', parsed);
          setParsedOutput(parsed);
        } else {
          console.warn('No JSON output file found:', jsonFilePath, jsonError);
        }
      } catch (error) {
        console.error('Error loading JSON output:', error);
      }

      // Load stdout
      if (execData.stdout_storage_path) {
        const { data: stdoutData } = await supabase.storage
          .from('patch-execution-outputs')
          .download(execData.stdout_storage_path);

        if (stdoutData) {
          const text = await stdoutData.text();
          setStdout(text);
        }
      }

      // Load stderr
      if (execData.stderr_storage_path) {
        const { data: stderrData } = await supabase.storage
          .from('patch-execution-outputs')
          .download(execData.stderr_storage_path);

        if (stderrData) {
          const text = await stderrData.text();
          setStderr(text);
        }
      }
    } catch (error) {
      console.error('Error loading execution details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      completed: 'default',
      failed: 'destructive',
      running: 'outline',
      pending: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getExecutionTypeLabel = (type: string) => {
    switch (type) {
      case 'dry_run':
        return 'Dry Run';
      case 'apply':
        return 'Apply Patches';
      case 'apply_with_reboot':
        return 'Apply + Reboot';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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
                <p className="text-muted-foreground">Loading execution details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <p className="text-muted-foreground">Execution not found</p>
                <Button asChild className="mt-4">
                  <Link to="/patch-history">Back to History</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TransitionWrapper>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            
            <main className="flex-1 p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold">Patch Execution Details</h1>
                      <p className="text-muted-foreground">Execution ID: {execution.id}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-500" />
                        Agent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link
                        to={`/patch-management/${execution.agent_id}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {execution.agent_name}
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(execution.status)}
                      {execution.exit_code !== null && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Exit code: {execution.exit_code}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-500" />
                        Execution Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{getExecutionTypeLabel(execution.execution_type)}</p>
                      {execution.should_reboot && (
                        <Badge variant="outline" className="mt-2">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reboot Requested
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {getDuration(execution.started_at, execution.completed_at)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(execution.started_at)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Package Statistics */}
                {parsedOutput && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Packages Checked
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{parsedOutput.packages_checked || 0}</p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="border-l-4 border-l-amber-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Updates Available
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">
                            {parsedOutput.updates_available || parsedOutput.packages_updated || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Packages Updated
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">
                            {parsedOutput.packages_updated || parsedOutput.updated_packages?.length || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Package Details Table */}
                {parsedOutput && (() => {
                  // Find package array with any of these field names
                  const packageList = parsedOutput.packages_to_update 
                    || parsedOutput.updated_packages_detail 
                    || parsedOutput.packages 
                    || parsedOutput.updates
                    || (Array.isArray(parsedOutput.updated_packages) && typeof parsedOutput.updated_packages[0] === 'object' ? parsedOutput.updated_packages : null);
                  
                  if (!packageList || !Array.isArray(packageList) || packageList.length === 0) {
                    return null;
                  }

                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ArrowUpCircle className="h-5 w-5 text-primary" />
                          {execution.execution_type === 'dry_run' ? 'Available Updates' : 'Updated Packages'}
                        </CardTitle>
                        <CardDescription>
                          {execution.execution_type === 'dry_run'
                            ? 'Packages that can be updated'
                            : 'Packages that were updated during this execution'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Package Name</TableHead>
                                <TableHead>Current Version</TableHead>
                                <TableHead>New Version</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {packageList.map((pkg: any, idx: number) => {
                                const name = pkg.name || pkg.package || pkg.package_name || `Package ${idx + 1}`;
                                const currentVersion = pkg.current_version || pkg.from_version || pkg.current || pkg.version || '-';
                                const newVersion = pkg.available_version || pkg.to_version || pkg.available || pkg.new_version || '-';
                                
                                return (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium">{name}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {currentVersion}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="default">
                                        {newVersion}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {execution.execution_type === 'dry_run' ? (
                                        <Badge variant="secondary">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Pending
                                        </Badge>
                                      ) : (
                                        <Badge variant="default">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Updated
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Simple package list if detailed info not available */}
                {parsedOutput && Array.isArray(parsedOutput.updated_packages) && typeof parsedOutput.updated_packages[0] === 'string' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Updated Packages
                      </CardTitle>
                      <CardDescription>
                        List of packages that were updated
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {parsedOutput.updated_packages.map((pkg: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Show warning if no JSON was loaded at all */}
                {!parsedOutput && (
                  <Card className="border-amber-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        No Structured Data Found
                      </CardTitle>
                      <CardDescription>
                        Could not load package data from storage. Check browser console for details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Expected file: <code className="text-xs bg-muted px-1 py-0.5 rounded">patch-execution-outputs/{execution?.agent_id}/{executionId}-output.json</code>
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Error Message */}
                {execution.error_message && (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-mono bg-destructive/10 p-3 rounded">
                        {execution.error_message}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Terminal Output */}
                {stdout && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-green-500" />
                        Standard Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {stdout}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {stderr && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <Terminal className="h-5 w-5" />
                        Standard Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-red-950 text-red-300 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {stderr}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default withAuth(PatchExecutionDetail);
