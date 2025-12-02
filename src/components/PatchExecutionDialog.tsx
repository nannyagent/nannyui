import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Package,
  Terminal,
  RefreshCw
} from 'lucide-react';
import {
  triggerPatchExecution,
  checkAgentWebSocketConnection,
  type PatchExecutionResponse
} from '@/services/patchManagementService';
import { useToast } from '@/hooks/use-toast';

interface PatchExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  executionType: 'dry_run' | 'apply';
  shouldReboot?: boolean;
  onComplete?: () => void;
}

export const PatchExecutionDialog: React.FC<PatchExecutionDialogProps> = ({
  open,
  onOpenChange,
  agentId,
  agentName,
  executionType,
  shouldReboot = false,
  onComplete
}) => {
  const [status, setStatus] = useState<'checking' | 'triggering' | 'polling' | 'completed' | 'failed'>('checking');
  const [executionData, setExecutionData] = useState<PatchExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && !hasTriggered) {
      setHasTriggered(true);
      startExecution();
    } else if (!open) {
      resetState();
    }
  }, [open]);

  useEffect(() => {
    if (status === 'polling') {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  const resetState = () => {
    setStatus('checking');
    setExecutionData(null);
    setError(null);
    setProgress(0);
    setElapsedTime(0);
    setHasTriggered(false);
  };

  const startExecution = async () => {
    try {
      // Step 1: Check agent connection
      setStatus('checking');
      setProgress(10);
      
      const isConnected = await checkAgentWebSocketConnection(agentId);
      if (!isConnected) {
        throw new Error('Agent is not connected. Please ensure the agent is online and try again.');
      }

      // Step 2: Trigger execution ONCE via POST
      setStatus('triggering');
      setProgress(25);
      
      const response = await triggerPatchExecution({
        agent_id: agentId,
        execution_type: executionType,
        reboot: shouldReboot
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to trigger patch execution');
      }

      // Step 3: Start polling for status (database only, no more API calls)
      setStatus('polling');
      setProgress(40);
      pollExecutionStatus(response.execution_id);

    } catch (err) {
      console.error('Execution error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatus('failed');
      setProgress(0);
    }
  };

  const pollExecutionStatus = async (executionId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        
        // Query database directly instead of hitting the edge function
        const { supabase } = await import('@/lib/supabase');
        const { data: dbData, error: dbError } = await supabase
          .from('patch_executions')
          .select('*')
          .eq('id', executionId)
          .single();

        if (dbError) {
          throw new Error(`Failed to query execution status: ${dbError.message}`);
        }

        // Convert database row to PatchExecutionResponse format
        const data: PatchExecutionResponse = {
          success: true,
          execution_id: dbData.id,
          agent_id: dbData.agent_id,
          execution_type: dbData.execution_type,
          status: dbData.status,
          exit_code: dbData.exit_code,
          error_message: dbData.error_message,
          stdout_storage_path: dbData.stdout_storage_path,
          stderr_storage_path: dbData.stderr_storage_path,
          started_at: dbData.started_at,
          completed_at: dbData.completed_at,
          message: dbData.status === 'completed' ? 'Execution completed' : 'Execution in progress'
        };

        setExecutionData(data);

        // Update progress based on status
        if (data.status === 'running') {
          setProgress(Math.min(50 + (attempts * 2), 90));
        } else if (data.status === 'completed') {
          setProgress(100);
          setStatus('completed');
          
          toast({
            title: executionType === 'dry_run' ? 'Dry Run Complete' : 'Patches Applied',
            description: `${executionType === 'dry_run' ? 'Preview' : 'Update'} completed successfully`,
          });
          
          // Close dialog and call completion callback after a short delay
          setTimeout(() => {
            onOpenChange(false);
            
            if (onComplete) {
              onComplete();
            }
          }, 2000); // Wait 2 seconds so user can see the success message
          
          return;
        } else if (data.status === 'failed') {
          setStatus('failed');
          setError(data.error_message || 'Execution failed');
          toast({
            title: 'Execution Failed',
            description: data.error_message || 'An error occurred during execution',
            variant: 'destructive'
          });
          return;
        }

        // Continue polling if still running or pending
        if (attempts < maxAttempts && (data.status === 'pending' || data.status === 'running')) {
          setTimeout(() => poll(), 5000);
        } else if (attempts >= maxAttempts) {
          setStatus('failed');
          setError('Execution timed out after 5 minutes');
          toast({
            title: 'Timeout',
            description: 'Execution took too long. Check execution history for status.',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check execution status');
        setStatus('failed');
      }
    };

    poll();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (status === 'checking') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking agent connection...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }

    if (status === 'triggering') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Starting {executionType === 'dry_run' ? 'dry run' : 'patch application'}...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }

    if (status === 'polling') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>
                {executionData?.status === 'pending' ? 'Queued - waiting for agent...' : 'Executing on agent...'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{formatTime(elapsedTime)}</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              The agent is processing your request. This may take a few minutes depending on the number of packages.
            </AlertDescription>
          </Alert>

          {executionData?.status === 'running' && (
            <div className="text-sm text-muted-foreground">
              Status: <Badge variant="secondary">{executionData.status}</Badge>
            </div>
          )}
        </div>
      );
    }

    if (status === 'completed' && executionData) {
      const parsedOutput = executionData.output;
      
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              {executionType === 'dry_run' ? 'Dry Run Complete' : 'Patches Applied Successfully'}
            </span>
          </div>

          <Progress value={100} className="h-2" />

          {parsedOutput && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Packages Checked</div>
                  <div className="text-2xl font-bold">{parsedOutput.packages_checked || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {executionType === 'dry_run' ? 'Updates Available' : 'Packages Updated'}
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
                    {executionType === 'dry_run' ? 'Available Updates' : 'Updated Packages'}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 p-3 bg-muted/30 rounded-lg">
                    {parsedOutput.updated_packages.map((pkg: string, idx: number) => (
                      <div key={idx} className="text-sm font-mono">{pkg}</div>
                    ))}
                  </div>
                </div>
              )}

              {executionData.should_reboot && (
                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription>
                    {executionData.rebooted_at 
                      ? 'System was rebooted successfully' 
                      : 'A system reboot is recommended to apply all changes'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {executionData.stdout && !parsedOutput && (
            <div className="space-y-2">
              <div className="font-medium">Output</div>
              <pre className="p-3 bg-slate-950 text-green-400 rounded-lg text-xs overflow-x-auto max-h-60">
                {executionData.stdout}
              </pre>
            </div>
          )}
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Execution Failed</span>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {executionData?.stderr && (
            <div className="space-y-2">
              <div className="font-medium text-sm">Error Details</div>
              <pre className="p-3 bg-red-950 text-red-200 rounded-lg text-xs overflow-x-auto max-h-40">
                {executionData.stderr}
              </pre>
            </div>
          )}

          {executionData?.stdout && (
            <div className="space-y-2">
              <div className="font-medium text-sm">Output</div>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg text-xs overflow-x-auto max-h-40">
                {executionData.stdout}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {executionType === 'dry_run' ? 'Dry Run Preview' : 'Apply Patches'}
          </DialogTitle>
          <DialogDescription>
            {executionType === 'dry_run' 
              ? `Preview available updates for ${agentName} without making any changes`
              : `Applying patches to ${agentName}${shouldReboot ? ' with reboot' : ''}`
            }
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <div className="flex justify-end gap-2 mt-4">
          {(status === 'completed' || status === 'failed') && (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
