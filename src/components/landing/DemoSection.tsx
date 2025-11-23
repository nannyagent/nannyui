
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiDemo = () => {
  return (
    <div className="bg-background/50 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden h-full">
      <div className="bg-sidebar p-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs text-white/70 font-mono">api-console</div>
      </div>
      <div className="bg-black p-4 font-mono text-sm text-blue-400 overflow-hidden h-[400px]">
        <div className="animate-typing-slow">
          <span className="text-white/70">&gt;</span> nannyapi.diagnoseAll("webserver-cluster")<br />
          <span className="text-green-400">[API]</span> Initiating diagnostic across 5 servers in webserver-cluster<br />
          <span className="text-green-400">[API]</span> Connected to agent: web-server-01<br />
          <span className="text-green-400">[API]</span> Connected to agent: web-server-02<br />
          <span className="text-green-400">[API]</span> Connected to agent: web-server-03<br />
          <span className="text-green-400">[API]</span> Connected to agent: web-server-04<br />
          <span className="text-green-400">[API]</span> Connected to agent: web-server-05<br />
          <span className="text-white/70">&gt;</span> Executing netstat analysis on all nodes<br />
          <span className="text-yellow-400">[RESULT]</span> Connection bottleneck detected on web-server-03<br />
          <span className="text-white/70">&gt;</span> Executing detailed analysis on web-server-03<br />
          <span className="text-blue-400">[INFO]</span> Running TCP connection analysis<br />
          <span className="text-blue-400">[INFO]</span> Checking active threads<br />
          <span className="text-blue-400">[INFO]</span> Analyzing memory allocation<br />
          <span className="text-green-500">[DIAGNOSIS]</span> Thread pool exhaustion detected<br />
          <span className="text-green-500">[RECOMMENDATION]</span> Increase max_threads parameter in server config<br />
          <span className="text-white/70">&gt;</span> Apply recommendation? (y/n): y<br />
          <span className="text-green-400">[API]</span> Applying configuration changes to web-server-03<br />
          <span className="text-green-400">[API]</span> Changes applied successfully<br />
          <span className="text-green-400">[API]</span> Restarting service on web-server-03<br />
          <span className="text-green-500">[SUCCESS]</span> Service restored to optimal performance<br />
        </div>
      </div>
    </div>
  );
};

const AgentDemo = () => {
  return (
    <div className="bg-background/50 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden h-full">
      <div className="bg-sidebar p-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs text-white/70 font-mono">database-agent</div>
      </div>
      <div className="bg-black p-4 font-mono text-sm text-green-400 overflow-hidden h-[400px]">
        <div className="animate-typing-slow-2">
          <span className="text-white/70">$</span> nannyagent --diagnose postgresql is having troubles<br />
          <span className="text-yellow-400">[INFO]</span> Starting PostgreSQL diagnostic sequence<br />
          <span className="text-yellow-400">[INFO]</span> Checking PostgreSQL service status<br />
          <span className="text-white/70">$</span> systemctl status postgresql<br />
          <span className="text-green-400">● postgresql.service - PostgreSQL RDBMS</span><br />
          <span className="text-green-400">   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled; vendor preset: enabled)</span><br />
          <span className="text-green-400">   Active: active (running) since Tue 2023-10-10 14:23:45 UTC; 3 days ago</span><br />
          <span className="text-blue-400">[NANNYAI]</span> Checking for slow queries<br />
          <span className="text-white/70">$</span> cat /var/log/postgresql/postgresql-13-main.log | grep "duration:" | tail -5<br />
          <span className="text-white/60">2023-10-13 09:15:42 UTC [5413]: [3-1] user=app,db=production LOG: duration: 15243.922 ms statement: SELECT * FROM large_table WHERE timestamp &gt; &apos;2023-10-12&apos;</span><br />
          <span className="text-blue-400">[NANNYAI]</span> Analyzing database performance<br />
          <span className="text-white/70">$</span> psql -c "SELECT datname, numbackends FROM pg_stat_database"<br />
          <span className="text-white/60">  datname  | numbackends</span><br />
          <span className="text-white/60">-----------+------------</span><br />
          <span className="text-white/60"> template0 |          0</span><br />
          <span className="text-white/60"> template1 |          0</span><br />
          <span className="text-white/60"> postgres  |          1</span><br />
          <span className="text-white/60"> production|         48</span><br />
          <span className="text-red-400">[WARNING]</span> High number of active connections detected<br />
          <span className="text-green-500">[DIAGNOSIS]</span> Database connection pooling issue identified<br />
          <span className="text-green-500">[RECOMMENDATION]</span> Implement PgBouncer to manage connection pooling<br />
        </div>
      </div>
    </div>
  );
};

