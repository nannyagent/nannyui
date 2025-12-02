import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RebootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
}

type RebootState = 'idle' | 'triggering' | 'waiting' | 'checking' | 'completed' | 'failed' | 'timeout';

export const RebootDialog: React.FC<RebootDialogProps> = ({
  open,
  onOpenChange,
  agentId,
}) => {
  const { toast } = useToast();
  const [state, setState] = useState<RebootState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const MAX_WAIT_TIME = 300; // 5 minutes in seconds

  useEffect(() => {
    if (state === 'waiting' || state === 'checking') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          const newProgress = Math.min((newTime / MAX_WAIT_TIME) * 100, 100);
          setProgress(newProgress);
          
          if (newTime >= MAX_WAIT_TIME) {
            setState('timeout');
            clearInterval(interval);
          }
          
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'waiting') {
      // Start checking after initial wait (60 seconds)
      const checkTimer = setTimeout(() => {
        setState('checking');
        startHealthChecks();
      }, 60000);

      return () => clearTimeout(checkTimer);
    }
  }, [state]);

  const startHealthChecks = async () => {
    const checkInterval = setInterval(async () => {
      try {
        // TODO: Call API to check agent health
        // const isOnline = await checkAgentHealth(agentId);
        const isOnline = false; // Placeholder
        
        if (isOnline) {
          setState('completed');
          clearInterval(checkInterval);
          toast({
            title: 'Success',
            description: 'Agent has rebooted successfully and is back online',
          });
        }
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 5000); // Check every 5 seconds

    // Store interval ID for cleanup
    return () => clearInterval(checkInterval);
  };

  const handleReboot = async () => {
    setState('triggering');
    setElapsedTime(0);
    setProgress(0);

    try {
      // TODO: Call API to trigger reboot
      // await triggerAgentReboot(agentId);
      
      toast({
        title: 'Reboot Triggered',
        description: 'Agent reboot command has been sent',
      });
      
      setState('waiting');
    } catch (error) {
      setState('failed');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger reboot',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (state !== 'waiting' && state !== 'checking') {
      setState('idle');
      setElapsedTime(0);
      setProgress(0);
      onOpenChange(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${state === 'waiting' || state === 'checking' ? 'animate-spin' : ''}`} />
            Reboot Agent
          </DialogTitle>
          <DialogDescription>
            Restart the agent node and monitor its recovery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {state === 'idle' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will reboot the agent node. The agent will be offline for approximately 1-2 minutes.
                Make sure no critical processes are running.
              </AlertDescription>
            </Alert>
          )}

          {(state === 'waiting' || state === 'checking' || state === 'timeout') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {state === 'waiting' && 'Waiting for agent to restart...'}
                  {state === 'checking' && 'Checking agent health...'}
                  {state === 'timeout' && 'Health check timeout'}
                </span>
                <span className="font-medium">{formatTime(elapsedTime)} / {formatTime(MAX_WAIT_TIME)}</span>
              </div>
              <Progress value={progress} />
              
              {state === 'timeout' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Agent did not come back online within 5 minutes. Please check the agent status manually.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {state === 'completed' && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                Agent has rebooted successfully and is back online!
              </AlertDescription>
            </Alert>
          )}

          {state === 'failed' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to trigger reboot. Please try again or check the agent status.
              </AlertDescription>
            </Alert>
          )}

          {state === 'triggering' && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        <DialogFooter>
          {state === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleReboot} variant="destructive">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reboot Now
              </Button>
            </>
          )}
          
          {(state === 'completed' || state === 'failed' || state === 'timeout') && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}

          {(state === 'waiting' || state === 'checking') && (
            <Button variant="outline" onClick={handleClose} disabled>
              Please wait...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
