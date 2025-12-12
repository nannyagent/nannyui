import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RefreshCw,
  ExternalLink,
  Clock
} from 'lucide-react';
import {
  triggerPatchExecution,
  checkAgentWebSocketConnection,
  type PatchExecutionResponse
} from '@/services/patchManagementService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface PatchExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  executionType: 'dry_run' | 'apply';
  shouldReboot?: boolean;
  onComplete?: () => void;
}

type ExecutionStatus = 'idle' | 'checking' | 'triggering' | 'polling' | 'completed' | 'failed' | 'timeout';

export const PatchExecutionDialog: React.FC<PatchExecutionDialogProps> = ({
  open,
  onOpenChange,
  agentId,
  agentName,
  executionType,
  shouldReboot = false,
  onComplete
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<PatchExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const hasTriggeredRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Start execution when dialog opens
  useEffect(() => {
    if (open && !hasTriggeredRef.current && status === 'idle') {
      hasTriggeredRef.current = true;
      startExecution();
    }
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Clear all timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      
      // Reset state after animation
      setTimeout(() => {
        setStatus('idle');
        setExecutionId(null);
        setExecutionData(null);
        setError(null);
        setProgress(0);
        setElapsedTime(0);
        hasTriggeredRef.current = false;
      }, 300);
    }
  }, [open]);

  // Elapsed time counter
  useEffect(() => {
    if (status === 'checking' || status === 'triggering' || status === 'polling') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [status]);

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

      setExecutionId(response.execution_id);

      // Step 3: Start polling for status with 60s timeout
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

  const pollExecutionStatus = async (execId: string) => {
    const maxWaitSeconds = 60;
    const pollIntervalMs = 3000;
    let pollCount = 0;
    const maxPolls = Math.ceil((maxWaitSeconds * 1000) / pollIntervalMs);

    const poll = async () => {
      try {
        pollCount++;
        
        // Check timeout
        if (pollCount > maxPolls) {
          setStatus('timeout');
          setExecutionId(execId);
          toast({
            title: 'Taking longer than expected',
            description: 'Check the execution details page for status.',
          });
          return;
        }

        // Query database directly
        const { data: dbData, error: dbError } = await supabase
          .from('patch_executions')
          .select('*')
          .eq('id', execId)
          .single();

        if (dbError) {
          throw new Error(`Failed to query execution status: ${dbError.message}`);
        }

        // Convert database row to response format
        const data: PatchExecutionResponse = {
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
          should_reboot: dbData.should_reboot,
          rebooted_at: dbData.rebooted_at,
          output: null,
          stdout: null,
          stderr: null
        };

        setExecutionData(data);

        // Update progress
        const progressValue = Math.min(40 + (pollCount * 3), 95);
        setProgress(progressValue);

        if (data.status === 'completed') {
          setProgress(100);
          setStatus('completed');
          
          toast({
            title: executionType === 'dry_run' ? 'Dry Run Complete' : 'Patches Applied',
            description: 'Execution completed successfully',
          });
          
          if (onComplete) {
            onComplete();
          }
          return;
        } 
        
        if (data.status === 'failed') {
          setStatus('failed');
          setError(data.error_message || 'Execution failed');
          toast({
            title: 'Execution Failed',
            description: data.error_message || 'An error occurred',
            variant: 'destructive'
          });
          return;
        }

        // Continue polling if still running or pending
        if (data.status === 'pending' || data.status === 'running') {
          pollTimeoutRef.current = setTimeout(() => poll(), pollIntervalMs);
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

  const handleViewDetails = () => {
    if (executionId) {
      onOpenChange(false);
      navigate(`/patch-execution/${executionId}`);
    }
  };

  const handleClose = () => {
    // Only allow closing in certain states
    if (status === 'checking' || status === 'triggering') {
      return; // Can't close during initial phases
    }
    onOpenChange(false);
  };

  const renderContent = () => {
    if (status === 'idle' || status === 'checking') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Checking agent connection...</p>
              <p className="text-sm text-muted-foreground mt-1">Verifying {agentName} is online</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }

    if (status === 'triggering') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Terminal className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Starting {executionType === 'dry_run' ? 'dry run' : 'patch application'}...</p>
              <p className="text-sm text-muted-foreground mt-1">Sending command to agent</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }

    if (status === 'polling') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Package className="h-8 w-8 text-amber-600 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium">
                {executionData?.status === 'pending' ? 'Queued - waiting for agent...' : 'Processing packages...'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Elapsed: {formatTime(elapsedTime)}
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <Alert className="bg-muted/50">
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              This may take a few minutes depending on the number of packages. 
              Timeout in {60 - elapsedTime > 0 ? 60 - elapsedTime : 0}s.
            </AlertDescription>
          </Alert>

          {executionData?.status && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="secondary">{executionData.status}</Badge>
            </div>
          )}
        </div>
      );
    }

    if (status === 'timeout') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-amber-600">Taking Longer Than Expected</p>
              <p className="text-sm text-muted-foreground mt-1">
                The execution is still processing. Please check the details page for status.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <Button onClick={handleViewDetails} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Execution Details
            </Button>
          </div>
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-green-600">
                {executionType === 'dry_run' ? 'Dry Run Complete' : 'Patches Applied Successfully'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Completed in {formatTime(elapsedTime)}
              </p>
            </div>
          </div>

          <Progress value={100} className="h-2" />

          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-sm text-muted-foreground">
              View detailed results including package versions and logs
            </p>
            <Button onClick={handleViewDetails} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Execution Details
            </Button>
          </div>

          {executionData?.should_reboot && (
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
      );
    }

    if (status === 'failed') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">Execution Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Something went wrong during the operation
              </p>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {executionId && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Check detailed logs for more information
              </p>
              <Button variant="outline" onClick={handleViewDetails} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Execution Details
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {executionType === 'dry_run' ? (
              <>
                <Package className="h-5 w-5" />
                Dry Run Preview
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Apply Patches
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {executionType === 'dry_run' 
              ? `Preview available updates for ${agentName}`
              : `Applying patches to ${agentName}${shouldReboot ? ' with reboot' : ''}`
            }
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={status === 'checking' || status === 'triggering'}
          >
            {status === 'completed' || status === 'failed' || status === 'timeout' ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