const HistoryDemo = () => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  const historyItems = [
    {
      id: 1,
      agent: "web-server-01",
      timestamp: "2023-10-13 14:32:15",
      issue: "High CPU Usage",
      summary: "CPU utilization consistently above 90% for 15 minutes",
      expanded: "Agent reported CPU utilization consistently above 90% for 15 minutes. API instructed agent to collect process information. Found runaway process in user application. API instructed agent to restart application service, which resolved the issue. Full diagnostics saved to history."
    },
    {
      id: 2,
      agent: "db-server-03",
      timestamp: "2023-10-13 12:18:42",
      issue: "Disk Space Warning",
      summary: "Root partition reaching 85% capacity",
      expanded: "Agent reported disk space warning with root partition at 85% capacity. API requested detailed disk usage analysis. Large log files identified in application directory. API instructed log rotation and cleanup, freeing 12GB of space. Implemented automated log cleanup schedule to prevent recurrence."
    },
    {
      id: 3,
      agent: "auth-server-02",
      timestamp: "2023-10-13 09:45:37",
      issue: "Service Unavailable",
      summary: "Authentication service not responding to requests",
      expanded: "Agent reported authentication service not responding to requests. API requested service status and log analysis. Identified configuration error after recent update. API provided correct configuration template and instructed service restart. Service restored to full functionality. Added configuration validation step to update procedure."
    }
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <div className="bg-muted p-4 border-b border-border">
        <h3 className="text-xl font-semibold">Recent Diagnostic History</h3>
      </div>
      <div className="divide-y divide-border">
        {historyItems.map((item, index) => (
          <div key={item.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
                  <span className="font-medium">{item.agent}</span>
                  <span className="text-xs text-muted-foreground ml-2">{item.timestamp}</span>
                </div>
                <div className="font-semibold">{item.issue}</div>
                <div className="text-sm text-muted-foreground">{item.summary}</div>
              </div>
              <button
                onClick={() => toggleExpand(index)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {expandedItem === index ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {expandedItem === index && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
                <div className="font-mono whitespace-pre-line">{item.expanded}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DemoSection = () => {
  return (
    <div className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See NannyAI in Action</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience how our intelligent agents and API work together to diagnose and resolve issues automatically.
          </p>
        </div>

        <Tabs defaultValue="agent" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="agent">Agent View</TabsTrigger>
            <TabsTrigger value="api">API View</TabsTrigger>
            <TabsTrigger value="history">History View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agent" className="mt-0">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Intelligent Agent Diagnostics</h3>
                <p className="text-muted-foreground mb-6">
                  Our lightweight agents run on your Linux systems, collecting diagnostic data and executing commands requested by the API. They seamlessly integrate with your existing infrastructure with minimal overhead.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Automatic issue detection and reporting</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Secure, encrypted communication with the API</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Low resource footprint for minimal impact</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AgentDemo />
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="mt-0">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Centralized API Control</h3>
                <p className="text-muted-foreground mb-6">
                  Our API serves as the central nervous system for your Linux infrastructure, coordinating diagnostics across multiple agents, analyzing results, and providing actionable recommendations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Coordinate diagnostics across multiple systems</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>AI-powered analysis and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Automated remediation capabilities</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ApiDemo />
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Complete Diagnostic History</h3>
                <p className="text-muted-foreground mb-6">
                  Every interaction between your agents and our API is recorded, giving you a complete audit trail of all diagnostics, recommendations, and actions taken across your infrastructure.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Complete audit trail of all diagnostics</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Searchable and filterable history</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Export reports for compliance and documentation</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <HistoryDemo />
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DemoSection;
