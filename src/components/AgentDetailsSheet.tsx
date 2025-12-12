
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
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type AgentWithRelations } from '@/services/agentService';

interface AgentDetailsProps {
  agent: AgentWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AgentDetailsSheet = ({ agent, open, onOpenChange }: AgentDetailsProps) => {
  if (!agent) return null;

  const lastMetric = agent.lastMetric;
  const hasMetrics = !!lastMetric;
  
  // Helper function to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper function to get OS info from both old and new formats
  const getOSInfo = () => {
    if (lastMetric?.os_info) {
      // Handle both old and new formats
      if (lastMetric.os_info.platform) {
        // New format: {platform, kernel_arch, kernel_version, platform_family, platform_version}
        return {
          name: lastMetric.os_info.platform || 'Unknown',
          version: lastMetric.os_info.platform_version || 'Unknown',
          architecture: lastMetric.os_info.kernel_arch || 'Unknown',
          platform: lastMetric.os_info.platform || 'Unknown',
          family: lastMetric.os_info.platform_family || 'Unknown',
          kernelVersion: lastMetric.os_info.kernel_version || lastMetric.kernel_version || 'Unknown'
        };
      } else if (lastMetric.os_info.name) {
        // Old format: {name, family, version, platform, architecture}
        return {
          name: lastMetric.os_info.name || 'Unknown',
          version: lastMetric.os_info.version || 'Unknown',
          architecture: lastMetric.os_info.architecture || 'Unknown',
          platform: lastMetric.os_info.platform || 'Unknown',
          family: lastMetric.os_info.family || 'Unknown',
          kernelVersion: lastMetric.kernel_version || 'Unknown'
        };
      }
    }
    // Fallback to agent data if no metrics
    return {
      name: 'Unknown',
      version: agent.os_version || 'Unknown',
      architecture: 'Unknown',
      platform: 'Unknown', 
      family: 'Unknown',
      kernelVersion: agent.kernel_version || 'Unknown'
    };
  };

  const osInfo = getOSInfo();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                agent.status === 'active' ? 'bg-green-100 text-green-600' : 
                agent.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-red-100 text-red-600'
              }`}>
                <Server className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-xl">{agent.name || 'Unnamed Agent'}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  {agent.fingerprint && (
                    <Badge variant="secondary" className="text-xs">
                      ID: {agent.fingerprint.substring(0, 12)}...
                    </Badge>
                  )}
                  <Badge 
                    variant={agent.status === 'active' ? 'default' : 
                            agent.status === 'pending' ? 'secondary' : 'destructive'}
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
            {hasMetrics && lastMetric.recorded_at && (
              <span className="flex items-center gap-1 text-sm">
                <Activity className="h-3 w-3" />
                Last updated: {new Date(lastMetric.recorded_at).toLocaleString()}
              </span>
            )}
            {!hasMetrics && (
              <span className="text-muted-foreground">No metrics data available</span>
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Performance Metrics Overview */}
          {hasMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lastMetric.cpu_percent !== null && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {Number(lastMetric.cpu_percent).toFixed(1)}%
                  </div>
                  {lastMetric.load1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Load: {Number(lastMetric.load1).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {lastMetric.memory_mb !== null && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {(lastMetric.memory_mb / 1024).toFixed(1)} GB
                  </div>
                </div>
              )}

              {lastMetric.disk_percent !== null && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Disk</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {Number(lastMetric.disk_percent).toFixed(1)}%
                  </div>
                </div>
              )}

              {(lastMetric.network_in_kbps || lastMetric.network_out_kbps) && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <div className="space-y-1">
                    {lastMetric.network_in_kbps && (
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        ↓ {Number(lastMetric.network_in_kbps).toFixed(1)} KB/s
                      </div>
                    )}
                    {lastMetric.network_out_kbps && (
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        ↑ {Number(lastMetric.network_out_kbps).toFixed(1)} KB/s
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  <span className="text-sm text-muted-foreground">Agent Name</span>
                  <span className="font-medium">{agent.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Agent Version</span>
                  <Badge variant="secondary">
                    {lastMetric?.agent_version || agent.version || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Operating System</span>
                  <span className="font-medium">
                    {osInfo.name} {osInfo.version}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Architecture</span>
                  <span className="font-medium">{osInfo.architecture}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kernel Version</span>
                  <span className="font-medium">{osInfo.kernelVersion}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant={agent.status === 'active' ? 'default' : 
                            agent.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {agent.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {agent.status !== 'active' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {agent.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IP Address</span>
                  <span className="font-mono text-sm">
                    {lastMetric?.ip_address || agent.ip_address || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="font-medium">
                    {lastMetric?.location || agent.location || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <span className="font-medium">{osInfo.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Family</span>
                  <span className="font-medium">{osInfo.family}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Performance Metrics */}
          {hasMetrics && (
            <div className="bg-muted/40 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Details
              </h3>
              
              <div className="space-y-6">
                {/* CPU Details */}
                {lastMetric.cpu_percent !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        <span className="font-medium">CPU Usage</span>
                      </div>
                      <span className="text-lg font-bold">{Number(lastMetric.cpu_percent).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted/30 h-2 rounded-full">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(Number(lastMetric.cpu_percent), 100)}%` }}
                      />
                    </div>
                    {(lastMetric.load1 || lastMetric.load5 || lastMetric.load15) && (
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {lastMetric.load1 && <span>1min: {Number(lastMetric.load1).toFixed(2)}</span>}
                        {lastMetric.load5 && <span>5min: {Number(lastMetric.load5).toFixed(2)}</span>}
                        {lastMetric.load15 && <span>15min: {Number(lastMetric.load15).toFixed(2)}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Memory Details */}
                {lastMetric.memory_mb !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4" />
                        <span className="font-medium">Memory Usage</span>
                      </div>
                      <span className="text-lg font-bold">{(lastMetric.memory_mb / 1024).toFixed(1)} GB</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lastMetric.memory_mb.toLocaleString()} MB used
                    </div>
                  </div>
                )}

                {/* Disk Details */}
                {lastMetric.disk_percent !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <span className="font-medium">Disk Usage</span>
                      </div>
                      <span className="text-lg font-bold">{Number(lastMetric.disk_percent).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted/30 h-2 rounded-full">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(Number(lastMetric.disk_percent), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* IP Address Details */}
                {lastMetric.ip_address !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <span className="font-medium">Disk Usage</span>
                      </div>
                      <span className="text-lg font-bold">{Number(lastMetric.disk_percent).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted/30 h-2 rounded-full">
                      <div className="text-sm text-muted-foreground">
                      {lastMetric.ip_address}
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Administrative Information */}
          <div className="bg-muted/40 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Administrative
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Agent ID</span>
                  <span className="font-mono text-xs bg-background px-2 py-1 rounded max-w-[200px] truncate">
                    {agent.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fingerprint</span>
                  <span className="font-mono text-xs bg-background px-2 py-1 rounded max-w-[200px] truncate">
                    {agent.fingerprint || 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Owner ID</span>
                  <span className="font-mono text-xs bg-background px-2 py-1 rounded max-w-[200px] truncate">
                    {agent.owner}
                  </span>
                </div>
                {agent.oauth_client_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">OAuth Client</span>
                    <span className="font-mono text-xs bg-background px-2 py-1 rounded max-w-[200px] truncate">
                      {agent.oauth_client_id}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{new Date(agent.created_at).toLocaleString()}</span>
                </div>
                {agent.last_seen && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Seen</span>
                    <span className="text-sm">{new Date(agent.last_seen).toLocaleString()}</span>
                  </div>
                )}
                {hasMetrics && lastMetric.recorded_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Metrics</span>
                    <span className="text-sm">{new Date(lastMetric.recorded_at).toLocaleString()}</span>
                  </div>
                )}
                {agent.oauth_token_expires_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Token Expires</span>
                    <span className="text-sm">{new Date(agent.oauth_token_expires_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            
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
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Terminal className="h-4 w-4 mr-2" />
              Run Command
            </Button>
            <Button variant="outline" className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentDetailsSheet;
