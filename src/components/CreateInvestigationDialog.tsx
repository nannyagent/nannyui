import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Search, XCircle } from 'lucide-react';
import { createInvestigationFromAPI } from '@/services/investigationService';

export interface CreateInvestigationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  isAgentActive: boolean;
  userId: string;
}

type Status = 'idle' | 'launching' | 'waiting' | 'success' | 'error';

const CreateInvestigationDialog: React.FC<CreateInvestigationDialogProps> = ({
  open,
  onOpenChange,
  agentId,
  agentName,
  isAgentActive,
  userId,
}) => {
  const navigate = useNavigate();
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [, setInvestigationId] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setError(null);
      setProgress(0);
      setElapsedTime(0);
      setInvestigationId(null);
      hasSubmittedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open]);

  // Elapsed time counter
  useEffect(() => {
    if (status === 'launching' || status === 'waiting') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setProgress(prev => Math.min(prev + 2, 90));
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [status]);

  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      setError('Please enter an issue description');
      return;
    }

    if (!isAgentActive) {
      setError('Cannot create investigation for inactive agent');
      return;
    }

    // Prevent double submission
    if (hasSubmittedRef.current) {
      return;
    }
    hasSubmittedRef.current = true;

    setStatus('launching');
    setError(null);
    setProgress(10);

    try {
      setProgress(30);
      setStatus('waiting');
      
      const result = await createInvestigationFromAPI({
        agent_id: agentId,
        issue: issueDescription,
        priority: priority,
        initiated_by: userId,
        application_group: 'system',
      });

      console.log('Investigation created:', result);

      if (result?.investigation_id) {
        setInvestigationId(result.investigation_id);
        setStatus('success');
        setProgress(100);

        // Navigate after brief success display
        setTimeout(() => {
          setIssueDescription('');
          setPriority('medium');
          onOpenChange(false);
          navigate(`/investigations/${result.investigation_id}`);
        }, 1500);
      } else {
        throw new Error('No investigation_id returned from API');
      }
    } catch (err: any) {
      console.error('Error creating investigation:', err);
      hasSubmittedRef.current = false;
      setStatus('error');
      setProgress(0);
      
      // Handle specific error types
      const errorMsg = err?.message || 'Failed to create investigation';
      if (errorMsg.includes('websocket') || errorMsg.includes('WebSocket') || errorMsg.includes('not connected')) {
        setError('Agent is not connected via WebSocket. Please ensure the agent is online and connected, then try again.');
      } else if (errorMsg.includes('timeout')) {
        setError('Request timed out. The investigation may still be processing. Please check the Investigations page.');
      } else if (errorMsg.includes('AI') || errorMsg.includes('model') || errorMsg.includes('inference')) {
        setError('AI backend is currently unavailable. Please try again later.');
      } else {
        setError(errorMsg);
      }
    }
  };

  const handleClose = () => {
    if (status === 'launching' || status === 'waiting') {
      return; // Don't allow closing during processing
    }
    setIssueDescription('');
    setPriority('medium');
    setError(null);
    setStatus('idle');
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (status === 'launching' || status === 'waiting') {
      return (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">
                {status === 'launching' ? 'Launching Investigation...' : 'Waiting for response...'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take up to 30 seconds as the AI analyzes your request
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Elapsed: {formatTime(elapsedTime)}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Please do not close this dialog
          </p>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg text-green-600">Investigation Launched!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Redirecting to investigation details...
              </p>
            </div>
          </div>
          <Progress value={100} className="h-2" />
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg text-red-600">Failed to Launch Investigation</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                {error}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => {
              setStatus('idle');
              setError(null);
              hasSubmittedRef.current = false;
            }}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // Default: idle state - show form
    return (
      <>
        <div className="space-y-4 py-4">
          {!isAgentActive && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Warning: This agent is currently inactive. Please activate it before creating an investigation.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issue">Issue Description *</Label>
            <Textarea
              id="issue"
              placeholder="Describe the issue you want to investigate... (e.g., 'High CPU usage on production server', 'Memory leak in application')"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={!isAgentActive}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what you want the agent to investigate.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as any)}
              disabled={!isAgentActive}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isAgentActive || !issueDescription.trim()}
          >
            Create Investigation
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Investigation</DialogTitle>
          <DialogDescription>
            Launch a new investigation for agent: <span className="font-semibold">{agentName}</span>
            {status === 'idle' && (
              <span className="text-xs text-muted-foreground mt-1 block">
                The investigation will run in the background. You'll be redirected to track its progress.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvestigationDialog;
