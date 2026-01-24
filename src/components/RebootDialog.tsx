import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createRebootOperation } from '@/services/rebootService';

interface RebootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  lxcId?: string;
  agentName?: string;
  lxcName?: string;
}

type RebootState = 'idle' | 'triggering';

export const RebootDialog: React.FC<RebootDialogProps> = ({
  open,
  onOpenChange,
  agentId,
  lxcId,
  agentName,
  lxcName,
}) => {
  const { toast } = useToast();
  const [state, setState] = useState<RebootState>('idle');
  const [reason, setReason] = useState('');

  const targetName = lxcName ? `${lxcName} (LXC on ${agentName || 'Agent'})` : (agentName || 'Agent');

  const handleReboot = async () => {
    setState('triggering');

    try {
      await createRebootOperation(
        agentId,
        reason || `Manual reboot of ${targetName}`,
        lxcId
      );
      
      toast({
        title: 'Reboot Initiated',
        description: `Reboot command sent to ${targetName}. You will be notified when complete.`,
      });
      
      // Close dialog immediately
      handleClose();
    } catch (error) {
      setState('idle');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger reboot',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setState('idle');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${state === 'triggering' ? 'animate-spin' : ''}`} />
            Reboot {lxcId ? 'LXC Container' : 'Agent'}
          </DialogTitle>
          <DialogDescription>
            Restart {targetName} and monitor its recovery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {state === 'idle' && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will reboot {targetName}. {lxcId ? 'The container' : 'The agent'} will be offline for approximately 1-2 minutes.
                  Make sure no critical processes are running.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Monthly maintenance, security patches applied"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          {state === 'triggering' && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={state === 'triggering'}>
            Cancel
          </Button>
          <Button onClick={handleReboot} variant="destructive" disabled={state === 'triggering'}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reboot Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
