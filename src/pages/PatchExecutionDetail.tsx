import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import withAuth from '@/utils/withAuth';
import { pb } from '@/lib/pocketbase';
import {
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Terminal,
  Server,
  TrendingUp,
  ArrowUpCircle,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';

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
  [key: string]: any;
}

const MAX_VERSION_LENGTH = 30;
const PACKAGES_PER_PAGE = 10;
const LOGS_PREVIEW_LINES = 20;

const PatchExecutionDetail = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [execution, setExecution] = useState<PatchExecutionWithAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [parsedOutput, setParsedOutput] = useState<ParsedOutput | null>(null);
  
  // Pagination and search state
  const [packageSearch, setPackageSearch] = useState('');
  const [packagePage, setPackagePage] = useState(1);
  const [showFullStdout, setShowFullStdout] = useState(false);
  const [showFullStderr, setShowFullStderr] = useState(false);
  const [copiedStdout, setCopiedStdout] = useState(false);
  const [copiedStderr, setCopiedStderr] = useState(false);

  useEffect(() => {
    if (executionId) {
      loadExecutionDetails();
    }
  }, [executionId]);

  const loadExecutionDetails = async () => {
    setLoading(true);
    try {
      if (!executionId) return;
      
      const execData = await pb.collection('patch_operations').getOne(executionId, {
        expand: 'agent_id',
      });

      const enrichedExecution = {
        id: execData.id,
        agent_id: execData.agent_id,
        agent_name: execData.expand?.agent_id?.hostname || `Agent ${execData.agent_id.substring(0, 8)}`,
        execution_type: execData.mode,
        status: execData.status,
        exit_code: execData.exit_code,
        error_message: null,
        stdout_storage_path: execData.stdout_file,
        stderr_storage_path: execData.stderr_file,
        started_at: execData.created,
        completed_at: execData.updated,
        should_reboot: false,
        rebooted_at: null,
      };

      setExecution(enrichedExecution);

      // Load stdout and parse JSON
      if (execData.stdout_file) {
        const url = pb.files.getURL(execData, execData.stdout_file);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const text = await response.text();
                setStdout(text);
                
                // Parse JSON from text
                const marker = '=== JSON Output (for UI parsing) ===';
                const jsonStart = text.indexOf(marker);
                if (jsonStart !== -1) {
                    const jsonText = text.substring(jsonStart + marker.length).trim();
                    try {
                        setParsedOutput(JSON.parse(jsonText));
                    } catch (e) {
                        console.error("Error parsing JSON from stdout", e);
                    }
                } else {
                    // Fallback: try parsing the whole text if it looks like JSON
                    try {
                        const parsed = JSON.parse(text);
                        if (parsed && typeof parsed === 'object') {
                            setParsedOutput(parsed);
                        }
                    } catch (e) {
                        // Not JSON
                    }
                }
            }
        } catch (e) {
            console.error("Error fetching stdout", e);
        }
      }

      // Load stderr
      if (execData.stderr_file) {
        const url = pb.files.getURL(execData, execData.stderr_file);
        try {
            const response = await fetch(url);
            if (response.ok) {
                setStderr(await response.text());
            }
        } catch (e) {
            console.error("Error fetching stderr", e);
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
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      completed: 'default',
      failed: 'destructive',
      running: 'outline',
      pending: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getExecutionTypeLabel = (type: string) => {
    switch (type) {
      case 'check': return 'Check Updates';
      case 'update': return 'Update Packages';
      case 'rollback': return 'Rollback';
      case 'dry_run': return 'Dry Run';
      case 'apply': return 'Apply Patches';
      case 'apply_with_reboot': return 'Apply + Reboot';
      default: return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return '-';
    const seconds = Math.floor((new Date(completed).getTime() - new Date(started).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const truncateVersion = (version: string) => {
    if (version.length <= MAX_VERSION_LENGTH) return version;
    return version.substring(0, MAX_VERSION_LENGTH) + '...';
  };

  const copyToClipboard = async (text: string, type: 'stdout' | 'stderr') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'stdout') {
        setCopiedStdout(true);
        setTimeout(() => setCopiedStdout(false), 2000);
      } else {
        setCopiedStderr(true);
        setTimeout(() => setCopiedStderr(false), 2000);
      }
      toast({
        title: 'Copied to clipboard',
        description: `${type === 'stdout' ? 'Standard output' : 'Error output'} copied successfully`,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const getPreviewLines = (text: string, lines: number) => {
    const allLines = text.split('\n');
    if (allLines.length <= lines) return text;
    return allLines.slice(0, lines).join('\n');
  };

  // Get package list
  const packageList = parsedOutput?.packages_to_update 
    || parsedOutput?.updated_packages_detail 
    || parsedOutput?.packages 
    || parsedOutput?.updates
    || (Array.isArray(parsedOutput?.updated_packages) && typeof parsedOutput?.updated_packages[0] === 'object' ? parsedOutput.updated_packages : null);

  // Filter and paginate packages
  const filteredPackages = packageList?.filter((pkg: PackageUpdate) => {
    if (!packageSearch) return true;
    
    const searchTerm = packageSearch.toLowerCase();
    
    // Search in package name
    const name = (pkg.name || pkg.package || pkg.package_name || '').toLowerCase();
    
    // Search in versions
    const currentVer = (pkg.current_version || pkg.from_version || pkg.current || pkg.version || '').toLowerCase();
    const newVer = (pkg.available_version || pkg.to_version || pkg.available || pkg.new_version || '').toLowerCase();
    
    // Return true if search term matches name OR any version
    return name.includes(searchTerm) || 
           currentVer.includes(searchTerm) || 
           newVer.includes(searchTerm);
  }) || [];

  const totalPackagePages = Math.ceil(filteredPackages.length / PACKAGES_PER_PAGE);
  const paginatedPackages = filteredPackages.slice(
    (packagePage - 1) * PACKAGES_PER_PAGE,
    packagePage * PACKAGES_PER_PAGE
  );

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
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold">Execution Details</h1>
                      <p className="text-muted-foreground text-sm">ID: {execution.id.substring(0, 12)}...</p>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-500" />
                        Agent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link to={`/patch-management/${execution.agent_id}`} className="text-base font-semibold hover:underline">
                        {execution.agent_name}
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(execution.status)}
                      {execution.exit_code !== null && (
                        <p className="text-xs text-muted-foreground mt-1">Exit: {execution.exit_code}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-500" />
                        Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base font-semibold">{getExecutionTypeLabel(execution.execution_type)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base font-semibold">{getDuration(execution.started_at, execution.completed_at)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(execution.started_at)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Package Statistics */}
                {parsedOutput && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Packages Checked
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {parsedOutput.packages_checked || 
                           parsedOutput.updates_available || 
                           parsedOutput.packages_updated || 
                           packageList?.length || 
                           0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          {execution.execution_type === 'check' ? 'Updates Available' : 'Updates Available'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {execution.execution_type === 'check' 
                            ? (parsedOutput.updates_available || packageList?.length || 0)
                            : (parsedOutput.updates_available || parsedOutput.packages_updated || packageList?.length || 0)
                          }
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Packages Updated
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {execution.execution_type === 'check' 
                            ? 0
                            : (parsedOutput.packages_updated || packageList?.length || 0)
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Package Table */}
                {filteredPackages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ArrowUpCircle className="h-5 w-5 text-primary" />
                            {execution.execution_type === 'dry_run' ? 'Available Updates' : 'Updated Packages'}
                          </CardTitle>
                          <CardDescription>
                            {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        {packageList && packageList.length > PACKAGES_PER_PAGE && (
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search packages..."
                              value={packageSearch}
                              onChange={(e) => {
                                setPackageSearch(e.target.value);
                                setPackagePage(1);
                              }}
                              className="pl-10"
                            />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Package Name</TableHead>
                              <TableHead>Current Version</TableHead>
                              <TableHead>New Version</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedPackages.map((pkg: PackageUpdate, idx: number) => {
                              const name = pkg.name || pkg.package || pkg.package_name || 'Unknown';
                              const currentVer = pkg.current_version || pkg.from_version || pkg.current || pkg.version || '-';
                              const newVer = pkg.available_version || pkg.to_version || pkg.available || pkg.new_version || '-';

                              return (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{name}</TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="font-mono text-sm cursor-default">
                                            {truncateVersion(currentVer)}
                                          </span>
                                        </TooltipTrigger>
                                        {currentVer.length > MAX_VERSION_LENGTH && (
                                          <TooltipContent>
                                            <p className="font-mono text-xs max-w-xs break-all">{currentVer}</p>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="font-mono text-sm text-green-600 cursor-default">
                                            {truncateVersion(newVer)}
                                          </span>
                                        </TooltipTrigger>
                                        {newVer.length > MAX_VERSION_LENGTH && (
                                          <TooltipContent>
                                            <p className="font-mono text-xs max-w-xs break-all">{newVer}</p>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {totalPackagePages > 1 && (
                        <div className="mt-4">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => setPackagePage(p => Math.max(1, p - 1))}
                                  className={packagePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {Array.from({ length: Math.min(5, totalPackagePages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPackagePages > 5) {
                                  if (packagePage > 3) {
                                    pageNum = packagePage - 2 + i;
                                  }
                                  if (pageNum > totalPackagePages) {
                                    pageNum = totalPackagePages - 4 + i;
                                  }
                                }
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() => setPackagePage(pageNum)}
                                      isActive={packagePage === pageNum}
                                      className="cursor-pointer"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => setPackagePage(p => Math.min(totalPackagePages, p + 1))}
                                  className={packagePage === totalPackagePages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Stdout */}
                {stdout && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5" />
                          Standard Output
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(stdout, 'stdout')}
                          >
                            {copiedStdout ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          {stdout.split('\n').length > LOGS_PREVIEW_LINES && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowFullStdout(!showFullStdout)}
                            >
                              {showFullStdout ? (
                                <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
                              ) : (
                                <><ChevronDown className="h-4 w-4 mr-1" /> Show All</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-slate-950 text-green-400 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
                        {showFullStdout ? stdout : getPreviewLines(stdout, LOGS_PREVIEW_LINES)}
                        {!showFullStdout && stdout.split('\n').length > LOGS_PREVIEW_LINES && (
                          <span className="text-muted-foreground block mt-2">
                            ... {stdout.split('\n').length - LOGS_PREVIEW_LINES} more lines
                          </span>
                        )}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Stderr */}
                {stderr && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <Terminal className="h-5 w-5" />
                          Error Output
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(stderr, 'stderr')}
                          >
                            {copiedStderr ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          {stderr.split('\n').length > LOGS_PREVIEW_LINES && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowFullStderr(!showFullStderr)}
                            >
                              {showFullStderr ? (
                                <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
                              ) : (
                                <><ChevronDown className="h-4 w-4 mr-1" /> Show All</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-red-950 text-red-200 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
                        {showFullStderr ? stderr : getPreviewLines(stderr, LOGS_PREVIEW_LINES)}
                        {!showFullStderr && stderr.split('\n').length > LOGS_PREVIEW_LINES && (
                          <span className="text-red-400 block mt-2">
                            ... {stderr.split('\n').length - LOGS_PREVIEW_LINES} more lines
                          </span>
                        )}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Error Message */}
                {execution.error_message && (
                  <Card className="border-red-200 dark:border-red-900">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        Error Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-600">{execution.error_message}</p>
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
