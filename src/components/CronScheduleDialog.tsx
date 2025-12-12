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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveCronSchedule } from '@/services/patchManagementService';

interface CronScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
}

const PRESET_SCHEDULES = [
  { label: 'Daily at midnight', value: '0 0 * * *', description: 'Every day at 00:00' },
  { label: 'Daily at 2 AM', value: '0 2 * * *', description: 'Every day at 02:00' },
  { label: 'Weekly on Sunday at 2 AM', value: '0 2 * * 0', description: 'Every Sunday at 02:00' },
  { label: 'Weekly on Monday at 2 AM', value: '0 2 * * 1', description: 'Every Monday at 02:00' },
  { label: 'Monthly on 1st at 2 AM', value: '0 2 1 * *', description: 'First day of every month at 02:00' },
  { label: 'Custom', value: 'custom', description: 'Enter your own cron expression' },
];

export const CronScheduleDialog: React.FC<CronScheduleDialogProps> = ({
  open,
  onOpenChange,
  agentId,
}) => {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SCHEDULES[0].value);
  const [customCron, setCustomCron] = useState('');
  const [executionType, setExecutionType] = useState<'dry_run' | 'apply'>('apply');
  const [withReboot, setWithReboot] = useState(false);
  const [saving, setSaving] = useState(false);

  const getCronExpression = () => {
    return selectedPreset === 'custom' ? customCron : selectedPreset;
  };

  const handleSave = async () => {
    const cronExpression = getCronExpression();
    
    if (!cronExpression || cronExpression.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please enter a valid cron expression',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await saveCronSchedule({
        agent_id: agentId,
        cron_expression: cronExpression,
        execution_type: executionType,
        with_reboot: withReboot,
      });
      
      toast({
        title: 'Success',
        description: 'Patch schedule has been configured',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save schedule',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Patch Updates
          </DialogTitle>
          <DialogDescription>
            Configure automatic patch execution using cron expressions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preset Selection */}
          <div className="space-y-2">
            <Label htmlFor="preset">Schedule Preset</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger id="preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_SCHEDULES.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    <div className="flex flex-col">
                      <span>{preset.label}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Cron Expression */}
          {selectedPreset === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="cron">Cron Expression</Label>
              <Input
                id="cron"
                placeholder="0 2 * * *"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Format: minute hour day month weekday (e.g., "0 2 * * *" = 2 AM daily)</span>
              </p>
            </div>
          )}

          {/* Execution Type */}
          <div className="space-y-2">
            <Label htmlFor="exec-type">Execution Type</Label>
            <Select value={executionType} onValueChange={(v) => setExecutionType(v as 'dry_run' | 'apply')}>
              <SelectTrigger id="exec-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dry_run">Dry Run (Check only)</SelectItem>
                <SelectItem value="apply">Apply Patches</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reboot Option */}
          {executionType === 'apply' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reboot"
                checked={withReboot}
                onChange={(e) => setWithReboot(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="reboot" className="cursor-pointer">
                Reboot after applying patches
              </Label>
            </div>
          )}

          {/* Preview */}
          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-sm font-medium">Schedule Preview:</p>
            <p className="text-xs text-muted-foreground">
              Cron: <code className="bg-background px-1 py-0.5 rounded">{getCronExpression()}</code>
            </p>
            <p className="text-xs text-muted-foreground">
              Action: {executionType === 'dry_run' ? 'Check for updates' : 'Apply patches'}
              {withReboot && ' + Reboot'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
