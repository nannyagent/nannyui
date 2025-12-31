import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { 
  Download, 
  Activity, 
  Brain, 
  Bell, 
  ArrowRight,
  Server,
  Cloud,
  Shield,
  Zap
} from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-bold mb-6">How NannyAI Works</h1>
            <p className="text-xl text-muted-foreground">
              From deployment to insights in minutes. Understand the technology behind intelligent Linux monitoring.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Architecture Overview */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">System Architecture</h2>
              <GlassMorphicCard className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Server className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">eBPF Agent</h3>
                    <p className="text-sm text-muted-foreground">
                      Lightweight monitoring agent deployed on your Linux servers. Collects kernel-level metrics with zero overhead.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Cloud className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Cloud Platform</h3>
                    <p className="text-sm text-muted-foreground">
                      Scalable cloud infrastructure for data aggregation, storage, and processing. Enterprise-grade security and reliability.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">AI Engine</h3>
                    <p className="text-sm text-muted-foreground">
                      Machine learning models for anomaly detection, root cause analysis, and predictive analytics.
                    </p>
                  </div>
                </div>
              </GlassMorphicCard>

              <div className="bg-secondary/20 border border-primary/20 rounded-lg p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center space-x-4 w-full">
                    <div className="flex-1 text-center">
                      <div className="bg-primary/10 rounded-lg p-4 inline-block">
                        <Server className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm mt-2 font-semibold">Your Servers</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary" />
                    <div className="flex-1 text-center">
                      <div className="bg-primary/10 rounded-lg p-4 inline-block">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm mt-2 font-semibold">Secure TLS 1.3</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary" />
                    <div className="flex-1 text-center">
                      <div className="bg-primary/10 rounded-lg p-4 inline-block">
                        <Cloud className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm mt-2 font-semibold">NannyAI Cloud</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary" />
                    <div className="flex-1 text-center">
                      <div className="bg-primary/10 rounded-lg p-4 inline-block">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm mt-2 font-semibold">AI Analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step-by-Step Process */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Getting Started in 4 Steps</h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <GlassMorphicCard className="hover:scale-[1.02] transition-transform">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Download className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-semibold">Install the Agent</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Deploy the lightweight NannyAI agent on your Linux servers in seconds using our one-line installer. 
                        Supports all major distributions including Ubuntu, CentOS, RHEL, Debian, and Amazon Linux.
                      </p>
                      <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm">
                        <p className="text-muted-foreground mb-2"># Quick install with curl:</p>
                        <code className="text-primary">curl -fsSL https://raw.githubusercontent.com/nannyagent/nannyagent/main/install.sh | sudo bash</code>
                        <p className="text-muted-foreground mt-4 mb-2"># Or with authentication token:</p>
                        <code className="text-primary">curl -sSL https://download.nannyai.dev/install.sh | sudo NANNYAI_TOKEN=your_token bash</code>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">&lt; 10 MB agent footprint</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">&lt; 1% CPU usage</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Auto-updates enabled</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Kernel 4.14+ required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>

                {/* Step 2 */}
                <GlassMorphicCard className="hover:scale-[1.02] transition-transform">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Activity className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-semibold">Data Collection Begins</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Once installed, the eBPF agent immediately starts collecting kernel-level metrics, events, and traces. 
                        Data is encrypted and securely transmitted to the NannyAI cloud platform every few seconds.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-secondary/50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">System Metrics</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• CPU, memory, disk, network</li>
                            <li>• Process and thread activity</li>
                            <li>• System call tracing</li>
                            <li>• Kernel events and hooks</li>
                          </ul>
                        </div>
                        <div className="bg-secondary/50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Application Data</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• HTTP/HTTPS request tracking</li>
                            <li>• Database query performance</li>
                            <li>• File I/O operations</li>
                            <li>• Network connections</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm">
                          <strong className="text-primary">eBPF Advantage:</strong> Unlike traditional monitoring tools, eBPF runs 
                          in the kernel with zero instrumentation overhead. No application code changes required.
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>

                {/* Step 3 */}
                <GlassMorphicCard className="hover:scale-[1.02] transition-transform">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Brain className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-semibold">AI Analysis & Learning</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Our AI engine continuously analyzes incoming data to establish baselines, detect anomalies, and identify 
                        patterns. Machine learning models adapt to your unique infrastructure and workloads.
                      </p>
                      <div className="space-y-3">
                        <div className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold mb-1">Baseline Learning (First 7 Days)</h4>
                          <p className="text-sm text-muted-foreground">
                            The system learns normal behavior patterns, resource utilization trends, and application performance 
                            characteristics specific to your environment.
                          </p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold mb-1">Anomaly Detection (Continuous)</h4>
                          <p className="text-sm text-muted-foreground">
                            Real-time detection of deviations from normal behavior using statistical models and machine learning. 
                            Automatically adapts to workload changes and seasonal patterns.
                          </p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold mb-1">Root Cause Analysis (On-Demand)</h4>
                          <p className="text-sm text-muted-foreground">
                            When issues occur, AI correlates events across time and systems to identify root causes. 
                            Provides natural language explanations and remediation suggestions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>

                {/* Step 4 */}
                <GlassMorphicCard className="hover:scale-[1.02] transition-transform">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Bell className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-semibold">Insights & Alerts</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Access actionable insights through the web dashboard, receive intelligent alerts via your preferred channels, 
                        and leverage our API for automation and integration with existing tools.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-secondary/50 p-4 rounded-lg text-center">
                          <div className="text-3xl font-bold text-primary mb-1">Dashboard</div>
                          <p className="text-sm text-muted-foreground">
                            Real-time visualizations, custom dashboards, investigation tracking
                          </p>
                        </div>
                        <div className="bg-secondary/50 p-4 rounded-lg text-center">
                          <div className="text-3xl font-bold text-primary mb-1">Alerts</div>
                          <p className="text-sm text-muted-foreground">
                            Slack, PagerDuty, email, webhooks, SMS notifications
                          </p>
                        </div>
                        <div className="bg-secondary/50 p-4 rounded-lg text-center">
                          <div className="text-3xl font-bold text-primary mb-1">API</div>
                          <p className="text-sm text-muted-foreground">
                            RESTful API for automation, CI/CD integration, custom tools
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Technology Deep Dive */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Technology Deep Dive</h2>
              
              <div className="space-y-6">
                <GlassMorphicCard>
                  <h3 className="text-2xl font-semibold mb-4">eBPF: The Foundation</h3>
                  <p className="text-muted-foreground mb-4">
                    Extended Berkeley Packet Filter (eBPF) is a revolutionary Linux kernel technology that allows programs to run 
                    sandboxed within the kernel without changing kernel source code or loading kernel modules.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Why eBPF?</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Zero overhead monitoring</li>
                        <li>Kernel-level visibility</li>
                        <li>Safe execution (verified by kernel)</li>
                        <li>No application code changes</li>
                        <li>Dynamic instrumentation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Use Cases</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Performance monitoring</li>
                        <li>Network packet processing</li>
                        <li>Security policy enforcement</li>
                        <li>Tracing and profiling</li>
                        <li>Service mesh data plane</li>
                      </ul>
                    </div>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-2xl font-semibold mb-4">AI-Powered Diagnostics</h3>
                  <p className="text-muted-foreground mb-4">
                    NannyAI combines traditional rule-based monitoring with advanced machine learning to deliver intelligent, 
                    context-aware diagnostics.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Supervised Learning</h4>
                      <p className="text-sm text-muted-foreground">
                        Trained on thousands of labeled incidents to recognize common failure patterns, performance issues, 
                        and security threats.
                      </p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Unsupervised Learning</h4>
                      <p className="text-sm text-muted-foreground">
                        Discovers novel anomalies and unexpected patterns specific to your environment without prior knowledge.
                      </p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Reinforcement Learning</h4>
                      <p className="text-sm text-muted-foreground">
                        Learns from your feedback on investigations to improve accuracy and reduce false positives over time.
                      </p>
                    </div>
                  </div>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-2xl font-semibold mb-4">Data Pipeline</h3>
                  <p className="text-muted-foreground mb-4">
                    Our high-performance data pipeline processes millions of events per second with sub-second latency.
                  </p>
                  <div className="bg-secondary/20 border border-primary/20 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="font-semibold mb-1">1. Collection</div>
                        <p className="text-xs text-muted-foreground">eBPF probes</p>
                      </div>
                      <div>
                        <ArrowRight className="h-6 w-6 text-primary mx-auto my-2" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">2. Processing</div>
                        <p className="text-xs text-muted-foreground">Stream processing</p>
                      </div>
                      <div>
                        <ArrowRight className="h-6 w-6 text-primary mx-auto my-2" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">3. Storage</div>
                        <p className="text-xs text-muted-foreground">Time-series DB</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center mt-6">
                      <div>
                        <div className="font-semibold mb-1">4. Analysis</div>
                        <p className="text-xs text-muted-foreground">ML models</p>
                      </div>
                      <div>
                        <ArrowRight className="h-6 w-6 text-primary mx-auto my-2" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">5. Visualization</div>
                        <p className="text-xs text-muted-foreground">Dashboard/API</p>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Security & Privacy */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Security & Privacy by Design</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassMorphicCard>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Data Protection</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>TLS 1.3 encryption in transit</li>
                    <li>AES-256 encryption at rest</li>
                    <li>Zero-knowledge architecture option</li>
                    <li>GDPR and SOC 2 compliant</li>
                    <li>Data residency controls (hosted in Germany)</li>
                  </ul>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Agent Security</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>No changes are made to system</li>
                    <li>Sandboxed eBPF execution</li>
                    <li>Cryptographically signed binaries</li>
                    <li>Automatic security updates</li>
                    <li>Open source agent code</li>
                  </ul>
                </GlassMorphicCard>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center py-12">
              <GlassMorphicCard className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Ready to See It in Action?</h2>
                <p className="text-muted-foreground mb-6">
                  Start monitoring your Linux infrastructure in minutes. Free trial includes full access to all features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/login" 
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Start Free Trial
                  </a>
                  <a 
                    href="/docs" 
                    className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Read Documentation
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

export default HowItWorks;