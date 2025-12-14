import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface AgentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const AgentDeleteDialog = ({ 
  open, 
  onOpenChange, 
  agentName, 
  onConfirm, 
  isDeleting = false 
}: AgentDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Agent
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div>
                Are you sure you want to delete <strong>"{agentName}"</strong>?
              </div>
              <div className="text-sm text-muted-foreground">
                This action will permanently remove:
              </div>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                <li>The agent configuration and settings</li>
                <li>All historical metrics, patches and investigation data</li>
                <li>Authentication tokens and device codes</li>
                <li>Rate limits and heartbeat records</li>
                <li>All related activity logs</li>
              </ul>
              <div className="text-sm font-semibold text-destructive">
                This action cannot be undone.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Agent'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AgentDeleteDialog;