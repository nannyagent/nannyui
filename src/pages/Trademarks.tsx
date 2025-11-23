import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { Copyright, ExternalLink } from 'lucide-react';

const Trademarks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Trademarks & Attributions</h1>
          <p className="text-muted-foreground mb-8">
            NannyAI respects intellectual property rights and acknowledges the trademarks and technologies we build upon.
          </p>

          <div className="space-y-8">
            <GlassMorphicCard>
              <div className="flex items-start space-x-4 mb-6">
                <Copyright className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">NannyAI Trademarks</h2>
                  <p className="text-muted-foreground mb-4">
                    The following marks are trademarks or registered trademarks of NannyAI, Inc. in the United States 
                    and/or other countries:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>NannyAI®</strong> - Our company name and primary mark</li>
                    <li><strong>NannyAI Logo</strong> - Our distinctive logo design</li>
                    <li>All related product and service names</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Linux® Trademark</h2>
              <p className="text-muted-foreground mb-4">
                Linux® is the registered trademark of Linus Torvalds in the U.S. and other countries. NannyAI is not 
                affiliated with or endorsed by Linus Torvalds or The Linux Foundation.
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  NannyAI provides monitoring and diagnostics software for Linux-based systems. Our use of the term "Linux" 
                  is purely descriptive and refers to the operating system kernel and related distributions.
                </p>
              </div>
              <a 
                href="https://www.linuxfoundation.org/legal/the-linux-mark" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-2 mt-4"
              >
                Learn more about the Linux trademark <ExternalLink className="h-4 w-4" />
              </a>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">eBPF™ Trademark</h2>
              <p className="text-muted-foreground mb-4">
                eBPF™ (Extended Berkeley Packet Filter) is a trademark associated with The Linux Foundation. NannyAI 
                uses eBPF technology as part of our monitoring solution but is an independent company.
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  eBPF is a revolutionary technology built into the Linux kernel that allows safe, efficient programs 
                  to run in kernel space. We use eBPF to provide kernel-level visibility without compromising system security.
                </p>
              </div>
              <a 
                href="https://ebpf.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-2 mt-4"
              >
                Visit ebpf.io <ExternalLink className="h-4 w-4" />
              </a>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Trademarks</h2>
              <p className="text-muted-foreground mb-4">
                The following are trademarks or registered trademarks of their respective owners:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Operating Systems & Distributions</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Red Hat® - Red Hat, Inc.</li>
                    <li>• Ubuntu® - Canonical Ltd.</li>
                    <li>• SUSE® - SUSE LLC</li>
                    <li>• CentOS™ - Red Hat, Inc.</li>
                    <li>• Debian® - Software in the Public Interest, Inc.</li>
                    <li>• Amazon Linux™ - Amazon Web Services, Inc.</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Cloud & Infrastructure</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AWS®, Amazon Web Services® - Amazon.com, Inc.</li>
                    <li>• Microsoft Azure® - Microsoft Corporation</li>
                    <li>• Google Cloud™ - Google LLC</li>
                    <li>• Kubernetes® - The Linux Foundation</li>
                    <li>• Docker® - Docker, Inc.</li>
                    <li>• Prometheus® - The Linux Foundation</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Monitoring & Observability</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Grafana® - Grafana Labs</li>
                    <li>• Datadog® - Datadog, Inc.</li>
                    <li>• PagerDuty® - PagerDuty, Inc.</li>
                    <li>• Slack® - Slack Technologies, LLC</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Development & Technologies</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• React® - Meta Platforms, Inc.</li>
                    <li>• Node.js® - OpenJS Foundation</li>
                    <li>• Python® - Python Software Foundation</li>
                    <li>• PostgreSQL® - PostgreSQL Global Development Group</li>
                    <li>• MongoDB® - MongoDB, Inc.</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Open Source Attributions</h2>
              <p className="text-muted-foreground mb-4">
                NannyAI builds upon excellent open source projects. We acknowledge and thank the communities behind:
              </p>
              <div className="space-y-3">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">eBPF & BPF Tooling</h3>
                  <p className="text-sm text-muted-foreground">
                    libbpf, BCC (BPF Compiler Collection), bpftrace - Licensed under various open source licenses. 
                    See our <a href="/license" className="text-primary hover:underline">License page</a> for details.
                  </p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Linux Kernel</h3>
                  <p className="text-sm text-muted-foreground">
                    The Linux kernel, including eBPF infrastructure - Licensed under GPL v2. 
                    Learn more at <a href="https://www.kernel.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">kernel.org</a>
                  </p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Web & UI Technologies</h3>
                  <p className="text-sm text-muted-foreground">
                    React, TypeScript, TailwindCSS, Vite, and numerous other open source projects. 
                    Full attribution available in our <a href="https://github.com/nannyai/agent/blob/main/DEPENDENCIES.md" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">dependency list</a>.
                  </p>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Trademark Usage Guidelines</h2>
              <p className="text-muted-foreground mb-4">
                If you wish to use NannyAI trademarks in your materials, please follow these guidelines:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">✅ Acceptable Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Referring to NannyAI products or services in editorial content</li>
                    <li>Using NannyAI name to indicate compatibility or integration</li>
                    <li>Truthful comparative advertising (subject to trademark law)</li>
                    <li>Linking to our website with proper attribution</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">❌ Prohibited Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Implying endorsement or partnership without written agreement</li>
                    <li>Using NannyAI marks as part of your product or company name</li>
                    <li>Modifying our logos or trademarks</li>
                    <li>Using our marks in a misleading or disparaging manner</li>
                    <li>Domain names containing "nannyai" without authorization</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  For trademark licensing inquiries, please contact: <a href="mailto:legal@nannyai.dev" className="text-primary hover:underline">legal@nannyai.dev</a>
                </p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Copyright Notice</h2>
              <p className="text-muted-foreground">
                © 2025 NannyAI, Inc. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                All other trademarks mentioned on this page are the property of their respective owners. 
                Use of any trademarks on this page is for identification and reference purposes only and does not imply 
                any association or endorsement by the trademark holder.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Report Trademark Misuse</h2>
              <p className="text-muted-foreground mb-4">
                If you believe someone is misusing NannyAI trademarks or violating our intellectual property rights, 
                please report it to our legal team:
              </p>
              <div className="text-muted-foreground space-y-2">
                <p><strong>Email:</strong> <a href="mailto:legal@nannyai.dev" className="text-primary hover:underline">legal@nannyai.dev</a></p>
                <p><strong>Subject:</strong> Trademark Misuse Report</p>
              </div>
            </GlassMorphicCard>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default Trademarks;