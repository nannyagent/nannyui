import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Eye,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  listPatchExecutions,
  type PatchExecution
} from '@/services/patchManagementService';

interface PatchExecutionHistoryProps {
  agentId: string;
  refreshTrigger?: number;
}

export const PatchExecutionHistory: React.FC<PatchExecutionHistoryProps> = ({
  agentId,
  refreshTrigger = 0
}) => {
  const [executions, setExecutions] = useState<PatchExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [agentId, refreshTrigger]);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const data = await listPatchExecutions(agentId, 10);
      setExecutions(data);
    } catch (error) {
      console.error('Error loading execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExecutionTypeLabel = (type: string) => {
    switch (type) {
      case 'dry_run':
        return 'Dry Run';
      case 'apply':
        return 'Apply';
      case 'apply_with_reboot':
        return 'Apply + Reboot';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return '-';
    const start = new Date(started).getTime();
    const end = new Date(completed).getTime();
    const seconds = Math.floor((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Execution History
            </CardTitle>
            <CardDescription>Recent patch operations for this agent</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadExecutions}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No execution history yet</p>
            <p className="text-sm mt-1">Run a dry run or apply patches to see history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution, idx) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(execution.status)}
                      <Badge variant="outline">
                        {getExecutionTypeLabel(execution.execution_type)}
                      </Badge>
                      {execution.should_reboot && (
                        <Badge variant="secondary">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reboot
                        </Badge>
                      )}
                      {execution.exit_code !== null && (
                        <span className="text-xs text-muted-foreground">
                          Exit: {execution.exit_code}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>{' '}
                        <span className="font-medium">
                          {formatDate(execution.started_at)}
                        </span>
                      </div>
                      {execution.completed_at && (
                        <div>
                          <span className="text-muted-foreground">Duration:</span>{' '}
                          <span className="font-medium">
                            {getDuration(execution.started_at, execution.completed_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {execution.error_message && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {execution.error_message}
                      </div>
                    )}

                    {execution.rebooted_at && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Rebooted at {formatDate(execution.rebooted_at)}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    ID: {execution.id.substring(0, 8)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
