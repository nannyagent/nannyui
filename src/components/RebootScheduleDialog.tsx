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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Info, Clock, RefreshCw, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveRebootSchedule, getRebootSchedules, RebootSchedule } from '@/services/rebootService';
import { getAgents, Agent } from '@/services/agentService';

interface RebootScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  lxcId?: string;
  agentName?: string;
  lxcName?: string;
}

export const RebootScheduleDialog: React.FC<RebootScheduleDialogProps> = ({
  open,
  onOpenChange,
  agentId: propAgentId,
  lxcId,
  agentName: propAgentName,
  lxcName,
}) => {
  const { toast } = useToast();
  const [frequency, setFrequency] = useState('weekly');
  const [time, setTime] = useState('04:00');
  const [dayOfWeek, setDayOfWeek] = useState('0'); // Sunday
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [reason, setReason] = useState('Scheduled maintenance reboot');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingSchedule, setExistingSchedule] = useState<RebootSchedule | null>(null);
  
  // Agent selection state (when agentId not provided)
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(propAgentId || '');
  const [selectedAgentName, setSelectedAgentName] = useState<string>(propAgentName || '');

  const agentId = propAgentId || selectedAgentId;
  const agentName = propAgentName || selectedAgentName;
  const targetName = lxcName ? `${lxcName} (LXC on ${agentName || 'Agent'})` : (agentName || 'Agent');

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        // Load agents list if no agentId provided
        if (!propAgentId) {
          const agentsList = await getAgents();
          setAgents(agentsList);
        }

        // Load existing schedule if we have an agentId
        if (agentId) {
          const schedules = await getRebootSchedules(agentId, lxcId);
          if (schedules.length > 0) {
            const schedule = schedules[0];
            setExistingSchedule(schedule);
            setIsActive(schedule.is_active);
            setReason(schedule.reason || 'Scheduled maintenance reboot');
            
            // Parse cron expression
            const parts = schedule.cron_expression.split(' ');
            if (parts.length === 5) {
              const [minute, hour, dayMonth, , dayWeek] = parts;
              setTime(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
              
              if (dayWeek !== '*') {
                setFrequency('weekly');
                setDayOfWeek(dayWeek);
              } else if (dayMonth !== '*') {
                setFrequency('monthly');
                setDayOfMonth(dayMonth);
              } else {
                setFrequency('daily');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, propAgentId, agentId, lxcId]);

  const generateCron = () => {
    const [hour, minute] = time.split(':');
    
    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'weekly':
        return `${minute} ${hour} * * ${dayOfWeek}`;
      case 'monthly':
        return `${minute} ${hour} ${dayOfMonth} * *`;
      default:
        return '0 4 * * 0'; // Default: Sunday 4 AM
    }
  };

  const handleSave = async () => {
    const cronExpression = generateCron();
    
    setSaving(true);
    try {
      const success = await saveRebootSchedule(agentId, cronExpression, reason, isActive, lxcId);
      
      if (success) {
        toast({
          title: 'Success',
          description: `Reboot schedule for ${targetName} has been ${existingSchedule ? 'updated' : 'configured'}`,
        });
        onOpenChange(false);
      } else {
        throw new Error('Failed to save schedule');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save reboot schedule',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFrequency('weekly');
    setTime('04:00');
    setDayOfWeek('0');
    setDayOfMonth('1');
    setReason('Scheduled maintenance reboot');
    setIsActive(true);
    setExistingSchedule(null);
    setSelectedAgentId('');
    setSelectedAgentName('');
    setAgents([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Reboot
          </DialogTitle>
          <DialogDescription>
            Configure automatic reboot schedule for {targetName}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Agent selector when no agentId provided */}
            {!propAgentId && (
              <div className="grid gap-2">
                <Label>Agent</Label>
                <Select 
                  value={selectedAgentId} 
                  onValueChange={(value) => {
                    setSelectedAgentId(value);
                    const agent = agents.find(a => a.id === value);
                    setSelectedAgentName(agent?.hostname || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent...">
                      {selectedAgentId && (
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          {selectedAgentName}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          {agent.hostname}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="active-mode" className="flex flex-col gap-1">
                <span>Enable Schedule</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Turn on/off automatic reboot
                </span>
              </Label>
              <Switch
                id="active-mode"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="grid gap-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Time</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {frequency === 'weekly' && (
                <div className="grid gap-2">
                  <Label>Day of Week</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === 'monthly' && (
                <div className="grid gap-2">
                  <Label>Day of Month</Label>
                  <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Weekly maintenance window"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Generated Cron: <code className="text-foreground font-mono bg-background px-1 rounded">{generateCron()}</code></span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !agentId}>
            {saving ? 'Saving...' : (existingSchedule ? 'Update Schedule' : 'Save Schedule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
