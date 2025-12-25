import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package,
  X,
  Plus,
  Loader2,
  Info
} from 'lucide-react';
import {
  getPackageExceptions,
  addPackageException,
  removePackageException,
  type PackageException
} from '@/services/patchManagementService';
import { useToast } from '@/hooks/use-toast';

interface PackageExceptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
}

export const PackageExceptionsDialog: React.FC<PackageExceptionsDialogProps> = ({
  open,
  onOpenChange,
  agentId,
  agentName
}) => {
  const [exceptions, setExceptions] = useState<PackageException[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newPackages, setNewPackages] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const loadExceptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPackageExceptions(agentId);
      setExceptions(data);
    } catch (error) {
      console.error('Error loading exceptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load package exceptions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [agentId, toast]);

  useEffect(() => {
    if (open) {
      loadExceptions();
    }
  }, [open, loadExceptions]);



  const handleAdd = async () => {
    const packageNames = newPackages
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (packageNames.length === 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter at least one package name',
        variant: 'destructive'
      });
      return;
    }

    setAdding(true);
    try {
      // Add each package as a separate exception
      for (const packageName of packageNames) {
        await addPackageException(agentId, packageName, reason || undefined);
      }

      toast({
        title: 'Success',
        description: `Added ${packageNames.length} package exception(s)`,
      });

      setNewPackages('');
      setReason('');
      await loadExceptions();
    } catch (error) {
      console.error('Error adding exception:', error);
      toast({
        title: 'Error',
        description: 'Failed to add package exceptions',
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (exceptionId: string) => {
    try {
      await removePackageException(exceptionId);
      toast({
        title: 'Success',
        description: 'Package exception removed',
      });
      await loadExceptions();
    } catch (error) {
      console.error('Error removing exception:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove package exception',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Package Exceptions</DialogTitle>
          <DialogDescription>
            Manage packages that should be excluded from updates for {agentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Excluded packages will not be updated during patch operations. Enter package names separated by commas.
            </AlertDescription>
          </Alert>

          {/* Add New Exceptions */}
          <div className="space-y-3 p-4 border rounded-lg">
            <Label htmlFor="packages">Package Names</Label>
            <Input
              id="packages"
              placeholder="e.g., nginx, apache2, postgresql"
              value={newPackages}
              onChange={(e) => setNewPackages(e.target.value)}
              disabled={adding}
            />

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are these packages excluded?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={adding}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleAdd} 
              disabled={adding || !newPackages.trim()}
              className="w-full"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exceptions
                </>
              )}
            </Button>
          </div>

          {/* Current Exceptions */}
          <div className="space-y-2">
            <Label>Current Exceptions ({exceptions.length})</Label>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : exceptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No package exceptions configured</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-mono font-medium">{exception.package_name}</span>
                      </div>
                      {exception.reason && (
                        <p className="text-sm text-muted-foreground mt-1">{exception.reason}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Added {new Date(exception.created).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(exception.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
