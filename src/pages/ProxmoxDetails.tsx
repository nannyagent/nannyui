import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Box,
  Layers,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getProxmoxCluster,
  getProxmoxNodes,
  getProxmoxLxcs,
  getProxmoxQemus
} from '@/services/proxmoxService';
import {
  ProxmoxClusterRecord,
  ProxmoxNodeRecord,
  ProxmoxLxcRecord,
  ProxmoxQemuRecord
} from '@/integrations/pocketbase/types';
import { getAgentById } from '@/services/agentService';
import { PatchExecutionDialog } from '@/components/PatchExecutionDialog';
import { CronScheduleDialog } from '@/components/CronScheduleDialog';

const ProxmoxDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [cluster, setCluster] = useState<ProxmoxClusterRecord | null>(null);
  const [nodes, setNodes] = useState<ProxmoxNodeRecord[]>([]);
  const [lxcs, setLxcs] = useState<ProxmoxLxcRecord[]>([]);
  const [qemus, setQemus] = useState<ProxmoxQemuRecord[]>([]);
  
  // Patching state for LXC
  const [patchDialogOpen, setPatchDialogOpen] = useState(false);
  const [cronDialogOpen, setCronDialogOpen] = useState(false);
  const [selectedLxc, setSelectedLxc] = useState<ProxmoxLxcRecord | null>(null);
  const [patchMode, setPatchMode] = useState<'dry_run' | 'apply'>('dry_run');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const agent = await getAgentById(id);
        if (agent) {
          setAgentName(agent.hostname);
        }

        const [clusterData, nodesData, lxcsData, qemusData] = await Promise.all([
          getProxmoxCluster(id),
          getProxmoxNodes(id),
          getProxmoxLxcs(id),
          getProxmoxQemus(id)
        ]);

        setCluster(clusterData);
        setNodes(nodesData);
        setLxcs(lxcsData);
        setQemus(qemusData);
      } catch (error) {
        console.error('Error fetching proxmox data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePatchLxc = (lxc: ProxmoxLxcRecord, mode: 'dry_run' | 'apply') => {
    setSelectedLxc(lxc);
    setPatchMode(mode);
    setPatchDialogOpen(true);
  };

  const handleScheduleLxc = (lxc: ProxmoxLxcRecord) => {
    setSelectedLxc(lxc);
    setCronDialogOpen(true);
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'stopped':
      case 'offline':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 overflow-hidden">
          <TransitionWrapper>
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Button 
                    variant="ghost" 
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => navigate('/agents')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Agents
                  </Button>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Proxmox Environment
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Managed by agent: <span className="font-medium text-foreground">{agentName}</span>
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Cluster Overview */}
                  {cluster && (
                    <GlassMorphicCard className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Server className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold">Cluster: {cluster.cluster_name}</h2>
                        <Badge variant={cluster.quorate ? "default" : "destructive"}>
                          {cluster.quorate ? "Quorate" : "Non-Quorate"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="text-sm text-muted-foreground mb-1">Nodes</div>
                          <div className="text-2xl font-bold">{cluster.nodes}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="text-sm text-muted-foreground mb-1">Version</div>
                          <div className="text-2xl font-bold">{cluster.version}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="text-sm text-muted-foreground mb-1">Cluster ID</div>
                          <div className="text-sm font-mono truncate" title={cluster.px_cluster_id}>
                            {cluster.px_cluster_id}
                          </div>
                        </div>
                      </div>
                    </GlassMorphicCard>
                  )}

                  <Tabs defaultValue="nodes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                      <TabsTrigger value="nodes">Nodes ({nodes.length})</TabsTrigger>
                      <TabsTrigger value="lxcs">LXC Containers ({lxcs.length})</TabsTrigger>
                      <TabsTrigger value="qemus">Virtual Machines ({qemus.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="nodes">
                      <GlassMorphicCard>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Version</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nodes.map((node) => (
                              <TableRow key={node.id}>
                                <TableCell className="font-medium">{node.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusColor(node.online ? 'online' : 'offline')}>
                                    {node.online ? 'Online' : 'Offline'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{node.ip}</TableCell>
                                <TableCell>{node.pve_version}</TableCell>
                              </TableRow>
                            ))}
                            {nodes.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                  No nodes found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </GlassMorphicCard>
                    </TabsContent>

                    <TabsContent value="lxcs">
                      <GlassMorphicCard>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>OS</TableHead>
                              <TableHead>Uptime</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lxcs.map((lxc) => (
                              <TableRow key={lxc.id}>
                                <TableCell className="font-mono">{lxc.vmid}</TableCell>
                                <TableCell className="font-medium">{lxc.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusColor(lxc.status)}>
                                    {lxc.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{lxc.ostype}</TableCell>
                                <TableCell>{formatUptime(lxc.uptime)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handlePatchLxc(lxc, 'dry_run')}
                                    >
                                      Check Updates
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handlePatchLxc(lxc, 'apply')}
                                    >
                                      Patch
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="secondary"
                                      onClick={() => handleScheduleLxc(lxc)}
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {lxcs.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                  No LXC containers found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </GlassMorphicCard>
                    </TabsContent>

                    <TabsContent value="qemus">
                      <GlassMorphicCard>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Node</TableHead>
                              <TableHead>Uptime</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {qemus.map((vm) => (
                              <TableRow key={vm.id}>
                                <TableCell className="font-mono">{vm.vmid}</TableCell>
                                <TableCell className="font-medium">{vm.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusColor(vm.status)}>
                                    {vm.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{vm.node}</TableCell>
                                <TableCell>{formatUptime(vm.uptime)}</TableCell>
                              </TableRow>
                            ))}
                            {qemus.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                  No virtual machines found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </GlassMorphicCard>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </TransitionWrapper>
        </main>
      </div>

      {/* Dialogs */}
      {id && selectedLxc && (
        <>
          <PatchExecutionDialog
            open={patchDialogOpen}
            onOpenChange={setPatchDialogOpen}
            agentId={id}
            agentName={`${agentName} (LXC: ${selectedLxc.name})`}
            executionType={patchMode}
            lxcId={selectedLxc.lxc_id}
          />
          <CronScheduleDialog
            open={cronDialogOpen}
            onOpenChange={setCronDialogOpen}
            agentId={id}
            lxcId={selectedLxc.lxc_id}
          />
        </>
      )}
    </div>
  );
};

export default ProxmoxDetails;
