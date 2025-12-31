import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import withAuth from '@/utils/withAuth';
import {
  Server,
  Monitor,
  Box,
  Cpu,
  Search,
  RefreshCw,
  ChevronRight,
  Clock,
  ChevronLeft,
  Layers,
  ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  getAllProxmoxClusters,
  getAllProxmoxNodes,
  getAllProxmoxLxcsPaginated,
  getAllProxmoxQemusPaginated,
} from '@/services/proxmoxService';
import {
  ProxmoxClusterRecord,
  ProxmoxNodeRecord,
  ProxmoxLxcRecord,
  ProxmoxQemuRecord
} from '@/integrations/pocketbase/types';

const Proxmox = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState<ProxmoxClusterRecord[]>([]);
  const [nodes, setNodes] = useState<ProxmoxNodeRecord[]>([]);
  const [lxcs, setLxcs] = useState<ProxmoxLxcRecord[]>([]);
  const [qemus, setQemus] = useState<ProxmoxQemuRecord[]>([]);
  
  // Pagination state
  const [lxcPage, setLxcPage] = useState(1);
  const [qemuPage, setQemuPage] = useState(1);
  const [lxcTotal, setLxcTotal] = useState(0);
  const [qemuTotal, setQemuTotal] = useState(0);
  const [lxcTotalPages, setLxcTotalPages] = useState(0);
  const [qemuTotalPages, setQemuTotalPages] = useState(0);
  const itemsPerPage = 12;
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [groupByNode, setGroupByNode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadLxcs();
  }, [lxcPage, selectedNode, searchQuery]);

  useEffect(() => {
    loadQemus();
  }, [qemuPage, selectedNode, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clustersData, nodesData] = await Promise.all([
        getAllProxmoxClusters(),
        getAllProxmoxNodes(),
      ]);
      setClusters(clustersData);
      setNodes(nodesData);
    } catch (error) {
      console.error('Error loading Proxmox data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLxcs = async () => {
    try {
      const result = await getAllProxmoxLxcsPaginated(
        lxcPage, 
        itemsPerPage, 
        selectedNode || undefined,
        searchQuery || undefined
      );
      setLxcs(result.items);
      setLxcTotal(result.total);
      setLxcTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading LXCs:', error);
    }
  };

  const loadQemus = async () => {
    try {
      const result = await getAllProxmoxQemusPaginated(
        qemuPage, 
        itemsPerPage, 
        selectedNode || undefined,
        searchQuery || undefined
      );
      setQemus(result.items);
      setQemuTotal(result.total);
      setQemuTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading QEMUs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'stopped':
      case 'offline':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return 'Stopped';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
  };

  // Group LXCs by node
  const lxcsByNode = useMemo(() => {
    if (!groupByNode) return null;
    const grouped = new Map<string, ProxmoxLxcRecord[]>();
    lxcs.forEach(lxc => {
      const nodeName = lxc.node || 'Unknown';
      if (!grouped.has(nodeName)) {
        grouped.set(nodeName, []);
      }
      grouped.get(nodeName)!.push(lxc);
    });
    return grouped;
  }, [lxcs, groupByNode]);

  // Group QEMUs by node
  const qemusByNode = useMemo(() => {
    if (!groupByNode) return null;
    const grouped = new Map<string, ProxmoxQemuRecord[]>();
    qemus.forEach(qemu => {
      const nodeName = qemu.node || 'Unknown';
      if (!grouped.has(nodeName)) {
        grouped.set(nodeName, []);
      }
      grouped.get(nodeName)!.push(qemu);
    });
    return grouped;
  }, [qemus, groupByNode]);

  const handleNodeFilter = (nodeName: string) => {
    setSelectedNode(prev => prev === nodeName ? '' : nodeName);
    setLxcPage(1);
    setQemuPage(1);
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                      <Layers className="h-8 w-8 text-primary" />
                      Proxmox Infrastructure
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      Manage your clusters, nodes, containers and virtual machines
                    </p>
                  </div>
                  <Button onClick={loadData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{clusters.length}</p>
                    <p className="text-xs text-muted-foreground">Clusters</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{nodes.length}</p>
                    <p className="text-xs text-muted-foreground">Nodes</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Box className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{lxcTotal}</p>
                    <p className="text-xs text-muted-foreground">LXC Containers</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{qemuTotal}</p>
                    <p className="text-xs text-muted-foreground">Virtual Machines</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="clusters" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="clusters" className="text-xs sm:text-sm">
                    <Server className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Clusters</span>
                  </TabsTrigger>
                  <TabsTrigger value="nodes" className="text-xs sm:text-sm">
                    <Monitor className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nodes</span>
                  </TabsTrigger>
                  <TabsTrigger value="lxc" className="text-xs sm:text-sm">
                    <Box className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">LXC</span>
                  </TabsTrigger>
                  <TabsTrigger value="qemu" className="text-xs sm:text-sm">
                    <Cpu className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">QEMU</span>
                  </TabsTrigger>
                </TabsList>

                {/* Clusters Tab */}
                <TabsContent value="clusters">
                  {clusters.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No Proxmox Clusters Found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          It looks like you haven't connected any Proxmox clusters yet. 
                          Install the NannyML agent on your Proxmox host to get started.
                        </p>
                        <div className="flex justify-center gap-4">
                          <Button variant="outline" onClick={() => navigate('/docs')}>
                            View Documentation
                          </Button>
                          <Button onClick={() => navigate('/agent-registration')}>
                            Register Agent
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {clusters.map((cluster, idx) => (
                        <motion.div
                          key={cluster.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Server className="h-5 w-5 text-primary" />
                                  {cluster.cluster_name}
                                </CardTitle>
                                <Badge variant={cluster.quorate ? "default" : "destructive"}>
                                  {cluster.quorate ? "Quorate" : "Non-Quorate"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Nodes</p>
                                  <p className="font-semibold">{cluster.nodes}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Version</p>
                                  <p className="font-semibold">{cluster.version}</p>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                  ID: {cluster.px_cluster_id}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Nodes Tab */}
                <TabsContent value="nodes">
                  {nodes.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No Proxmox Nodes Found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Connect your Proxmox nodes by installing the agent.
                        </p>
                        <Button onClick={() => navigate('/agent-registration')}>
                          Register Agent
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {nodes.map((node, idx) => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card 
                            className={`hover:shadow-lg transition-all cursor-pointer ${
                              selectedNode === node.name ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => handleNodeFilter(node.name)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Monitor className="h-5 w-5 text-blue-600" />
                                  {node.name}
                                </CardTitle>
                                <Badge variant="outline" className={getStatusColor(node.online ? 'online' : 'offline')}>
                                  {node.online ? 'Online' : 'Offline'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">IP Address</span>
                                  <span className="font-mono">{node.ip}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">PVE Version</span>
                                  <span>{node.pve_version}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Level</span>
                                  <span className="capitalize">{node.level}</span>
                                </div>
                                {node.agent_id && (
                                  <div className="mt-2 pt-2 border-t flex justify-end">
                                    <Button 
                                      variant="link" 
                                      className="p-0 h-auto text-xs text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/agents/${node.agent_id}`);
                                      }}
                                    >
                                      View Agent <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* LXC Tab */}
                <TabsContent value="lxc">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search LXC containers..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setLxcPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="group-by-node-lxc"
                          checked={groupByNode}
                          onCheckedChange={setGroupByNode}
                        />
                        <Label htmlFor="group-by-node-lxc" className="text-sm whitespace-nowrap">
                          Group by Node
                        </Label>
                      </div>
                      {selectedNode && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedNode('')}>
                          Node: {selectedNode} ×
                        </Badge>
                      )}
                    </div>
                  </div>

                  {lxcs.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No LXC Containers Found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          LXC containers will appear here once your Proxmox nodes are connected.
                        </p>
                      </CardContent>
                    </Card>
                  ) : groupByNode && lxcsByNode ? (
                    <div className="space-y-6">
                      {Array.from(lxcsByNode.entries()).map(([nodeName, nodeLxcs]) => (
                        <div key={nodeName}>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-blue-600" />
                            {nodeName}
                            <Badge variant="outline">{nodeLxcs.length}</Badge>
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {nodeLxcs.map((lxc) => (
                              <LxcCard key={lxc.id} lxc={lxc} navigate={navigate} getStatusColor={getStatusColor} formatUptime={formatUptime} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {lxcs.map((lxc, idx) => (
                          <motion.div
                            key={lxc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            <LxcCard lxc={lxc} navigate={navigate} getStatusColor={getStatusColor} formatUptime={formatUptime} />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {lxcTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLxcPage(p => Math.max(1, p - 1))}
                            disabled={lxcPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {lxcPage} of {lxcTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLxcPage(p => Math.min(lxcTotalPages, p + 1))}
                            disabled={lxcPage === lxcTotalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                {/* QEMU Tab */}
                <TabsContent value="qemu">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search virtual machines..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setQemuPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="group-by-node-qemu"
                          checked={groupByNode}
                          onCheckedChange={setGroupByNode}
                        />
                        <Label htmlFor="group-by-node-qemu" className="text-sm whitespace-nowrap">
                          Group by Node
                        </Label>
                      </div>
                      {selectedNode && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedNode('')}>
                          Node: {selectedNode} ×
                        </Badge>
                      )}
                    </div>
                  </div>

                  {qemus.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No Virtual Machines Found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Virtual machines will appear here once your Proxmox nodes are connected.
                        </p>
                      </CardContent>
                    </Card>
                  ) : groupByNode && qemusByNode ? (
                    <div className="space-y-6">
                      {Array.from(qemusByNode.entries()).map(([nodeName, nodeQemus]) => (
                        <div key={nodeName}>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-blue-600" />
                            {nodeName}
                            <Badge variant="outline">{nodeQemus.length}</Badge>
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {nodeQemus.map((qemu) => (
                              <QemuCard key={qemu.id} qemu={qemu} navigate={navigate} getStatusColor={getStatusColor} formatUptime={formatUptime} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {qemus.map((qemu, idx) => (
                          <motion.div
                            key={qemu.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            <QemuCard qemu={qemu} navigate={navigate} getStatusColor={getStatusColor} formatUptime={formatUptime} />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {qemuTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQemuPage(p => Math.max(1, p - 1))}
                            disabled={qemuPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {qemuPage} of {qemuTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQemuPage(p => Math.min(qemuTotalPages, p + 1))}
                            disabled={qemuPage === qemuTotalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TransitionWrapper>
        </div>
      </div>
    </div>
  );
};

// LXC Card Component
interface LxcCardProps {
  lxc: ProxmoxLxcRecord;
  navigate: (path: string) => void;
  getStatusColor: (status: string) => string;
  formatUptime: (seconds: number) => string;
}

const LxcCard: React.FC<LxcCardProps> = ({ lxc, navigate, getStatusColor, formatUptime }) => (
  <Card 
    className="hover:shadow-lg transition-all cursor-pointer group"
    onClick={() => navigate(`/proxmox/lxc/${lxc.id}`)}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Box className="h-4 w-4 text-green-600" />
          {lxc.name}
        </CardTitle>
        <Badge variant="outline" className={getStatusColor(lxc.status)}>
          {lxc.status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">VMID</span>
          <span className="font-mono">{lxc.vmid}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">OS</span>
          <span>{lxc.ostype}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uptime</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatUptime(lxc.uptime)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Node</span>
          <span>{lxc.node}</span>
        </div>
        {lxc.agent_id && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Agent</span>
            <span 
              className="text-primary cursor-pointer hover:underline flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/agents/${lxc.agent_id}`);
              }}
            >
              View <ExternalLink className="h-3 w-3 ml-1" />
            </span>
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-end text-xs text-primary group-hover:underline">
        View Details <ChevronRight className="h-3 w-3 ml-1" />
      </div>
    </CardContent>
  </Card>
);

// QEMU Card Component
interface QemuCardProps {
  qemu: ProxmoxQemuRecord;
  navigate: (path: string) => void;
  getStatusColor: (status: string) => string;
  formatUptime: (seconds: number) => string;
}

const QemuCard: React.FC<QemuCardProps> = ({ qemu, navigate, getStatusColor, formatUptime }) => (
  <Card className="hover:shadow-lg transition-all">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-600" />
          {qemu.name}
        </CardTitle>
        <Badge variant="outline" className={getStatusColor(qemu.status)}>
          {qemu.status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">VMID</span>
          <span className="font-mono">{qemu.vmid}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">OS</span>
          <span>{qemu.ostype || 'Unknown'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uptime</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatUptime(qemu.uptime)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Node</span>
          <span>{qemu.node}</span>
        </div>
        {qemu.host_cpu && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Host CPU</span>
            <span className="truncate max-w-[120px]">{qemu.host_cpu}</span>
          </div>
        )}
        {qemu.agent_id && (
          <div className="mt-2 pt-2 border-t flex justify-end">
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/agents/${qemu.agent_id}`);
              }}
            >
              View Agent <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default withAuth(Proxmox);
