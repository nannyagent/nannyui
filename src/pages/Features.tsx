import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { 
  Activity, 
  Brain, 
  Bell, 
  Shield, 
  BarChart3, 
  Zap, 
  Search, 
  Lock,
  Clock,
  GitBranch,
  Database,
  Terminal
} from 'lucide-react';

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-bold mb-6">Powerful Features for Modern Linux Infrastructure</h1>
            <p className="text-xl text-muted-foreground">
              NannyAI combines eBPF technology with AI-powered diagnostics to deliver unparalleled visibility and intelligent insights 
              for your Linux systems.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Core Monitoring */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Core Monitoring Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Activity className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Real-Time System Metrics</h3>
                  <p className="text-muted-foreground">
                    Monitor CPU, memory, disk I/O, and network activity with microsecond precision using eBPF probes. 
                    Zero overhead, kernel-level visibility.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Terminal className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Process Monitoring</h3>
                  <p className="text-muted-foreground">
                    Track process creation, execution, and termination. Monitor syscalls, file operations, and resource consumption 
                    per process in real-time.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Database className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Network Traffic Analysis</h3>
                  <p className="text-muted-foreground">
                    Deep packet inspection, connection tracking, and protocol analysis. Identify network bottlenecks and 
                    security threats without packet capture overhead.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Security Event Detection</h3>
                  <p className="text-muted-foreground">
                    Detect privilege escalations, unauthorized file access, suspicious syscalls, and anomalous behavior 
                    patterns in real-time.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <BarChart3 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Performance Profiling</h3>
                  <p className="text-muted-foreground">
                    CPU flame graphs, memory allocation tracking, latency analysis, and I/O profiling. 
                    Identify performance bottlenecks with precision.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <GitBranch className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Distributed Tracing</h3>
                  <p className="text-muted-foreground">
                    Trace requests across microservices and containers. Understand service dependencies and 
                    identify cross-service performance issues.
                  </p>
                </GlassMorphicCard>
              </div>
            </section>

            {/* AI-Powered Intelligence */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">AI-Powered Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Brain className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Automated Root Cause Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI engine automatically investigates system issues, correlates events across multiple data sources, 
                    and identifies root causes without manual intervention.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Multi-dimensional correlation analysis</li>
                    <li>Historical pattern matching</li>
                    <li>Causal inference algorithms</li>
                    <li>Natural language explanations</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Search className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Anomaly Detection</h3>
                  <p className="text-muted-foreground mb-4">
                    Machine learning models continuously learn normal system behavior and automatically detect deviations, 
                    reducing alert fatigue and catching issues before they impact users.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Unsupervised learning algorithms</li>
                    <li>Baseline behavior modeling</li>
                    <li>Adaptive thresholds</li>
                    <li>Context-aware alerting</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Predictive Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Forecast resource utilization, predict failures before they occur, and receive proactive recommendations 
                    for capacity planning and optimization.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Time-series forecasting</li>
                    <li>Failure prediction models</li>
                    <li>Capacity planning recommendations</li>
                    <li>Trend analysis and insights</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Bell className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Intelligent Alerting</h3>
                  <p className="text-muted-foreground mb-4">
                    Smart alert prioritization, automatic grouping of related events, and noise reduction through 
                    machine learning-based correlation.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Dynamic severity scoring</li>
                    <li>Alert correlation and deduplication</li>
                    <li>Business impact assessment</li>
                    <li>Customizable notification channels</li>
                  </ul>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Management & Integration */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Management & Integration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassMorphicCard>
                  <Clock className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Centralized Agent Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Deploy, configure, and manage monitoring agents across thousands of servers from a single dashboard. 
                    Automatic updates and health monitoring.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Lock className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">RESTful API</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive API for programmatic access to all features. Integrate with existing tools, 
                    automate workflows, and build custom integrations.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Database className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Custom Dashboards</h3>
                  <p className="text-sm text-muted-foreground">
                    Build custom visualizations, create team-specific views, and share insights with stakeholders. 
                    Drag-and-drop dashboard builder.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <GitBranch className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Third-Party Integrations</h3>
                  <p className="text-sm text-muted-foreground">
                    Native integrations with Slack, PagerDuty, Jira, ServiceNow, Prometheus, Grafana, and more. 
                    Webhook support for custom integrations.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Shield className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">RBAC & Access Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Fine-grained role-based access control, team management, and audit logging. 
                    SSO/SAML support for enterprise authentication.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <BarChart3 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Historical Data & Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Long-term metric retention, historical trend analysis, and data export capabilities. 
                    Query language for advanced analytics.
                  </p>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Enterprise Features */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Enterprise Features</h2>
              <GlassMorphicCard className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Security & Compliance</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      <li>SOC 2 Type II certified</li>
                      <li>GDPR and CCPA compliant</li>
                      <li>End-to-end encryption</li>
                      <li>Private deployment options</li>
                      <li>Audit trail and compliance reporting</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Support & SLA</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      <li>24/7 priority support</li>
                      <li>99.9% uptime guarantee</li>
                      <li>Dedicated customer success manager</li>
                      <li>Custom onboarding and training</li>
                      <li>Professional services available</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Scalability</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Monitor 10,000+ servers</li>
                      <li>Multi-region deployment</li>
                      <li>High-availability architecture</li>
                      <li>Auto-scaling infrastructure</li>
                      <li>Performance optimized for scale</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Customization</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Custom eBPF probe development</li>
                      <li>White-label options</li>
                      <li>On-premise deployment</li>
                      <li>Custom data retention policies</li>
                      <li>Tailored integration support</li>
                    </ul>
                  </div>
                </div>
              </GlassMorphicCard>
            </section>

            {/* CTA */}
            <section className="text-center py-12">
              <GlassMorphicCard className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-6">
                  Experience the power of eBPF-based monitoring with AI-powered diagnostics. 
                  Start your free trial today—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/login" 
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Start Free Trial
                  </a>
                  <a 
                    href="/contact" 
                    className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Schedule Demo
                  </a>
                </div>
              </GlassMorphicCard>
            </section>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default Features;