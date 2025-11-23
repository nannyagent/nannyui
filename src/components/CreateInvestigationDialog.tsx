import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { createInvestigationFromAPI } from '@/services/investigationService';

export interface CreateInvestigationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  isAgentActive: boolean;
  userId: string;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      setError('Please enter an issue description');
      return;
    }

    if (!isAgentActive) {
      setError('Cannot create investigation for inactive agent');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createInvestigationFromAPI({
        agent_id: agentId,
        issue: issueDescription,
        priority: priority,
        initiated_by: userId,
        application_group: 'system',
      });

      console.log('Investigation created:', result);

      // Got the investigation_id - immediately redirect
      if (result?.investigation_id) {
        // Reset and close immediately
        setIssueDescription('');
        setPriority('medium');
        setLoading(false);
        onOpenChange(false);
        
        // Navigate to track progress
        setTimeout(() => {
          navigate(`/investigations/${result.investigation_id}`);
        }, 100);
      } else {
        throw new Error('No investigation_id returned from API');
      }
    } catch (err: any) {
      console.error('Error creating investigation:', err);
      
      // If timeout, investigation might still be running
      if (err?.message?.includes('timeout')) {
        setError('Investigation is taking longer than expected. Redirecting to Investigations page to check status...');
        setLoading(false);
        
        // Reset form and redirect to investigations list
        setTimeout(() => {
          setIssueDescription('');
          setPriority('medium');
          onOpenChange(false);
          navigate('/investigations');
        }, 2000);
      } else {
        setError(err?.message || 'Failed to create investigation. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIssueDescription('');
      setPriority('medium');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Investigation</DialogTitle>
          <DialogDescription>
            Launch a new investigation for agent: <span className="font-semibold">{agentName}</span>
            <br />
            <span className="text-xs text-muted-foreground mt-1 inline-block">
              The investigation will run in the background. You'll be redirected to track its progress.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isAgentActive && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Warning: This agent is currently inactive. Please activate it before creating an investigation.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
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
              disabled={loading || !isAgentActive}
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
              disabled={loading || !isAgentActive}
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isAgentActive || !issueDescription.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Investigation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvestigationDialog;
