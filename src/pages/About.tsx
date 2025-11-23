import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { Server, Users, Globe, Target, Zap, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About NannyAI</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing Linux system monitoring and diagnostics through intelligent agents powered by eBPF technology
            </p>
          </div>

          {/* Mission Section */}
          <GlassMorphicCard className="mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  NannyAI empowers DevOps teams, SREs, and system administrators with intelligent, real-time insights into Linux system behavior. 
                  By leveraging eBPF (extended Berkeley Packet Filter) technology, we provide deep observability without the overhead of traditional monitoring solutions.
                </p>
                <p className="text-muted-foreground">
                  Our mission is to make Linux system monitoring accessible, efficient, and intelligent for organizations of all sizes, 
                  from startups to enterprise-scale deployments.
                </p>
              </div>
              <div className="flex justify-center">
                <Server className="h-48 w-48 text-primary opacity-20" />
              </div>
            </div>
          </GlassMorphicCard>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <GlassMorphicCard>
                <div className="text-center">
                  <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Performance</h3>
                  <p className="text-muted-foreground">
                    Zero overhead monitoring using eBPF technology ensures your systems run at peak performance
                  </p>
                </div>
              </GlassMorphicCard>

              <GlassMorphicCard>
                <div className="text-center">
                  <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Security</h3>
                  <p className="text-muted-foreground">
                    Built with security-first principles, providing safe kernel-level visibility without compromising system integrity
                  </p>
                </div>
              </GlassMorphicCard>

              <GlassMorphicCard>
                <div className="text-center">
                  <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Open Source</h3>
                  <p className="text-muted-foreground">
                    Committed to open-source principles, contributing to and building upon the Linux ecosystem
                  </p>
                </div>
              </GlassMorphicCard>
            </div>
          </div>

          {/* Technology Section */}
          <GlassMorphicCard className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Powered by eBPF</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                NannyAI is built on top of eBPF (extended Berkeley Packet Filter), a revolutionary Linux kernel technology that allows 
                our agents to safely execute sandboxed programs in the kernel without changing kernel source code or loading kernel modules.
              </p>
              <p>
                This technology enables us to provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real-time performance monitoring with near-zero overhead</li>
                <li>Deep system observability at the kernel level</li>
                <li>Network traffic analysis and security monitoring</li>
                <li>Application performance tracing</li>
                <li>Dynamic kernel instrumentation</li>
              </ul>
              <p>
                Our platform combines eBPF's power with AI-driven analysis to automatically detect anomalies, 
                predict issues, and provide actionable recommendations for system optimization.
              </p>
            </div>
          </GlassMorphicCard>

          {/* Why Choose Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose NannyAI?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <GlassMorphicCard>
                <div className="flex items-start space-x-4">
                  <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Intelligent Diagnostics</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered root cause analysis that automatically investigates issues and provides detailed diagnostic reports
                    </p>
                  </div>
                </div>
              </GlassMorphicCard>

              <GlassMorphicCard>
                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Easy Deployment</h3>
                    <p className="text-sm text-muted-foreground">
                      Simple agent installation with minimal configuration, works out-of-the-box on all modern Linux distributions
                    </p>
                  </div>
                </div>
              </GlassMorphicCard>

              <GlassMorphicCard>
                <div className="flex items-start space-x-4">
                  <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Real-Time Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant visibility into system behavior with live dashboards and alerting capabilities
                    </p>
                  </div>
                </div>
              </GlassMorphicCard>

              <GlassMorphicCard>
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Enterprise Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Scalable architecture supporting thousands of agents with role-based access control and audit logging
                    </p>
                  </div>
                </div>
              </GlassMorphicCard>
            </div>
          </div>

          {/* Team Section */}
          <GlassMorphicCard>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Built by Engineers, for Engineers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Our team consists of experienced Linux kernel developers, eBPF experts, and DevOps practitioners who understand 
                the challenges of modern infrastructure management firsthand.
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're passionate about building tools that make Linux systems more observable, reliable, and easier to manage 
                at scale. Join us in revolutionizing system monitoring!
              </p>
            </div>
          </GlassMorphicCard>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default About;