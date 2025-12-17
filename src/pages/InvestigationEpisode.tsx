import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Code2, Activity, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInvestigationByIdFromAPI, getEpisodeInferences, formatInvestigationTime, type Investigation, type Inference } from '@/services/investigationService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import withAuth from '@/utils/withAuth';

function InvestigationEpisode() {
  const { investigationId } = useParams<{ investigationId: string }>();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [inferences, setInferences] = useState<Inference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (investigationId) {
      fetchInvestigation(investigationId);
    }
  }, [investigationId]);

  const fetchInvestigation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvestigationByIdFromAPI(id);
      setInvestigation(data);
      
      // If we got investigation data with episode_id, fetch inferences
      if (data?.episode_id) {
        const inferenceData = await getEpisodeInferences(data.episode_id);
        setInferences(inferenceData);
      }
    } catch (err) {
      console.error('Error fetching investigation:', err);
      setError('Failed to load investigation details');
    } finally {
      setLoading(false);
    }
  };

  // Extract resolution from the last inference
  const getResolutionFromInferences = () => {
    if (!investigation?.inferences || investigation.inferences.length === 0) {
      return null;
    }
    
    const lastInference = investigation.inferences[investigation.inferences.length - 1];
    
    if (!lastInference.output) {
      return null;
    }
    
    try {
      let parsed = JSON.parse(lastInference.output);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        
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
          parsed = JSON.parse(textContent);
        }
      }
      
      if (parsed.response_type === 'resolution') {
        return {
          root_cause: parsed.root_cause,
          resolution_plan: parsed.resolution_plan,
          confidence: parsed.confidence,
          ebpf_evidence: parsed.ebpf_evidence,
          inferenceId: lastInference.id
        };
      }
    } catch (e) {
      // Not a resolution inference
    }
    
    return null;
  };

  const resolution = investigation ? getResolutionFromInferences() : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1">
            <TransitionWrapper>
              <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading investigation...</div>
                </div>
              </div>
            </TransitionWrapper>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1">
            <TransitionWrapper>
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Error Loading Investigation</h2>
                    <p className="text-muted-foreground">{error || 'Investigation not found'}</p>
                  </div>
                  <Button onClick={() => navigate('/investigations')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Investigations
                  </Button>
                </div>
              </div>
            </TransitionWrapper>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1">
          <TransitionWrapper>
            <div className="px-4 py-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/investigations" className="hover:text-foreground transition-colors">
            Investigations
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{investigation.investigation_id}</span>
        </div>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/investigations')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Investigations
        </Button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Investigation Details</h1>
            <Badge variant={investigation.status === 'active' ? 'default' : 'secondary'}>
              {investigation.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Investigation ID: {investigation.investigation_id}</p>
            <p>Episode ID: {investigation.episode_id}</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Started</div>
            <div className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(investigation.created_at)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Agent</div>
            <div className="text-sm font-medium">{investigation.agent?.name || 'N/A'}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Inferences</div>
            <div className="text-sm font-medium">{investigation.inference_count || 0}</div>
          </div>
        </div>

        {/* Issue Description */}
        <div className="p-4 border rounded-lg mb-6">
          <h2 className="font-semibold text-sm mb-2">Issue Description</h2>
          {(() => {
            try {
              const parsed = JSON.parse(investigation.issue);
              if (parsed.command_results) {
                return (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">System Diagnostic Investigation</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {parsed.command_results.map((cmd: any, idx: number) => (
                        <div key={idx} className="text-xs bg-muted p-3 rounded border-l-2 border-blue-500">
                          <div className="font-mono font-semibold text-foreground mb-1">{cmd.command}</div>
                          {cmd.description && (
                            <div className="text-muted-foreground text-xs mb-1">{cmd.description}</div>
                          )}
                          {cmd.output && (
                            <div className="text-muted-foreground whitespace-pre-wrap break-words max-h-20 overflow-y-auto text-xs font-mono bg-background p-2 rounded mt-1">
                              {cmd.output.substring(0, 300)}{cmd.output.length > 300 ? '\n...' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch (e) {
              // Not JSON
            }
            return <p className="text-sm">{investigation.issue}</p>;
          })()}
        </div>

        {/* Investigation Resolution */}
        {resolution ? (
          <div className="p-4 border rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Investigation Resolution
              </h2>
              <Badge variant="outline" className="text-xs">
                Confidence: {resolution.confidence}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Root Cause</h3>
                <div className="text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded border-l-4 border-red-500 whitespace-pre-wrap">
                  {resolution.root_cause}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Resolution Plan</h3>
                <div className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">
                  {resolution.resolution_plan}
                </div>
              </div>
              
              {resolution.ebpf_evidence && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">eBPF Evidence</h3>
                  <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-500">
                    {resolution.ebpf_evidence}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Code2 className="h-3 w-3" />
                <span>
                  For detailed analysis, view the{' '}
                  <Link
                    to={`/investigations/${investigationId}/inference/${resolution.inferenceId}`}
                    className="text-primary hover:underline font-medium"
                  >
                    final inference
                  </Link>
                </span>
              </div>
            </div>
          </div>
        ) : investigation.holistic_analysis && (
          <div className="p-6 border-2 border-primary/20 rounded-xl mb-6 bg-gradient-to-br from-primary/5 to-transparent">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Activity className="h-6 w-6 text-primary" />
              Resolution Plan
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap font-medium text-foreground/90">
                {investigation.holistic_analysis}
              </p>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Episode Inferences */}
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Code2 className="h-5 w-5" />
            Episode Inferences ({inferences?.length || 0})
          </h2>
          
          {inferences && inferences.length > 0 ? (
            <div className="space-y-3">
              {[...inferences].reverse().map((inference: Inference, index: number) => {
                const inferenceNumber = inferences.length - index; // Show in reverse order (latest first)
                return (
                <Link
                  key={inference.id}
                  to={`/investigations/${investigationId}/inference/${inference.id}`}
                  className="block p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header: Inference number and badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-foreground">
                          Inference #{inferenceNumber}
                        </span>
                        {inference.function_name && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200 flex-shrink-0">
                            {inference.function_name}
                          </Badge>
                        )}
                        {inference.model_inference?.model_name && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {inference.model_inference.model_name}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Metadata row: Inference ID, Response Time, Tokens */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-mono text-foreground/70 truncate" title={inference.id}>
                          {inference.id.substring(0, 8)}...
                        </span>
                        
                        {inference.processing_time_ms && (
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="h-3 w-3" />
                            {(inference.processing_time_ms / 1000).toFixed(2)}s
                          </span>
                        )}
                        
                        {inference.model_inference && (
                          <span className="flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {inference.model_inference.input_tokens.toLocaleString()}
                            </span>
                            <span> in / </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {inference.model_inference.output_tokens.toLocaleString()}
                            </span>
                            <span> out</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp on the right */}
                    <div className="text-xs text-muted-foreground flex-shrink-0 text-right">
                      {inference.timestamp ? formatInvestigationTime(inference.timestamp) : 'N/A'}
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No inferences found for this episode
            </div>
          )}
        </div>
            </div>
          </TransitionWrapper>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const InvestigationEpisodePage = withAuth(InvestigationEpisode);
export default InvestigationEpisodePage;
