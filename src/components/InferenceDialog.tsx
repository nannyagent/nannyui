import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Code2, Terminal, Activity, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInferenceById, type Inference } from '@/services/investigationService';

interface InferenceDialogProps {
  inferenceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InferenceDialog: React.FC<InferenceDialogProps> = ({ inferenceId, open, onOpenChange }) => {
  const [inference, setInference] = useState<Inference | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInferenceDetails = async () => {
      if (!inferenceId) return;

      setLoading(true);
      try {
        const data = await getInferenceById(inferenceId);
        setInference(data);
      } catch (error) {
        console.error('Error fetching inference details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && inferenceId) {
      fetchInferenceDetails();
    }
  }, [inferenceId, open]);

  const formatJSON = (jsonString: string | undefined) => {
    if (!jsonString) return 'N/A';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const extractBashContent = (content: string) => {
    // Extract bash commands and outputs from the JSON content
    try {
      const parsed = JSON.parse(content);
      
      // Handle messages array format
      if (parsed.messages) {
        return parsed.messages.map((msg: any, idx: number) => ({
          role: msg.role,
          content: msg.content,
          index: idx
        }));
      }
      
      // Handle direct array format (common in outputs)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, idx: number) => ({
          role: item.role || 'assistant',
          content: item.content || item.text || item,
          index: idx
        }));
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseSystemInfo = (text: string) => {
    // Parse SYSTEM INFORMATION into readable key-value pairs
    const lines = text.split('\n');
    const info: Record<string, string> = {};
    
    lines.forEach(line => {
      const match = line.match(/^- (.+?):\s*(.+)$/);
      if (match) {
        info[match[1]] = match[2];
      }
    });
    
    return Object.keys(info).length > 0 ? info : null;
  };

  const renderSystemInfo = (text: string) => {
    const systemInfo = parseSystemInfo(text);
    
    if (systemInfo) {
      return (
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 text-green-400 rounded-lg text-xs font-mono">
          {Object.entries(systemInfo).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="text-green-300 font-semibold">{key}:</div>
              <div className="text-green-400 pl-2">{value}</div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <pre className="bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap">
        {text}
      </pre>
    );
  };

  const CollapsibleContent: React.FC<{ content: string; maxLines?: number }> = ({ content, maxLines = 10 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const lines = content.split('\n');
    const shouldCollapse = lines.length > maxLines;
    
    const displayContent = isExpanded || !shouldCollapse 
      ? content 
      : lines.slice(0, maxLines).join('\n') + '\n...';
    
    return (
      <div className="space-y-2">
        <pre className="bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto">
          {displayContent}
        </pre>
        {shouldCollapse && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? 'Show Less' : `Show All (${lines.length} lines)`}
          </Button>
        )}
      </div>
    );
  };

  const renderAssistantResponse = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      
      // Check if it's a resolution response
      if (parsed.response_type === 'resolution') {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">Resolution Response</Badge>
              <Badge variant="outline">{parsed.confidence} Confidence</Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Root Cause</div>
                <div className="text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded border-l-4 border-red-500">
                  {parsed.root_cause}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Resolution Plan</div>
                <div className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">
                  {parsed.resolution_plan}
                </div>
              </div>
              
              {parsed.ebpf_evidence && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">eBPF Evidence</div>
                  <div className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-500">
                    {parsed.ebpf_evidence}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // Check if it's a diagnostic response
      if (parsed.response_type === 'diagnostic') {
        return (
          <div className="space-y-4">
            <Badge variant="secondary">Diagnostic Response</Badge>
            
            {parsed.reasoning && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Reasoning</div>
                <div className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                  {parsed.reasoning}
                </div>
              </div>
            )}
            
            {parsed.commands && parsed.commands.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Commands to Execute ({parsed.commands.length})</div>
                <div className="bg-slate-950 text-green-400 p-3 rounded text-xs font-mono space-y-1">
                  {parsed.commands.map((cmd: string, i: number) => (
                    <div key={i}>$ {cmd}</div>
                  ))}
                </div>
              </div>
            )}
            
            {parsed.ebpf_programs && parsed.ebpf_programs.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">eBPF Programs to Execute ({parsed.ebpf_programs.length})</div>
                <div className="bg-slate-950 p-3 rounded space-y-3">
                  {parsed.ebpf_programs.map((prog: any, i: number) => (
                    <div key={i} className="border-l-4 border-purple-400 bg-slate-900/50 p-3 rounded-r space-y-1.5">
                      <div className="text-purple-400 font-bold text-sm flex items-center gap-1">
                        🔍 {prog.name}
                      </div>
                      <div className="text-emerald-300">
                        <span className="text-slate-400 font-medium">Type:</span> {prog.type} → <span className="text-amber-300 font-semibold">{prog.target}</span>
                      </div>
                      <div className="text-emerald-300">
                        <span className="text-slate-400 font-medium">Duration:</span> <span className="text-cyan-300 font-semibold">{prog.duration}s</span>
                      </div>
                      {prog.filters && Object.keys(prog.filters).length > 0 && (
                        <div className="text-emerald-300">
                          <span className="text-slate-400 font-medium">Filters:</span> <span className="text-cyan-300">{JSON.stringify(prog.filters)}</span>
                        </div>
                      )}
                      {prog.description && (
                        <div className="text-blue-300 mt-2 italic border-t border-slate-700 pt-2">
                          → {prog.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      // Generic JSON formatting
      return <CollapsibleContent content={JSON.stringify(parsed, null, 2)} maxLines={15} />;
    } catch {
      // Not JSON, render as text
      return <div className="text-sm whitespace-pre-wrap">{text}</div>;
    }
  };

  const renderCommandResults = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      
      // Check for command_results array
      if (parsed.command_results && Array.isArray(parsed.command_results)) {
        return (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Command Results ({parsed.command_results.length})
            </div>
            {parsed.command_results.map((cmd: any, i: number) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className={`p-2 text-xs font-mono ${cmd.exit_code === 0 ? 'bg-green-900/20 border-l-4 border-green-500' : 'bg-red-900/20 border-l-4 border-red-500'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400">$ {cmd.command}</span>
                    <Badge variant={cmd.exit_code === 0 ? 'default' : 'destructive'} className="text-xs">
                      exit: {cmd.exit_code}
                    </Badge>
                  </div>
                  {cmd.description && (
                    <div className="text-gray-400 mt-1 text-xs italic">{cmd.description}</div>
                  )}
                </div>
                {cmd.output && (
                  <div className="bg-slate-950 text-green-400 p-3 text-xs font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {cmd.output}
                  </div>
                )}
              </div>
            ))}
            
            {/* eBPF Results */}
            {parsed.ebpf_results && Array.isArray(parsed.ebpf_results) && parsed.ebpf_results.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  eBPF Program Results ({parsed.ebpf_results.length})
                </div>
                {parsed.ebpf_results.map((ebpf: any, i: number) => (
                  <div key={i} className="border rounded-lg overflow-hidden mb-2">
                    <div className={`p-3 text-xs ${ebpf.success ? 'bg-purple-900/30 border-l-4 border-purple-400' : 'bg-red-900/30 border-l-4 border-red-500'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-300 font-bold text-sm">🔍 {ebpf.target}</span>
                        <Badge variant={ebpf.success ? 'default' : 'destructive'} className="text-xs">
                          {ebpf.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="text-emerald-300 space-y-1">
                        <div><span className="text-slate-400 font-medium">Duration:</span> <span className="text-cyan-300 font-semibold">{ebpf.duration?.toFixed(2)}s</span></div>
                        <div><span className="text-slate-400 font-medium">Events:</span> <span className="text-cyan-300 font-semibold">{ebpf.event_count}</span> <span className="text-amber-300">({ebpf.events_per_second?.toFixed(2)}/sec)</span></div>
                      </div>
                      {ebpf.summary && (
                        <div className="text-blue-300 mt-2 text-xs border-t border-slate-700 pt-2">{ebpf.summary}</div>
                      )}
                      {ebpf.error && (
                        <div className="text-red-300 mt-2 text-xs bg-red-950/50 border border-red-500 p-2 rounded">
                          ⚠️ Error: {ebpf.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Summary stats */}
            {(parsed.executed_commands || parsed.executed_ebpf_programs) && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Executed: {parsed.executed_commands || 0} commands, {parsed.executed_ebpf_programs || 0} eBPF programs
              </div>
            )}
          </div>
        );
      }
      
      // Fallback for other JSON structures
      return <CollapsibleContent content={text} />;
    } catch {
      // Not JSON, use collapsible
      return <CollapsibleContent content={text} />;
    }
  };

  const renderBashContent = (content: any) => {
    if (Array.isArray(content)) {
      return content.map((item: any, idx: number) => {
        if (item.type === 'text') {
          const text = item.value || item.text || '';
          
          // Check if it's SYSTEM INFORMATION
          if (text.includes('SYSTEM INFORMATION:')) {
            const parts = text.split('SYSTEM INFORMATION:');
            const beforeInfo = parts[0];
            const infoContent = parts[1];
            
            return (
              <div key={idx} className="mb-4 space-y-3">
                {beforeInfo.trim() && (
                  <div className="bg-slate-950 text-green-400 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">
                    {beforeInfo.trim()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold mb-2 text-muted-foreground">SYSTEM INFORMATION</div>
                  {renderSystemInfo(infoContent)}
                </div>
              </div>
            );
          }
          
          // Check if it has ISSUE DESCRIPTION
          if (text.includes('ISSUE DESCRIPTION:')) {
            const parts = text.split('ISSUE DESCRIPTION:');
            return (
              <div key={idx} className="mb-4 space-y-3">
                {parts[0].trim() && (
                  <div className="bg-slate-950 text-green-400 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">
                    {parts[0].trim()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold mb-2 text-muted-foreground">ISSUE DESCRIPTION</div>
                  <div className="bg-slate-950 text-yellow-300 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">
                    {parts[1].trim()}
                  </div>
                </div>
              </div>
            );
          }
          
          // Check if it's a JSON response (likely assistant response)
          if (text.trim().startsWith('{') && text.includes('response_type')) {
            return (
              <div key={idx} className="mb-4">
                {renderAssistantResponse(text)}
              </div>
            );
          }
          
          // Check if it contains command results
          if (text.includes('command_results')) {
            return (
              <div key={idx} className="mb-4">
                {renderCommandResults(text)}
              </div>
            );
          }
          
          // Check if it contains bash-like content
          if (text.includes('output') || text.includes('$')) {
            return (
              <div key={idx} className="mb-4">
                <CollapsibleContent content={text} />
              </div>
            );
          }
          
          // Check if it's a large JSON response
          if (text.length > 500 && (text.startsWith('{') || text.startsWith('['))) {
            return (
              <div key={idx} className="mb-4">
                <CollapsibleContent content={text} maxLines={15} />
              </div>
            );
          }
          
          return (
            <div key={idx} className="mb-2 text-sm whitespace-pre-wrap">
              {text}
            </div>
          );
        }
        return null;
      });
    }
    return <pre className="text-xs overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Inference Details</DialogTitle>
            <DialogDescription>Please wait while we fetch the inference data...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!inference) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Inference Details</DialogTitle>
            <DialogDescription>No inference data available for this request.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Unable to load inference details. Please try again.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const messages = extractBashContent(inference.input || '');
  const outputMessages = extractBashContent(inference.output || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Inference Details
          </DialogTitle>
          <DialogDescription>
            ID: {inference.id} • Function: {inference.function_name} ({inference.variant_name})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Timestamp
              </div>
              <div className="text-sm font-medium">{formatTimestamp(inference.timestamp)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Processing Time
              </div>
              <div className="text-sm font-medium">{inference.processing_time_ms}ms</div>
            </div>
            {inference.variant_name && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Model</div>
                <div className="text-sm font-medium">{inference.variant_name}</div>
              </div>
            )}
            {inference.usage && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Tokens</div>
                <div className="text-sm font-medium">
                  {inference.usage.input_tokens || 0} in / {inference.usage.output_tokens || 0} out
                </div>
              </div>
            )}
          </div>



          {/* Input/Output Tabs */}
          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">
                <Terminal className="h-3 w-3 mr-2" />
                Input
              </TabsTrigger>
              <TabsTrigger value="output">
                <Code2 className="h-3 w-3 mr-2" />
                Output
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-3">
              {messages ? (
                messages.map((msg: any) => (
                  <div key={msg.index} className="border rounded-lg p-4">
                    <Badge variant={msg.role === 'user' ? 'default' : 'secondary'} className="mb-2">
                      {msg.role}
                    </Badge>
                    {renderBashContent(msg.content)}
                  </div>
                ))
              ) : (
                <div className="border rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {formatJSON(inference.input)}
                  </pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="output" className="space-y-3">
              {outputMessages ? (
                outputMessages.map((msg: any) => (
                  <div key={msg.index} className="border rounded-lg p-4">
                    <Badge variant="default" className="mb-2">
                      {msg.role || 'response'}
                    </Badge>
                    {renderBashContent(msg.content)}
                  </div>
                ))
              ) : (
                <div className="border rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {formatJSON(inference.output)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InferenceDialog;
