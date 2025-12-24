
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { 
  Server, X, Terminal, Database, Cpu, Activity,
  MemoryStick, HardDrive, Wifi, Monitor,
  Settings, CheckCircle, AlertCircle,
  TrendingUp, Clock, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type AgentWithRelations, getAgentMetrics, type AgentMetric } from '@/services/agentService';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgentDetailsProps {
  agent: AgentWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AgentDetailsSheet = ({ agent, open, onOpenChange }: AgentDetailsProps) => {
  const [metrics, setMetrics] = React.useState<AgentMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = React.useState(false);

  React.useEffect(() => {
    if (open && agent?.id) {
      setLoadingMetrics(true);
      getAgentMetrics(agent.id).then(data => {
        setMetrics(data);
        setLoadingMetrics(false);
      });
    }
  }, [open, agent?.id]);

  if (!agent) return null;

  const latestMetric = metrics.length > 0 ? metrics[0] : agent.lastMetric;
  const hasMetrics = !!latestMetric;
  
  // Helper function to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const osInfoString = `${agent.os_info || ''} ${agent.os_version || ''}`.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-2xl overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                agent.status === 'active' ? 'bg-green-100 text-green-600' : 
                agent.status === 'inactive' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-red-100 text-red-600'
              }`}>
                <Server className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-xl">{agent.hostname || 'Unnamed Agent'}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    ID: {agent.id}
                  </Badge>
                  <Badge 
                    variant={agent.status === 'active' ? 'default' : 
                            agent.status === 'inactive' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {agent.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {agent.status !== 'active' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {agent.status}
                  </Badge>
                </div>
              </div>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription>
            {hasMetrics && latestMetric?.created_at && (
              <span className="flex items-center gap-1 text-sm">
                <Activity className="h-3 w-3" />
                Last updated: {new Date(latestMetric.created_at).toLocaleString()}
              </span>
            )}
            {!hasMetrics && (
              <span className="text-muted-foreground">No metrics data available</span>
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Performance Metrics Overview */}
          {hasMetrics && latestMetric && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {Number(latestMetric.cpu_percent).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cores: {latestMetric.cpu_cores || 'N/A'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {Number(latestMetric.memory_percent).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {latestMetric.memory_used_gb.toFixed(1)} / {latestMetric.memory_total_gb.toFixed(1)} GB
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Disk</span>
                </div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {Number(latestMetric.disk_usage_percent).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {latestMetric.disk_used_gb} / {latestMetric.disk_total_gb} GB
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    ↓ {latestMetric.network_in_gb?.toFixed(2) || 0} GB
                  </div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    ↑ {latestMetric.network_out_gb?.toFixed(2) || 0} GB
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-muted/40 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hostname</span>
                  <span className="font-medium">{agent.hostname || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Agent Version</span>
                  <Badge variant="secondary">
                    {agent.version || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">OS Info</span>
                  <span className="font-medium text-right">
                    {osInfoString || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kernel Version</span>
                  <span className="font-medium text-right">{agent.kernel_version || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Architecture</span>
                  <span className="font-medium">{agent.arch || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Primary IP</span>
                  <span className="font-mono text-sm">
                    {agent.primary_ip || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform Family</span>
                  <span className="font-medium">
                    {agent.platform_family || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Seen</span>
                  <span className="text-sm">{agent.last_seen ? new Date(agent.last_seen).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created At</span>
                  <span className="text-sm">{new Date(agent.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Performance Metrics */}
          {hasMetrics && latestMetric && (
            <div className="bg-muted/40 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Detailed Metrics
              </h3>
              
              <div className="space-y-6">
                {/* Load Average */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Load Average</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="bg-background px-3 py-1 rounded border">
                      <span className="text-muted-foreground mr-2">1 min:</span>
                      <span className="font-mono">{latestMetric.load_avg_1min?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="bg-background px-3 py-1 rounded border">
                      <span className="text-muted-foreground mr-2">5 min:</span>
                      <span className="font-mono">{latestMetric.load_avg_5min?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="bg-background px-3 py-1 rounded border">
                      <span className="text-muted-foreground mr-2">15 min:</span>
                      <span className="font-mono">{latestMetric.load_avg_15min?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Filesystems */}
                {latestMetric.filesystems && latestMetric.filesystems.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">Filesystems</span>
                    </div>
                    <div className="space-y-2">
                      {latestMetric.filesystems.map((fs: any, idx: number) => (
                        <div key={idx} className="bg-background p-3 rounded border text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{fs.mount_path}</span>
                            <span className="text-muted-foreground">{fs.device}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{fs.used_gb} GB used / {fs.total_gb} GB total</span>
                            <span>{fs.usage_percent}%</span>
                          </div>
                          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${fs.usage_percent > 90 ? 'bg-red-500' : fs.usage_percent > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${fs.usage_percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Metadata */}
          {agent.metadata && Object.keys(agent.metadata).length > 0 && (
            <div className="mt-4">
              <Separator className="mb-3" />
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Metadata
              </h4>
              <div className="bg-background rounded-md p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs font-mono">{JSON.stringify(agent.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentDetailsSheet;
