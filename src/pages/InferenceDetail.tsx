import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Cpu, Zap, Code2, Terminal, AlertTriangle, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInferenceById, getInvestigation } from '@/services/investigationService';
import type { Inference } from '@/services/investigationService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import withAuth from '@/utils/withAuth';

// Collapsible content component with truncation
function CollapsibleContent({ content, maxLines = 10 }: { content: string | any; maxLines?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Convert content to string if it's not already
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  const lines = contentStr.split('\n');
  const needsTruncation = lines.length > maxLines;
  const displayContent = !needsTruncation || isExpanded 
    ? contentStr 
    : lines.slice(0, maxLines).join('\n');

  return (
    <div>
      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
        {displayContent}
      </pre>
      {needsTruncation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show More ({lines.length - maxLines} more lines)
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function InferenceDetail() {
  const { investigationId, inferenceId } = useParams<{ investigationId: string; inferenceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [inference, setInference] = useState<Inference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.inference) {
      setInference(location.state.inference);
      setLoading(false);
      return;
    }

    if (inferenceId) {
      fetchInference(inferenceId);
    }
  }, [inferenceId, location.state]);

  const fetchInference = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try to find inference in investigation metadata first
      if (investigationId) {
        try {
          const investigation = await getInvestigation(investigationId);
          if (investigation?.metadata?.inferences) {
            const found = investigation.metadata.inferences.find((inf: Inference) => inf.id === id);
            if (found) {
              setInference(found);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch investigation for inference lookup:', e);
        }
      }

      // Fallback to direct fetch
      const data = await getInferenceById(id);
      
      if (!data) {
        // If inference not found from API, it might be a placeholder ID
        // Show a message but allow returning to investigation
        setError('Inference details not yet available. The inference data may still be processing.');
        setInference(null);
      } else {
        setInference(data);
      }
    } catch (err) {
      console.error('Error fetching inference:', err);
      setError('Failed to load inference details. The inference may not exist or the server is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const parseSystemInfo = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const info: Record<string, string> = {};
    
    lines.forEach(line => {
      // Handle both "- Key: Value" and "Key: Value" formats
      let cleanLine = line.trim();
      if (cleanLine.startsWith('- ')) {
        cleanLine = cleanLine.substring(2);
      }
      
      const colonIndex = cleanLine.indexOf(':');
      if (colonIndex > 0) {
        const key = cleanLine.substring(0, colonIndex).trim();
        const value = cleanLine.substring(colonIndex + 1).trim();
        if (key && value) {
          info[key] = value;
        }
      }
    });
    
    return info;
  };

  const renderSystemInfo = (content: string) => {
    const info = parseSystemInfo(content);
    
    if (Object.keys(info).length === 0) {
      // Fallback to showing raw content if parsing failed
      return (
        <div className="bg-slate-950 text-green-400 p-4 rounded-lg border border-slate-800 font-mono text-xs whitespace-pre-wrap">
          {content}
        </div>
      );
    }
    
    return (
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {Object.entries(info).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="text-green-300 font-semibold">{key}:</div>
              <div className="text-green-400 pl-2">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssistantResponse = (content: string) => {
    if (!content || typeof content !== 'string') {
      return <div className="text-muted-foreground text-sm">No content</div>;
    }
    
    try {
      const parsed = JSON.parse(content);
      
      // Check if parsed content has command_results (not bash_results!)
      if (parsed.command_results && Array.isArray(parsed.command_results)) {
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Command Results ({parsed.command_results.length})
              </h4>
              {renderCommandResults(parsed.command_results)}
            </div>
            
            {/* eBPF Results */}
            {parsed.ebpf_results && Array.isArray(parsed.ebpf_results) && parsed.ebpf_results.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  eBPF Program Results ({parsed.ebpf_results.length})
                </h4>
                {renderEbpfResults(parsed.ebpf_results)}
              </div>
            )}
            
            {/* Summary stats */}
            {(parsed.executed_commands || parsed.executed_ebpf_programs) && (
              <div className="text-xs text-muted-foreground pt-4 border-t mt-4">
                Executed: {parsed.executed_commands || 0} commands, {parsed.executed_ebpf_programs || 0} eBPF programs
              </div>
            )}
          </div>
        );
      }
      
      if (parsed.response_type === 'resolution') {
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Root Cause
              </h4>
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border-l-4 border-red-500 text-sm whitespace-pre-wrap">
                {parsed.root_cause}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Resolution Plan
              </h4>
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border-l-4 border-green-500 text-sm whitespace-pre-wrap">
                {parsed.resolution_plan}
              </div>
            </div>
            
            {parsed.ebpf_evidence && (
              <div>
                <h4 className="text-sm font-semibold mb-2">eBPF Evidence</h4>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-500 text-sm">
                  {parsed.ebpf_evidence}
                </div>
              </div>
            )}
            
            {parsed.confidence && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Confidence:</span>
                <Badge variant="outline">{parsed.confidence}</Badge>
              </div>
            )}
          </div>
        );
      } else if (parsed.response_type === 'diagnostic') {
        return (
          <div className="space-y-4">
            {parsed.reasoning && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Reasoning
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{parsed.reasoning}</p>
              </div>
            )}
            
            {parsed.diagnosis && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="text-sm font-semibold mb-2">Diagnosis</h4>
                <p className="text-sm whitespace-pre-wrap">{parsed.diagnosis}</p>
              </div>
            )}
            
            {parsed.commands && Array.isArray(parsed.commands) && parsed.commands.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Planned Commands ({parsed.commands.length})
                </h4>
                <div className="space-y-2">
                  {parsed.commands.map((cmd: any, i: number) => {
                    const commandText = typeof cmd === 'string' ? cmd : (cmd.command || cmd.cmd || cmd.text || JSON.stringify(cmd));
                    const description = typeof cmd === 'object' ? (cmd.description || cmd.desc || '') : '';
                    
                    return (
                      <div key={i} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
                        <div className="px-4 py-3">
                          <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: '#22d3ee', margin: 0 }}>
                            {commandText}
                          </pre>
                        </div>
                        {description && (
                          <div className="px-4 py-2 text-xs bg-slate-900 border-t border-slate-700">
                            <span style={{ color: '#94a3b8' }}>{description}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {parsed.ebpf_programs && Array.isArray(parsed.ebpf_programs) && parsed.ebpf_programs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Planned eBPF Programs ({parsed.ebpf_programs.length})
                </h4>
                 <div className="space-y-2">
                  {parsed.ebpf_programs.map((prog: any, i: number) => (
                    <div key={i} className="border rounded-lg overflow-hidden bg-slate-950 border-indigo-500/40">
                      <div className="px-4 py-3 border-b border-indigo-500/30 bg-indigo-950/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold font-mono text-indigo-300">{prog.name}</span>
                          <Badge variant="outline" className="text-xs bg-indigo-600/20 border-indigo-500 text-indigo-300">
                            {prog.type}
                          </Badge>
                        </div>
                        <div className="text-xs font-mono text-indigo-400/80">
                          @ {prog.target}
                        </div>
                      </div>
                      {prog.description && (
                        <div className="px-4 py-2 text-xs border-b border-indigo-500/20">
                          <span className="text-indigo-300/90">{prog.description}</span>
                        </div>
                      )}
                      <div className="px-4 py-2 border-t border-indigo-500/20 text-xs">
                        <span className="text-indigo-300">
                          Duration: <span className="text-cyan-400 font-semibold">{prog.duration}s</span>
                          {prog.filters && (
                            <span className="ml-3">
                              • Filters: <code className="text-xs px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-200">{JSON.stringify(prog.filters)}</code>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {parsed.message && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{parsed.message}</p>
              </div>
            )}
          </div>
        );
      }
    } catch {
      // Not JSON or different format
    }
    
    return (
      <div className="bg-muted/30 p-4 rounded-lg">
        <CollapsibleContent content={content} maxLines={15} />
      </div>
    );
  };

  const renderCommandResults = (results: any[]) => {
    return (
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 flex items-center justify-between border-b">
              <div className="flex-1 min-w-0 mr-3">
                <div className="text-xs text-muted-foreground mb-1">Command</div>
                <code className="text-xs font-mono text-foreground break-all">{result.command}</code>
              </div>
              <Badge 
                variant={result.exit_code === 0 ? 'default' : 'destructive'} 
                className="text-xs whitespace-nowrap"
              >
                {result.exit_code === 0 ? (
                  <span className="flex items-center gap-1">
                    ✓ Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    ✗ Exit {result.exit_code}
                  </span>
                )}
              </Badge>
            </div>
            {result.output && (
              <div className="bg-slate-950 p-4">
                <div className="text-xs text-slate-400 mb-2 font-semibold">Output:</div>
                <div className="text-green-400 font-mono text-xs">
                  <CollapsibleContent content={result.output} maxLines={10} />
                </div>
              </div>
            )}
            {result.stderr && result.stderr.trim() && (
              <div className="bg-slate-950 p-4 border-t border-slate-800">
                <div className="text-xs text-slate-400 mb-2 font-semibold">Stderr:</div>
                <div className="text-red-400 font-mono text-xs">
                  <CollapsibleContent content={result.stderr} maxLines={10} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEbpfProgram = (program: any) => {
    const hasError = program.error || program.verified === false || (program.exit_code && program.exit_code !== 0);
    const isSuccess = !hasError && (program.success || program.verified === true || program.exit_code === 0);
    
    return (
      <div className="border rounded-lg overflow-hidden bg-slate-950 border-indigo-500/40">
        <div className="px-4 py-3 border-b border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm font-mono text-indigo-300">
                {program.name || program.target || 'eBPF Program'}
              </h4>
              {program.target && program.name !== program.target && (
                <div className="text-xs mt-1 font-mono text-indigo-400/80">
                  @ {program.target}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {program.success !== undefined && (
                <Badge variant={program.success ? 'default' : 'destructive'} className="text-xs bg-indigo-600 text-white border-indigo-500">
                  {program.success ? '✓ Success' : '✗ Failed'}
                </Badge>
              )}
              {program.verified !== undefined && (
                <Badge variant={program.verified ? 'default' : 'destructive'} className="text-xs bg-indigo-600 text-white border-indigo-500">
                  {program.verified ? '✓ Verified' : '✗ Verification Failed'}
                </Badge>
              )}
              {program.exit_code !== undefined && (
                <Badge variant={program.exit_code === 0 ? 'default' : 'destructive'} className="text-xs bg-indigo-600 text-white border-indigo-500">
                  {program.exit_code === 0 ? '✓ Exit 0' : `✗ Exit ${program.exit_code}`}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Show event stats if available */}
          {(program.event_count !== undefined || program.duration !== undefined) && (
            <div className="flex items-center gap-4 text-xs mt-2">
              {program.duration !== undefined && (
                <span className="text-indigo-300">
                  Duration: <span className="text-cyan-400 font-semibold">{program.duration}s</span>
                </span>
              )}
              {program.event_count !== undefined && (
                <span className="text-indigo-300">
                  Events: <span className="text-cyan-400 font-semibold">{program.event_count}</span>
                </span>
              )}
              {program.events_per_second !== undefined && (
                <span className="text-indigo-300">
                  Rate: <span className="text-yellow-400 font-semibold">{program.events_per_second.toFixed(2)}/s</span>
                </span>
              )}
            </div>
          )}
          
          {program.description && (
            <p className="text-xs mt-2 text-indigo-300/90">{program.description}</p>
          )}
          
          {program.summary && (
            <div className="mt-2 text-xs p-2 rounded bg-indigo-900/40 text-indigo-200">
              {program.summary}
            </div>
          )}
        </div>
        
        {program.error && (
          <div className="p-4 bg-red-950/40 border-b border-red-800/50">
            <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              Error
            </div>
            <div className="bg-slate-950 p-3 rounded border border-red-800/50 text-red-400 font-mono text-xs">
              <CollapsibleContent content={program.error} maxLines={10} />
            </div>
          </div>
        )}
        
        {program.code && (
          <div className="p-4 border-t border-indigo-500/20">
            <div className="text-xs text-indigo-300 mb-2 font-semibold">Program Code:</div>
            <div className="bg-slate-950 p-3 rounded border border-indigo-500/30 font-mono text-xs text-indigo-300">
              <CollapsibleContent content={program.code} maxLines={15} />
            </div>
          </div>
        )}
        
        {program.output && !program.error && (
          <div className="p-4 border-t border-indigo-500/20">
            <div className="text-xs text-indigo-300 mb-2 font-semibold">Output:</div>
            <div className="bg-slate-950 p-3 rounded border border-indigo-500/30 font-mono text-xs text-cyan-400">
              <CollapsibleContent content={program.output} maxLines={10} />
            </div>
          </div>
        )}
        
        {program.stderr && program.stderr.trim() && (
          <div className="p-4 border-t border-red-800/50 bg-red-950/20">
            <div className="text-xs font-semibold text-red-400 mb-2">Stderr:</div>
            <div className="bg-slate-950 p-3 rounded border border-red-800/50 font-mono text-xs text-red-400">
              <CollapsibleContent content={program.stderr} maxLines={10} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEbpfResults = (results: any[]) => {
    return (
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index}>
            {renderEbpfProgram(result)}
          </div>
        ))}
      </div>
    );
  };

  const extractBashContent = (content: string | any) => {
    try {
      // If already parsed, use it
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Handle messages array format (TensorZero format)
      if (parsed.messages && Array.isArray(parsed.messages)) {
        return parsed.messages.map((msg: any, index: number) => {
          // Content can be string or array
          let contentText = '';
          if (typeof msg.content === 'string') {
            contentText = msg.content;
          } else if (Array.isArray(msg.content)) {
            // Extract text from array of content blocks
            contentText = msg.content.map((block: any) => {
              if (block.type === 'text') {
                return block.value || block.text || '';
              }
              return '';
            }).join('\n\n');
          } else {
            contentText = JSON.stringify(msg.content, null, 2);
          }
          
          return {
            role: msg.role,
            content: contentText,
            index
          };
        });
      }
      
      // Handle direct array format (Claude/OpenAI format)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, index: number) => {
          // Handle text block format with either "text" or "value"
          if (item.type === 'text') {
            const text = item.text || item.value || '';
            return { role: 'assistant', content: text, index };
          }
          // Handle message format
          if (item.role && item.content) {
            let contentText = '';
            if (typeof item.content === 'string') {
              contentText = item.content;
            } else if (Array.isArray(item.content)) {
              contentText = item.content.map((block: any) => {
                if (block.type === 'text') {
                  return block.value || block.text || '';
                }
                return '';
              }).join('\n\n');
            } else {
              contentText = JSON.stringify(item.content, null, 2);
            }
            return { role: item.role, content: contentText, index };
          }
          // Handle text-only format
          if (item.text || item.value) {
            return { role: 'assistant', content: item.text || item.value, index };
          }
          if (item.content) {
            return { role: 'assistant', content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2), index };
          }
          // Fallback to stringified content
          return { role: 'assistant', content: JSON.stringify(item, null, 2), index };
        });
      }
      
      // Handle single object with role and content
      if (parsed.role && parsed.content) {
        return [{ 
          role: parsed.role, 
          content: typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content, null, 2), 
          index: 0 
        }];
      }
      
      // If it's just a plain object, return as is
      return [{ role: 'assistant', content: JSON.stringify(parsed, null, 2), index: 0 }];
    } catch (e) {
      // If parsing fails, treat as plain text
      return [{ role: 'assistant', content: String(content), index: 0 }];
    }
  };

  const renderBashContent = (content: string | any, isInput: boolean = true) => {
    const messages = extractBashContent(content);
    
    if (!messages || messages.length === 0) {
      return (
        <div className="bg-muted/30 p-4 rounded-lg">
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
            {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {messages.map((msg, idx) => {
          const text = msg.content;
          
          // Try to parse as JSON to check for command_results regardless of role
          let hasCommandResults = false;
          try {
            const parsed = JSON.parse(text);
            if (parsed.command_results || parsed.ebpf_results || parsed.response_type) {
              hasCommandResults = true;
            }
          } catch {
            // Not JSON, check string patterns
            if (text && (text.includes('command_results') || text.includes('response_type'))) {
              hasCommandResults = true;
            }
          }
          
          return (
            <div key={idx}>
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                {msg.role}
              </div>
              
              {/* Check for command results FIRST (any role can have them) */}
              {hasCommandResults ? (
                renderAssistantResponse(text)
              ) : text && text.includes('SYSTEM INFORMATION:') ? (
                (() => {
                  const parts = text.split('SYSTEM INFORMATION:');
                  return (
                    <div className="space-y-3">
                      {parts[0].trim() && (
                        <div className="bg-slate-950 text-green-400 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">
                          {parts[0].trim()}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold mb-2 text-muted-foreground">SYSTEM INFORMATION</div>
                        {renderSystemInfo(parts[1])}
                      </div>
                    </div>
                  );
                })()
              ) : text && text.includes('ISSUE DESCRIPTION:') ? (
                (() => {
                  const parts = text.split('ISSUE DESCRIPTION:');
                  return (
                    <div className="space-y-3">
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
                })()
              ) : msg.role === 'system' && text && text.includes('Hostname:') ? (
                renderSystemInfo(text)
              ) : msg.role === 'assistant' && text ? (
                renderAssistantResponse(text)
              ) : text ? (
                <div className={msg.role === 'system' ? 'bg-slate-950 text-green-400 p-4 rounded-lg border border-slate-800 font-mono text-xs' : 'bg-muted/30 p-4 rounded-lg'}>
                  <CollapsibleContent content={text} maxLines={15} />
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Empty content</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
                  <div className="text-muted-foreground">Loading inference...</div>
                </div>
              </div>
            </TransitionWrapper>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !inference) {
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
                    <h2 className="text-xl font-semibold mb-2">Error Loading Inference</h2>
                    <p className="text-muted-foreground">{error || 'Inference not found'}</p>
                  </div>
                  <Button onClick={() => navigate(`/investigations/${investigationId}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Investigation
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
          <Link to={`/investigations/${investigationId}`} className="hover:text-foreground transition-colors">
            {investigationId}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Inference</span>
        </div>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/investigations/${investigationId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Investigation
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Inference Details</h1>
          <p className="text-muted-foreground text-sm">ID: {inference.id}</p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Model</div>
            <div className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              {inference.variant_name || 'Unknown'}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Response Time</div>
            <div className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {(inference.processing_time_ms / 1000).toFixed(2)}s
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Input Tokens</div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {inference.usage?.input_tokens?.toLocaleString() || 0}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Output Tokens</div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              {inference.usage?.output_tokens?.toLocaleString() || 0}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Created</div>
            <div className="text-sm font-medium">
              {formatDate(inference.timestamp)}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Input/Output Tabs */}
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="mt-6">
            {inference.input ? (
              renderBashContent(
                typeof inference.input === 'string' 
                  ? inference.input 
                  : JSON.stringify(inference.input, null, 2),
                true
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No input data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="output" className="mt-6">
            {inference.output ? (
              renderBashContent(inference.output, false)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No output data available
              </div>
            )}
          </TabsContent>
        </Tabs>
            </div>
          </TransitionWrapper>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const InferenceDetailPage = withAuth(InferenceDetail);
export default InferenceDetailPage;
