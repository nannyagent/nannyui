import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Server, ArrowLeft, Database, Cpu, Activity,
  MemoryStick, HardDrive, Wifi, Monitor,
  CheckCircle, AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AgentWithRelations, getAgentById, getAgentDetails, getAgentMetrics, type AgentMetric } from '@/services/agentService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<AgentWithRelations | null>(null);
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const agentData = await getAgentById(id);
        
        if (agentData) {
          const details = await getAgentDetails(agentData);
          setAgent(details);
          
          // Load metrics
          const metricsData = await getAgentMetrics(id);
          setMetrics(metricsData);
        } else {
          toast({
            title: "Error",
            description: "Agent not found",
            variant: "destructive",
          });
          navigate('/agents');
        }
      } catch (error) {
        console.error("Failed to load agent details:", error);
        toast({
          title: "Error",
          description: "Failed to load agent details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) return null;

  const latestMetric = metrics.length > 0 ? metrics[0] : agent.lastMetric;
  const hasMetrics = !!latestMetric;
  const osInfoString = `${agent.os_info || ''} ${agent.os_version || ''}`.trim();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 hover:pl-2 transition-all" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                agent.status === 'active' ? 'bg-green-100 text-green-600' : 
                agent.status === 'inactive' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-red-100 text-red-600'
              }`}>
                <Server className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{agent.hostname || 'Unnamed Agent'}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-sm">
                    ID: {agent.id}
                  </Badge>
                  <Badge 
                    variant={agent.status === 'active' ? 'default' : 
                            agent.status === 'inactive' ? 'secondary' : 'destructive'}
                    className="text-sm"
                  >
                    {agent.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {agent.status !== 'active' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {agent.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            {hasMetrics && latestMetric?.last_seen && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <Activity className="h-4 w-4" />
                Last updated: {new Date(latestMetric.last_seen).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Performance Metrics Overview */}
          {hasMetrics && latestMetric && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {Number(latestMetric.cpu_percent).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Cores: {latestMetric.cpu_cores || 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {Number(latestMetric.memory_percent).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {latestMetric.memory_used_gb.toFixed(1)} / {latestMetric.memory_total_gb.toFixed(1)} GB
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {Number(latestMetric.disk_usage_percent).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {latestMetric.disk_used_gb} / {latestMetric.disk_total_gb} GB
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Network Traffic</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 flex justify-between">
                      <span>In:</span>
                      <span>{latestMetric.network_in_gb?.toFixed(2) || 0} GB</span>
                    </div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 flex justify-between">
                      <span>Out:</span>
                      <span>{latestMetric.network_out_gb?.toFixed(2) || 0} GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Information */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Hostname</span>
                  <span className="font-medium">{agent.hostname || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Agent Version</span>
                  <Badge variant="secondary">
                    {agent.version || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">OS Info</span>
                  <span className="font-medium text-right">
                    {osInfoString || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Kernel Version</span>
                  <span className="font-medium text-right">{agent.kernel_version || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Architecture</span>
                  <span className="font-medium">{agent.arch || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Primary IP</span>
                  <span className="font-mono text-sm">
                    {agent.primary_ip || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Platform Family</span>
                  <span className="font-medium">
                    {agent.platform_family || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Last Seen</span>
                  <span className="text-sm">{agent.last_seen ? new Date(agent.last_seen).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Created At</span>
                  <span className="text-sm">{new Date(agent.created_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Performance Metrics */}
            <div className="lg:col-span-2 space-y-6">
              {hasMetrics && latestMetric && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Detailed Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Load Average */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-4 w-4" />
                        <span className="font-medium">Load Average</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xs text-muted-foreground mb-1">1 min</div>
                          <div className="font-mono font-medium">{latestMetric.load_avg_1min?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xs text-muted-foreground mb-1">5 min</div>
                          <div className="font-mono font-medium">{latestMetric.load_avg_5min?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xs text-muted-foreground mb-1">15 min</div>
                          <div className="font-mono font-medium">{latestMetric.load_avg_15min?.toFixed(2) || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Filesystems */}
                    {latestMetric.filesystems && latestMetric.filesystems.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="h-4 w-4" />
                          <span className="font-medium">Filesystems</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {latestMetric.filesystems.map((fs: any, idx: number) => (
                            <div key={idx} className="bg-muted/30 p-4 rounded-lg border text-sm">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium flex items-center gap-2">
                                  <HardDrive className="h-3 w-3" />
                                  {fs.mount_path}
                                </span>
                                <span className="text-muted-foreground text-xs font-mono">{fs.device}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>{fs.used_gb} GB / {fs.total_gb} GB</span>
                                <span>{fs.usage_percent}%</span>
                              </div>
                              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${fs.usage_percent > 90 ? 'bg-red-500' : fs.usage_percent > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${fs.usage_percent}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Metadata */}
              {agent.metadata && Object.keys(agent.metadata).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-md p-4 max-h-60 overflow-y-auto">
                      <pre className="text-xs font-mono">{JSON.stringify(agent.metadata, null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentDetail;
