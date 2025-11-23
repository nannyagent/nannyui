import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInvestigationByIdFromAPI, formatInvestigationTime, type Investigation } from '@/services/investigationService';
import { Database, Server, Smartphone, Network, Globe, Activity as ActivityIcon, Calendar, User, Target, Clock, Eye, Loader2, Code2, Zap } from 'lucide-react';
import InferenceDialog from './InferenceDialog';

export interface InvestigationDialogProps {
  investigation: Investigation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvestigationDialog: React.FC<InvestigationDialogProps> = ({
  investigation: initialInvestigation,
  open,
  onOpenChange,
}) => {
  const [investigation, setInvestigation] = useState<Investigation | null>(initialInvestigation);
  const [loading, setLoading] = useState(false);
  const [selectedInferenceId, setSelectedInferenceId] = useState<string | null>(null);
  const [inferenceDialogOpen, setInferenceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchFullInvestigation = async () => {
      if (!initialInvestigation?.investigation_id) return;

      setLoading(true);
      try {
        const fullData = await getInvestigationByIdFromAPI(initialInvestigation.investigation_id);
        if (fullData) {
          setInvestigation(fullData);
        }
      } catch (error) {
        console.error('Error fetching full investigation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && initialInvestigation) {
      fetchFullInvestigation();
    }
  }, [open, initialInvestigation]);

  const handleViewInference = (inferenceId: string) => {
    setSelectedInferenceId(inferenceId);
    setInferenceDialogOpen(true);
  };

  if (!investigation) return null;

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'high':
        return 'destructive';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getApplicationGroupIcon = (applicationGroup: string) => {
    switch (applicationGroup) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'backend-api':
        return <Server className="h-4 w-4" />;
      case 'mobile-app':
        return <Smartphone className="h-4 w-4" />;
      case 'infrastructure':
        return <Network className="h-4 w-4" />;
      case 'web-app':
        return <Globe className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const parseTensorZeroResponse = (response: string) => {
    try {
      return JSON.parse(response);
    } catch {
      return null;
    }
  };

  const tensorZeroData = parseTensorZeroResponse(investigation.tensorzero_response || '');
  const agentData = investigation.agent || investigation.agents;

  // Extract resolution from the last inference
  const getResolutionFromInferences = () => {
    if (!investigation.inferences || investigation.inferences.length === 0) {
      console.log('No inferences found');
      return null;
    }
    
    // Check the last inference for resolution
    const lastInference = investigation.inferences[investigation.inferences.length - 1];
    console.log('Last inference output:', lastInference.output);
    
    if (!lastInference.output) {
      console.log('No output in last inference');
      return null;
    }
    
    try {
      // First try to parse as direct JSON
      let parsed = JSON.parse(lastInference.output);
      console.log('Parsed output:', parsed);
      
      // Check if it's an array with objects containing text/content
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        console.log('First item:', firstItem);
        
        // Try multiple ways to extract the text content
        let textContent = null;
        if (firstItem.type === 'text' && firstItem.text) {
          textContent = firstItem.text;
        } else if (firstItem.text) {
          textContent = firstItem.text;
        } else if (firstItem.content) {
          textContent = firstItem.content;
        } else if (typeof firstItem === 'string') {
          textContent = firstItem;
        }
        
        if (textContent) {
          console.log('Text content:', textContent);
          parsed = JSON.parse(textContent);
          console.log('Parsed text content:', parsed);
        }
      }
      
      // Check if it's a resolution response
      if (parsed.response_type === 'resolution') {
        console.log('Found resolution!');
        return {
          root_cause: parsed.root_cause,
          resolution_plan: parsed.resolution_plan,
          confidence: parsed.confidence,
          ebpf_evidence: parsed.ebpf_evidence,
          inferenceId: lastInference.id
        };
      } else {
        console.log('Not a resolution response, type:', parsed.response_type);
      }
    } catch (e) {
      console.log('Failed to parse resolution:', e);
    }
    
    return null;
  };

  const resolution = getResolutionFromInferences();

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ActivityIcon className="h-5 w-5 text-primary" />
              <span>Investigation Episode Details</span>
            </DialogTitle>
            <DialogDescription>
              ID: {investigation.investigation_id} • Episode: {investigation.episode_id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge variant={getStatusBadgeVariant(investigation.status)}>
                  {investigation.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Priority</div>
                <Badge variant={getPriorityBadgeVariant(investigation.priority)}>
                  {investigation.priority}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Agent</div>
                <div className="text-sm font-medium">{agentData?.name || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Inferences</div>
                <div className="text-sm font-medium">{investigation.inference_count || 0}</div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Issue Description</h4>
              <p className="text-sm">{investigation.issue}</p>
            </div>

            {/* Investigation Resolution */}
            {resolution ? (
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <ActivityIcon className="h-4 w-4 text-green-600" />
                    Investigation Resolution
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Confidence: {resolution.confidence}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Root Cause</h5>
                    <p className="text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded border-l-4 border-red-500">
                      {resolution.root_cause}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Resolution Plan</h5>
                    <div className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">
                      {resolution.resolution_plan}
                    </div>
                  </div>
                  
                  {resolution.ebpf_evidence && (
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-1">eBPF Evidence</h5>
                      <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-500">
                        {resolution.ebpf_evidence}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Code2 className="h-3 w-3" />
                    <span>
                      For detailed analysis, view the{' '}
                      <button
                        onClick={() => handleViewInference(resolution.inferenceId)}
                        className="text-primary hover:underline font-medium"
                      >
                        final inference
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            ) : investigation.holistic_analysis && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Holistic Analysis</h4>
                <p className="text-sm bg-muted/30 p-3 rounded">{investigation.holistic_analysis}</p>
              </div>
            )}

            <Separator />

            {/* Episode Inferences */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Episode Inferences ({investigation.inferences?.length || 0})
              </h4>
              
              {investigation.inferences && investigation.inferences.length > 0 ? (
                <div className="space-y-2">
                  {investigation.inferences.map((inference, index) => (
                    <div
                      key={inference.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Inference {index + 1}</Badge>
                            <span className="text-xs font-mono text-muted-foreground">
                              {inference.id.substring(0, 20)}...
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Function:</span>{' '}
                              <span className="font-medium">{inference.function_name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Variant:</span>{' '}
                              <span className="font-medium">{inference.variant_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{inference.processing_time_ms}ms</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {new Date(inference.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInference(inference.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No inferences found for this investigation
                </div>
              )}
            </div>

            {/* Timeline */}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatInvestigationTime(investigation.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Initiated by:</span>
                <span>{investigation.initiated_by}</span>
              </div>
              {investigation.completed_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{formatInvestigationTime(investigation.completed_at)}</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inference Details Dialog */}
      <InferenceDialog
        inferenceId={selectedInferenceId}
        open={inferenceDialogOpen}
        onOpenChange={setInferenceDialogOpen}
      />
    </>
  );
};

export default InvestigationDialog;