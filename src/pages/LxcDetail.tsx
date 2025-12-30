import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import withAuth from '@/utils/withAuth';
import {
  Box,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  ChevronRight,
  Shield
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { pb } from '@/lib/pocketbase';
import { getLxcPatchHistory, getLxcPatchSchedule, hasExistingSchedule } from '@/services/proxmoxService';
import { PatchExecutionDialog } from '@/components/PatchExecutionDialog';
import { CronScheduleDialog } from '@/components/CronScheduleDialog';
import { useToast } from '@/hooks/use-toast';

interface LxcDetails {
  id: string;
  agent_id: string;
  name: string;
  vmid: number;
  status: string;
  ostype: string;
  uptime: number;
  node: string;
  lxc_id: string;
  created: string;
  updated: string;
}

interface PatchOperation {
  id: string;
  status: string;
  mode: string;
  created: string;
  completed_at?: string;
  error_msg?: string;
}

interface PatchScheduleData {
  id: string;
  cron_expression: string;
  is_active: boolean;
  next_run?: string;
  execution_type?: string;
}

const LxcDetail = () => {
  const { lxcId } = useParams<{ lxcId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [lxc, setLxc] = useState<LxcDetails | null>(null);
  const [patchHistory, setPatchHistory] = useState<PatchOperation[]>([]);
  const [patchSchedule, setPatchSchedule] = useState<PatchScheduleData | null>(null);
  const [hasSchedule, setHasSchedule] = useState(false);
  
  // Dialog states
  const [patchDialogOpen, setPatchDialogOpen] = useState(false);
  const [cronDialogOpen, setCronDialogOpen] = useState(false);
  const [patchMode, setPatchMode] = useState<'dry_run' | 'apply'>('dry_run');

  useEffect(() => {
    if (lxcId) {
      loadData();
    }
  }, [lxcId]);

  const loadData = async () => {
    if (!lxcId) return;
    setLoading(true);
    
    try {
      // Fetch LXC details
      const lxcRecord = await pb.collection('proxmox_lxc').getOne(lxcId);
      setLxc(lxcRecord as unknown as LxcDetails);
      
      // Fetch patch history
      const history = await getLxcPatchHistory(lxcId, 20);
      setPatchHistory(history as unknown as PatchOperation[]);
      
      // Fetch schedule if exists
      if (lxcRecord.agent_id) {
        const schedule = await getLxcPatchSchedule(lxcRecord.agent_id, lxcId);
        setPatchSchedule(schedule as unknown as PatchScheduleData);
        
        const scheduleExists = await hasExistingSchedule(lxcRecord.agent_id, lxcId);
        setHasSchedule(scheduleExists);
      }
    } catch (error) {
      console.error('Error loading LXC details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load LXC details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return 'Stopped';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'stopped':
        return 'bg-muted text-muted-foreground border-border';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handlePatch = (mode: 'dry_run' | 'apply') => {
    setPatchMode(mode);
    setPatchDialogOpen(true);
  };

  const handleSchedule = () => {
    if (hasSchedule) {
      toast({
        title: 'Schedule Exists',
        description: 'This LXC already has an active patch schedule. Please edit or delete the existing schedule first.',
        variant: 'destructive'
      });
      return;
    }
    setCronDialogOpen(true);
  };

  // Calculate patch statistics
  const patchStats = {
    total: patchHistory.length,
    completed: patchHistory.filter(p => p.status === 'completed').length,
    failed: patchHistory.filter(p => p.status === 'failed').length,
    pending: patchHistory.filter(p => p.status === 'pending' || p.status === 'running').length,
    successRate: patchHistory.length > 0 
      ? Math.round((patchHistory.filter(p => p.status === 'completed').length / patchHistory.length) * 100) 
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lxc) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">LXC container not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/proxmox')}>
                  Back to Proxmox
                </Button>
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
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {/* Header */}
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  className="mb-4 pl-0"
                  onClick={() => navigate('/proxmox')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Proxmox
                </Button>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Box className="h-8 w-8 text-green-600" />
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {lxc.name}
                      </h1>
                      <Badge variant="outline" className={getStatusColor(lxc.status)}>
                        {lxc.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      VMID: {lxc.vmid} • Node: {lxc.node} • OS: {lxc.ostype}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handlePatch('dry_run')} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Check Updates
                    </Button>
                    <Button onClick={() => handlePatch('apply')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Patch Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold">{formatUptime(lxc.uptime)}</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg font-semibold">{patchStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Patches</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold text-green-600">{patchStats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-lg font-semibold text-red-600">{patchStats.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-lg font-semibold">{patchStats.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="history" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="history">
                    <Activity className="h-4 w-4 mr-2" />
                    Patch History
                  </TabsTrigger>
                  <TabsTrigger value="schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <Box className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                </TabsList>

                {/* Patch History Tab */}
                <TabsContent value="history">
                  {patchHistory.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No patch history yet</p>
                        <Button variant="outline" className="mt-4" onClick={() => handlePatch('dry_run')}>
                          Run First Patch Check
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {patchHistory.map((patch, idx) => (
                        <motion.div
                          key={patch.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link to={`/patch-execution/${patch.id}`}>
                            <Card className="hover:shadow-md transition-all cursor-pointer">
                              <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      patch.status === 'completed' 
                                        ? 'bg-green-100 text-green-600' 
                                        : patch.status === 'failed'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                      {patch.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                                      {patch.status === 'failed' && <XCircle className="h-5 w-5" />}
                                      {(patch.status === 'pending' || patch.status === 'running') && <RefreshCw className="h-5 w-5 animate-spin" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={getStatusColor(patch.status)}>
                                          {patch.status}
                                        </Badge>
                                        <Badge variant="secondary">
                                          {patch.mode === 'dry-run' ? 'Dry Run' : 'Apply'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {formatDate(patch.created)}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                {patch.error_msg && (
                                  <p className="text-sm text-red-600 mt-2 pl-14">
                                    {patch.error_msg}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Patch Schedule
                      </CardTitle>
                      <CardDescription>
                        Configure automated patching for this container
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {patchSchedule ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                            <div>
                              <p className="font-medium">Current Schedule</p>
                              <p className="text-sm text-muted-foreground font-mono mt-1">
                                {patchSchedule.cron_expression}
                              </p>
                              {patchSchedule.next_run && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Next run: {formatDate(patchSchedule.next_run)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={patchSchedule.is_active ? 'default' : 'secondary'}>
                                {patchSchedule.is_active ? 'Active' : 'Paused'}
                              </Badge>
                              <Badge variant="outline">
                                {patchSchedule.execution_type === 'apply' ? 'Apply' : 'Dry Run'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setCronDialogOpen(true)}>
                              Edit Schedule
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground mb-4">No schedule configured</p>
                          <Button onClick={handleSchedule}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Create Schedule
                          </Button>
                        </div>
                      )}
                      
                      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                              One Schedule Per Container
                            </p>
                            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                              Each LXC container can only have one active patch schedule to prevent duplicate operations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="info">
                  <Card>
                    <CardHeader>
                      <CardTitle>Container Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{lxc.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">VMID</p>
                            <p className="font-mono">{lxc.vmid}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="outline" className={getStatusColor(lxc.status)}>
                              {lxc.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Operating System</p>
                            <p className="font-medium">{lxc.ostype}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Node</p>
                            <p className="font-medium">{lxc.node}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Uptime</p>
                            <p className="font-medium">{formatUptime(lxc.uptime)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">{formatDate(lxc.created)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="font-medium">{formatDate(lxc.updated)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TransitionWrapper>
        </div>
      </div>

      {/* Dialogs */}
      {lxc && (
        <>
          <PatchExecutionDialog
            open={patchDialogOpen}
            onOpenChange={setPatchDialogOpen}
            agentId={lxc.agent_id}
            agentName={`LXC: ${lxc.name}`}
            executionType={patchMode}
            lxcId={lxc.lxc_id}
          />
          <CronScheduleDialog
            open={cronDialogOpen}
            onOpenChange={setCronDialogOpen}
            agentId={lxc.agent_id}
            lxcId={lxc.lxc_id}
          />
        </>
      )}
    </div>
  );
};

export default withAuth(LxcDetail);
