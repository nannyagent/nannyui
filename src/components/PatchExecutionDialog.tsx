import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  runPatchCheck,
  applyPatches,
  waitForPatchOperation,
  type PatchOperation
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
  lxcId?: string;
}

type ExecutionStatus = 'idle' | 'checking' | 'triggering' | 'polling' | 'completed' | 'failed' | 'timeout';

export const PatchExecutionDialog: React.FC<PatchExecutionDialogProps> = ({
  open,
  onOpenChange,
  agentId,
  agentName,
  executionType,
  shouldReboot = false,
  lxcId,
  // onComplete // Unused
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<PatchOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const hasTriggeredRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startExecution = useCallback(async () => {
    try {
      // Step 1: Trigger execution
      setStatus('triggering');
      setProgress(25);
      
      let id: string;
      if (executionType === 'dry_run') {
        id = await runPatchCheck(agentId, lxcId);
      } else {
        // Assuming apply means update all if no packages specified
        id = await applyPatches(agentId, [], lxcId); 
      }

      setExecutionId(id);

      // Step 2: Start polling for status
      setStatus('polling');
      setProgress(40);
      
      const result = await waitForPatchOperation(id, (currentStatus) => {
        if (currentStatus === 'running') {
           setProgress(60);
        }
      });

      if (result) {
        setExecutionData(result);
        if (result.status === 'completed') {
          setStatus('completed');
          setProgress(100);
          toast({
            title: executionType === 'dry_run' ? 'Check Complete' : 'Patches Applied',
            description: 'Operation completed successfully',
          });
          
          setTimeout(() => {
            onOpenChange(false);
            navigate(`/patch-execution/${id}`); 
          }, 1500);
        } else {
          setStatus('failed');
          setError('Operation failed');
          toast({
            title: 'Execution Failed',
            description: 'An error occurred',
            variant: 'destructive'
          });
        }
      } else {
        setStatus('timeout');
        setError('Operation timed out');
        toast({
            title: 'Taking longer than expected',
            description: 'Navigating to execution details page...',
        });
        setTimeout(() => {
            onOpenChange(false);
            navigate(`/patch-execution/${id}`);
        }, 1500);
      }

    } catch (err) {
      console.error('Execution error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatus('failed');
      setProgress(0);
    }
  }, [agentId, executionType, navigate, onOpenChange, toast]);

  // Start execution when dialog opens
  useEffect(() => {
    if (open && !hasTriggeredRef.current && status === 'idle') {
      hasTriggeredRef.current = true;
      startExecution();
    }
  }, [open, status, startExecution]);

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

          {executionData?.metadata?.should_reboot && (
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                {executionData.metadata?.rebooted_at 
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
