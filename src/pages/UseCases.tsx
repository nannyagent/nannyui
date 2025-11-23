import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { 
  Server, 
  Shield, 
  TrendingUp, 
  Cloud, 
  Container, 
  Database,
  Workflow,
  Binary
} from 'lucide-react';

const UseCases = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-bold mb-6">Real-World Use Cases</h1>
            <p className="text-xl text-muted-foreground">
              See how teams across industries leverage NannyAI to solve their most critical infrastructure challenges.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* DevOps & SRE */}
            <section>
              <div className="text-center mb-8">
                <Server className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-3">DevOps & Site Reliability Engineering</h2>
                <p className="text-muted-foreground">Maintain service reliability and accelerate incident response</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Incident Response & Troubleshooting</h3>
                  <p className="text-muted-foreground mb-4">
                    Reduce MTTR (Mean Time To Resolution) by 70% with AI-powered root cause analysis. When systems fail, 
                    NannyAI automatically investigates, correlates events, and provides actionable insights in minutes instead of hours.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground italic">
                      "A spike in API latency at 2 AM triggered an investigation. NannyAI identified a memory leak in a 
                      microservice, traced it to a recent deployment, and recommended a rollback—all before our on-call 
                      engineer woke up." - DevOps Lead, E-commerce Platform
                    </p>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Performance Optimization</h3>
                  <p className="text-muted-foreground mb-4">
                    Identify performance bottlenecks with eBPF-powered profiling. CPU flame graphs, memory allocation tracking, 
                    and I/O analysis reveal exactly where optimization efforts should focus.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Key Benefits:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Zero overhead performance profiling</li>
                      <li>Production-safe observability</li>
                      <li>Historical performance baselines</li>
                      <li>Automated optimization recommendations</li>
                    </ul>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Capacity Planning</h3>
                  <p className="text-muted-foreground mb-4">
                    Predictive analytics forecast resource utilization weeks in advance. Right-size infrastructure, 
                    plan for traffic spikes, and optimize cloud costs with data-driven insights.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Cost Savings:</strong> Customers report 25-40% reduction in cloud infrastructure costs by 
                      eliminating over-provisioning while maintaining performance SLAs.
                    </p>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Change Management & Deployments</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor deployments in real-time, detect anomalies immediately, and automatically correlate issues 
                    with code changes. Roll back with confidence when problems arise.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Deployment Safety:</strong> Automatic detection of regression issues, performance degradation, 
                      and error rate increases during canary deployments.
                    </p>
                  </div>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Security Operations */}
            <section>
              <div className="text-center mb-8">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-3">Security Operations & Threat Detection</h2>
                <p className="text-muted-foreground">Detect and respond to security threats in real-time</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Runtime Security Monitoring</h3>
                  <p className="text-muted-foreground mb-4">
                    Detect privilege escalations, unauthorized file access, suspicious syscalls, and anomalous process 
                    behavior at the kernel level—before attackers can exploit vulnerabilities.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Threat Detection:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Privilege escalation attempts</li>
                      <li>Container breakout detection</li>
                      <li>Cryptominer identification</li>
                      <li>Reverse shell detection</li>
                      <li>Credential theft prevention</li>
                    </ul>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Compliance & Audit</h3>
                  <p className="text-muted-foreground mb-4">
                    Meet compliance requirements (PCI-DSS, HIPAA, SOC 2) with comprehensive audit trails, file integrity 
                    monitoring, and automated compliance reporting.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Audit Trail:</strong> Immutable logs of all system activities, user actions, and configuration 
                      changes with tamper-proof storage and retention.
                    </p>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Vulnerability Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Identify running processes with known vulnerabilities, track patch status, and prioritize remediation 
                    based on actual risk exposure in your environment.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Risk Prioritization:</strong> Focus on actively exploited vulnerabilities in internet-facing 
                      services rather than chasing every CVE.
                    </p>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Incident Forensics</h3>
                  <p className="text-muted-foreground mb-4">
                    Reconstruct attack timelines, analyze attacker behavior, and understand blast radius with historical 
                    system data and AI-powered correlation.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Investigation Power:</strong> Query historical data to answer "What processes were running when 
                      this file was accessed?" or "Which systems did this compromised account touch?"
                    </p>
                  </div>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Cloud & Container Platforms */}
            <section>
              <div className="text-center mb-8">
                <Cloud className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-3">Cloud & Container Platforms</h2>
                <p className="text-muted-foreground">Monitor modern cloud-native infrastructure at scale</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassMorphicCard>
                  <Container className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-xl font-semibold mb-3">Kubernetes Monitoring</h3>
                  <p className="text-muted-foreground mb-4">
                    Full visibility into K8s clusters: pod performance, node health, network policies, and cross-namespace 
                    communication. Understand resource usage down to the container level.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Pod and container metrics</li>
                    <li>Network policy enforcement monitoring</li>
                    <li>Service mesh observability</li>
                    <li>CrashLoopBackOff root cause analysis</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Workflow className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-xl font-semibold mb-3">Microservices Observability</h3>
                  <p className="text-muted-foreground mb-4">
                    Trace requests across distributed systems, understand service dependencies, and identify cross-service 
                    performance bottlenecks without code instrumentation.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Distributed tracing with eBPF</li>
                    <li>Service dependency mapping</li>
                    <li>Request flow visualization</li>
                    <li>Latency breakdown by service</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Database className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-xl font-semibold mb-3">Multi-Cloud Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Unified monitoring across AWS, Azure, GCP, and on-premise infrastructure. Single pane of glass for 
                    hybrid cloud environments.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Cross-cloud resource tracking</li>
                    <li>Unified alerting and dashboards</li>
                    <li>Cost optimization insights</li>
                    <li>Cloud-agnostic monitoring</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Binary className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-xl font-semibold mb-3">Serverless & Functions</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor AWS Lambda, Azure Functions, and other serverless platforms. Cold start detection, execution 
                    time optimization, and resource usage tracking.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Function-level performance metrics</li>
                    <li>Cold start analysis</li>
                    <li>Cost per invocation tracking</li>
                    <li>Memory optimization recommendations</li>
                  </ul>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Database & Application Performance */}
            <section>
              <div className="text-center mb-8">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-3">Database & Application Performance</h2>
                <p className="text-muted-foreground">Optimize critical workloads and eliminate bottlenecks</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Database Query Monitoring</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor PostgreSQL, MySQL, MongoDB query performance without database plugins. Identify slow queries, 
                    lock contention, and connection pool issues.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Database Insights:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Query execution time tracking</li>
                      <li>Index usage analysis</li>
                      <li>Connection pool monitoring</li>
                      <li>Deadlock detection</li>
                    </ul>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-xl font-semibold mb-3">Application Performance Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Profile applications in production without code changes. Understand CPU hotspots, memory leaks, and 
                    I/O bottlenecks across any language or framework.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Supported Languages:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Java, Python, Node.js, Go, Rust</li>
                      <li>C/C++ applications</li>
                      <li>Ruby, PHP, .NET</li>
                      <li>Native and interpreted languages</li>
                    </ul>
                  </div>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Industry-Specific */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Industry-Specific Solutions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Financial Services</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Meet strict compliance requirements while maintaining high-performance trading systems and real-time 
                    fraud detection platforms.
                  </p>
                  <p className="text-xs text-muted-foreground">PCI-DSS, SOC 2, regulatory audit trails</p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Healthcare & Life Sciences</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    HIPAA-compliant monitoring for electronic health records, medical imaging systems, and research 
                    computing infrastructure.
                  </p>
                  <p className="text-xs text-muted-foreground">PHI protection, audit logging, access control</p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">E-commerce & Retail</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Handle Black Friday traffic spikes, optimize checkout flows, and ensure payment processing reliability 
                    during peak shopping seasons.
                  </p>
                  <p className="text-xs text-muted-foreground">Auto-scaling insights, conversion optimization</p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Media & Gaming</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Monitor game servers, streaming platforms, and content delivery networks. Reduce latency and ensure 
                    smooth user experiences.
                  </p>
                  <p className="text-xs text-muted-foreground">Real-time performance, global CDN monitoring</p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">SaaS Platforms</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Multi-tenant isolation monitoring, per-customer resource tracking, and fair-share enforcement for 
                    SaaS infrastructure.
                  </p>
                  <p className="text-xs text-muted-foreground">Tenant isolation, resource quotas, chargeback</p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Research & HPC</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Monitor high-performance computing clusters, GPU workloads, and distributed scientific computations 
                    at massive scale.
                  </p>
                  <p className="text-xs text-muted-foreground">HPC scheduling, GPU utilization, job profiling</p>
                </GlassMorphicCard>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center py-12">
              <GlassMorphicCard className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Find Your Use Case</h2>
                <p className="text-muted-foreground mb-6">
                  Every infrastructure is unique. Schedule a personalized demo to see how NannyAI can solve your 
                  specific challenges.
                </p>
                <a 
                  href="/contact" 
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Schedule a Demo
                </a>
              </GlassMorphicCard>
            </section>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default UseCases;