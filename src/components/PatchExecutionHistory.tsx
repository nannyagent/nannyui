import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  listPatchExecutions,
  type PatchExecution
} from '@/services/patchManagementService';

interface PatchExecutionHistoryProps {
  agentId: string;
  refreshTrigger?: number;
  limit?: number;
}

export const PatchExecutionHistory: React.FC<PatchExecutionHistoryProps> = ({
  agentId,
  refreshTrigger = 0,
  limit = 5
}) => {
  const [executions, setExecutions] = useState<PatchExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [agentId, refreshTrigger]);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const data = await listPatchExecutions(agentId, limit);
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
            Done
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
      case 'check': return 'Check';
      case 'update': return 'Update';
      case 'rollback': return 'Rollback';
      case 'dry_run': return 'Dry Run';
      case 'apply': return 'Apply';
      case 'apply_with_reboot': return 'Apply + Reboot';
      default: return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return '-';
    const seconds = Math.floor((new Date(completed).getTime() - new Date(started).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Executions
            </CardTitle>
            <CardDescription>Last {limit} patch operations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadExecutions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link to={`/patch-history/${agentId}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No execution history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {executions.map((execution, idx) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/patch-execution/${execution.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(execution.status)}
                      <Badge variant="outline" className="text-xs">
                        {getExecutionTypeLabel(execution.mode)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(execution.created)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {execution.completed_at && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {getDuration(execution.created, execution.completed_at)}
                        </span>
                      )}
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
