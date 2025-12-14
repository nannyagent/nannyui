import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import withAuth from '@/utils/withAuth';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  TrendingUp,
  Server,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
  Clock,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Play,
  Eye,
  Settings,
  RefreshCw,
  Calendar,
  CalendarClock,
  Ban,
  Cpu,
  HardDrive
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import { getPatchManagementData, type PatchManagementData, type Package as PatchPackage, getScheduledPatches, getPackageExceptions } from '@/services/patchManagementService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatchExecutionDialog } from '@/components/PatchExecutionDialog';
import { PackageExceptionsDialog } from '@/components/PackageExceptionsDialog';
import { PatchExecutionHistory } from '@/components/PatchExecutionHistory';
import { CronScheduleDialog } from '@/components/CronScheduleDialog';
import { RebootDialog } from '@/components/RebootDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PatchManagement = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [data, setData] = useState<PatchManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog states
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [executionType, setExecutionType] = useState<'dry_run' | 'apply'>('dry_run');
  const [shouldReboot, setShouldReboot] = useState(false);
  const [exceptionsDialogOpen, setExceptionsDialogOpen] = useState(false);
  const [cronScheduleDialogOpen, setCronScheduleDialogOpen] = useState(false);
  const [rebootDialogOpen, setRebootDialogOpen] = useState(false);
  const [isAgentOnline, setIsAgentOnline] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  
  // Schedule and exceptions data
  const [schedules, setSchedules] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    loadPatchData();
    checkAgentConnection();
    loadSchedulesAndExceptions();
  }, [agentId]);

  const checkAgentConnection = async () => {
    if (!agentId) return;
    
    setCheckingConnection(true);
    try {
      const { checkAgentWebSocketConnection } = await import('@/services/patchManagementService');
      const isOnline = await checkAgentWebSocketConnection(agentId);
      setIsAgentOnline(isOnline);
    } catch (error) {
      console.error('Error checking agent connection:', error);
      setIsAgentOnline(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const loadPatchData = async () => {
    if (!agentId) return;
    
    setLoading(true);
    setHasError(false);
    
    try {
      const patchData = await getPatchManagementData(agentId);
      setData(patchData);
    } catch (error) {
      setHasError(false);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulesAndExceptions = async () => {
    if (!agentId) return;
    
    setLoadingExtras(true);
    try {
      const [schedulesData, exceptionsData] = await Promise.all([
        getScheduledPatches(agentId),
        getPackageExceptions(agentId)
      ]);
      setSchedules(schedulesData || []);
      setExceptions(exceptionsData || []);
    } catch (error) {
      console.error('Error loading schedules and exceptions:', error);
    } finally {
      setLoadingExtras(false);
    }
  };

  // Filter packages based on severity
  const filteredPackages = data?.packages.filter(pkg => {
    if (severityFilter === 'all') return true;
    
    const hasRelevantVulns = pkg.vulnerabilities.some(vuln => {
      if (severityFilter === 'critical') return vuln.severity === 'critical';
      if (severityFilter === 'high') return vuln.severity === 'high' || vuln.severity === 'critical';
      if (severityFilter === 'medium') return vuln.severity === 'medium' || vuln.severity === 'high' || vuln.severity === 'critical';
      return false;
    });
    
    return hasRelevantVulns;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      default: return <ShieldCheck className="h-4 w-4" />;
    }
  };

  const formatCronSchedule = (cron: string) => {
    // Simple human-readable conversion for common patterns
    if (cron === '0 0 * * *') return 'Daily at midnight';
    if (cron === '0 2 * * *') return 'Daily at 2:00 AM';
    if (cron === '0 0 * * 0') return 'Weekly on Sunday';
    if (cron === '0 0 1 * *') return 'Monthly on 1st';
    return cron;
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
                <p className="text-muted-foreground">Loading patch management data...</p>
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
              {hasError && (
                <ErrorBanner 
                  message="An error occurred while loading patch management data"
                  onDismiss={() => setHasError(false)}
                />
              )}

              {/* Header */}
              <div className="mb-6">
                <Link 
                  to="/agents" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Agents
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Patch Management</h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      Agent {agentId?.substring(0, 8)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {!checkingConnection && (
                        <Badge variant={isAgentOnline ? "default" : "secondary"} className={isAgentOnline ? "bg-green-600" : ""}>
                          {isAgentOnline ? "Agent Online" : "Agent Offline"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExceptionsDialogOpen(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Exceptions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCronScheduleDialogOpen(true)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isAgentOnline || checkingConnection}
                      onClick={() => {
                        setExecutionType('dry_run');
                        setShouldReboot(false);
                        setExecutionDialogOpen(true);
                      }}
                      title={!isAgentOnline ? "Agent must be online to run dry run" : "Preview available updates"}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Dry Run
                    </Button>
                    <Button
                      size="sm"
                      disabled={!isAgentOnline || checkingConnection}
                      onClick={() => {
                        setExecutionType('apply');
                        setShouldReboot(false);
                        setExecutionDialogOpen(true);
                      }}
                      title={!isAgentOnline ? "Agent must be online to apply patches" : "Apply available updates"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Apply Patches
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!isAgentOnline || checkingConnection}
                      onClick={() => setRebootDialogOpen(true)}
                      title={!isAgentOnline ? "Agent must be online to reboot" : "Reboot agent node"}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reboot
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* System Info Cards */}
                  {data && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="h-full">
                          <CardContent className="pt-4 pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Server className="h-4 w-4 text-primary" />
                              <span className="text-xs text-muted-foreground">System</span>
                            </div>
                            <p className="text-sm font-semibold">{data.os_distribution} {data.os_version}</p>
                            <p className="text-xs text-muted-foreground">{data.architecture}</p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <Card className="h-full">
                          <CardContent className="pt-4 pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Cpu className="h-4 w-4 text-primary" />
                              <span className="text-xs text-muted-foreground">Kernel</span>
                            </div>
                            <p className="text-sm font-semibold truncate" title={data.kernel_version}>
                              {data.kernel_version}
                            </p>
                            <p className="text-xs text-muted-foreground">{data.package_manager}</p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Card className="h-full">
                          <CardContent className="pt-4 pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-primary" />
                              <span className="text-xs text-muted-foreground">Packages</span>
                            </div>
                            <p className="text-2xl font-bold">{data.summary.total_packages_checked}</p>
                            <p className="text-xs text-muted-foreground">{data.summary.packages_with_updates} updates</p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <Card className="h-full">
                          <CardContent className="pt-4 pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-xs text-muted-foreground">Analyzed</span>
                            </div>
                            <p className="text-sm font-semibold">
                              {new Date(data.analysis_timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(data.analysis_timestamp).toLocaleTimeString()}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  )}

                  {/* Vulnerability Summary */}
                  {data && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Security Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border-l-4 border-red-600">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-red-900 dark:text-red-100">Critical</span>
                                <ShieldAlert className="h-4 w-4 text-red-600" />
                              </div>
                              <p className="text-2xl font-bold text-red-600">{data.summary.critical_vulnerabilities}</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border-l-4 border-orange-600">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-orange-900 dark:text-orange-100">High</span>
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                              </div>
                              <p className="text-2xl font-bold text-orange-600">{data.summary.high_vulnerabilities}</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-600">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-yellow-900 dark:text-yellow-100">Medium</span>
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              </div>
                              <p className="text-2xl font-bold text-yellow-600">{data.summary.medium_vulnerabilities}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-600">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-green-900 dark:text-green-100">Updates</span>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              </div>
                              <p className="text-2xl font-bold text-green-600">{data.summary.packages_with_updates}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Tabs for Packages, Recommendations */}
                  {data && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Card>
                        <Tabs defaultValue="packages" className="w-full">
                          <CardHeader className="pb-0">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="packages">Packages</TabsTrigger>
                              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                            </TabsList>
                          </CardHeader>
                          
                          <TabsContent value="packages" className="mt-0">
                            <CardContent className="pt-4">
                              {/* Filter Buttons */}
                              <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                                {['all', 'critical', 'high', 'medium'].map((filter) => (
                                  <button
                                    key={filter}
                                    onClick={() => {
                                      setSeverityFilter(filter as any);
                                      setCurrentPage(1);
                                    }}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                                      severityFilter === filter
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                                  >
                                    {filter}
                                  </button>
                                ))}
                              </div>

                              {/* Packages List */}
                              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {paginatedPackages.length === 0 ? (
                                  <div className="text-center py-8">
                                    <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
                                    <p className="text-sm text-muted-foreground">No vulnerabilities found</p>
                                  </div>
                                ) : (
                                  paginatedPackages.map((pkg, idx) => (
                                    <div
                                      key={`${pkg.name}-${idx}`}
                                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm">{pkg.name}</span>
                                            {pkg.upgrade_available && (
                                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 text-xs">
                                                Update
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {pkg.current_version}
                                            {pkg.upgrade_available && (
                                              <span className="text-green-600"> → {pkg.available_version}</span>
                                            )}
                                          </p>
                                        </div>
                                        {pkg.vulnerabilities.length > 0 && (
                                          <div className="flex gap-1">
                                            {pkg.vulnerabilities.slice(0, 2).map((vuln, vIdx) => (
                                              <Badge key={vIdx} className={`text-xs ${getSeverityColor(vuln.severity)}`}>
                                                {vuln.severity}
                                              </Badge>
                                            ))}
                                            {pkg.vulnerabilities.length > 2 && (
                                              <Badge variant="outline" className="text-xs">+{pkg.vulnerabilities.length - 2}</Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPackages.length)} of {filteredPackages.length}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                      disabled={currentPage === 1}
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs px-2">{currentPage}/{totalPages}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                      disabled={currentPage === totalPages}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </TabsContent>
                          
                          <TabsContent value="recommendations" className="mt-0">
                            <CardContent className="pt-4">
                              {data.recommendations.length > 0 ? (
                                <ul className="space-y-3">
                                  {data.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start text-sm">
                                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  No recommendations at this time
                                </p>
                              )}
                            </CardContent>
                          </TabsContent>
                        </Tabs>
                      </Card>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Sidebar Content */}
                <div className="space-y-6">
                  {/* Recent Executions */}
                  {agentId && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <PatchExecutionHistory agentId={agentId} limit={5} />
                    </motion.div>
                  )}

                  {/* Scheduled Patches */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 text-primary" />
                            Scheduled Patches
                          </CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setCronScheduleDialogOpen(true)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loadingExtras ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : schedules.length === 0 ? (
                          <div className="text-center py-4">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No scheduled patches</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setCronScheduleDialogOpen(true)}
                            >
                              Create Schedule
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {schedules.slice(0, 3).map((schedule, idx) => (
                              <div key={schedule.id || idx} className="p-2 rounded-lg border bg-muted/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={schedule.is_active ? "default" : "secondary"} className="text-xs">
                                      {schedule.execution_type === 'dry_run' ? 'Dry Run' : 'Apply'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatCronSchedule(schedule.cron_expression)}
                                    </span>
                                  </div>
                                  {!schedule.is_active && (
                                    <Badge variant="outline" className="text-xs">Paused</Badge>
                                  )}
                                </div>
                                {schedule.next_run_at && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Next: {new Date(schedule.next_run_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Package Exceptions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Ban className="h-5 w-5 text-primary" />
                            Exceptions
                          </CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setExceptionsDialogOpen(true)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="text-xs">Packages excluded from updates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingExtras ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : exceptions.length === 0 ? (
                          <div className="text-center py-4">
                            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No exceptions configured</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setExceptionsDialogOpen(true)}
                            >
                              Add Exception
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {exceptions.slice(0, 5).map((exception, idx) => (
                              <div key={exception.id || idx} className="p-2 rounded-lg border bg-muted/30">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-sm">{exception.package_name}</span>
                                  <Badge variant={exception.is_active ? "destructive" : "secondary"} className="text-xs">
                                    {exception.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                {exception.reason && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate" title={exception.reason}>
                                    {exception.reason}
                                  </p>
                                )}
                              </div>
                            ))}
                            {exceptions.length > 5 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-xs"
                                onClick={() => setExceptionsDialogOpen(true)}
                              >
                                View all {exceptions.length} exceptions
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </TransitionWrapper>
          <Footer />
        </div>
      </div>

      {/* Dialogs */}
      {agentId && (
        <>
          <PatchExecutionDialog
            open={executionDialogOpen}
            onOpenChange={setExecutionDialogOpen}
            agentId={agentId}
            agentName={`Agent ${agentId.substring(0, 8)}`}
            executionType={executionType}
            shouldReboot={shouldReboot}
          />

          <PackageExceptionsDialog
            open={exceptionsDialogOpen}
            onOpenChange={(open) => {
              setExceptionsDialogOpen(open);
              if (!open) loadSchedulesAndExceptions();
            }}
            agentId={agentId}
            agentName={`Agent ${agentId.substring(0, 8)}`}
          />

          <CronScheduleDialog
            open={cronScheduleDialogOpen}
            onOpenChange={(open) => {
              setCronScheduleDialogOpen(open);
              if (!open) loadSchedulesAndExceptions();
            }}
            agentId={agentId}
          />

          <RebootDialog
            open={rebootDialogOpen}
            onOpenChange={setRebootDialogOpen}
            agentId={agentId}
          />
        </>
      )}
    </div>
  );
};

export default withAuth(PatchManagement);
