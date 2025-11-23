import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { FileCode, BookOpen, Shield, ExternalLink } from 'lucide-react';

const License = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">License & Open Source</h1>
          <p className="text-muted-foreground mb-8">Software licensing and open source compliance information</p>

          <div className="space-y-8">
            <GlassMorphicCard>
              <div className="flex items-start space-x-4 mb-6">
                <FileCode className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">NannyAI Agent License</h2>
                  <p className="text-muted-foreground mb-4">
                    The NannyAI monitoring agent is released under the Apache License 2.0, a permissive open source license 
                    that allows you to use, modify, and distribute the software freely.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm">
                    <p className="font-semibold mb-2">Apache License 2.0</p>
                    <p className="text-muted-foreground">
                      Copyright © 2025 NannyAI, Inc.
                    </p>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Full Apache 2.0 License Text</h2>
              <div className="bg-secondary/50 p-6 rounded-lg font-mono text-xs overflow-auto max-h-96">
                <pre className="text-muted-foreground whitespace-pre-wrap">
{`Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License.

"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship.

"Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner.

2. Grant of Copyright License.

Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

3. Grant of Patent License.

Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work.

4. Redistribution.

You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, provided that You meet the following conditions:

   (a) You must give any other recipients of the Work or Derivative Works a copy of this License.
   (b) You must cause any modified files to carry prominent notices stating that You changed the files.
   (c) You must retain, in the Source form of any Derivative Works, all copyright, patent, trademark, and attribution notices.
   (d) If the Work includes a "NOTICE" text file, You must include a readable copy of the attribution notices.

5. Submission of Contributions.

Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work shall be under the terms and conditions of this License.

6. Trademarks.

This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for describing the origin of the Work.

7. Disclaimer of Warranty.

Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE.

8. Limitation of Liability.

In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work.

9. Accepting Warranty or Additional Liability.

While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License.`}
                </pre>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">What This Means For You</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">✅ You Can:</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Use the software commercially</li>
                        <li>Modify the source code</li>
                        <li>Distribute your modifications</li>
                        <li>Use the software privately</li>
                        <li>Include it in proprietary software</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">📋 You Must:</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Include the original copyright notice</li>
                        <li>Include a copy of the license</li>
                        <li>State significant changes made to the code</li>
                        <li>Include the NOTICE file if one exists</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">❌ You Cannot:</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Hold the authors liable for damages</li>
                        <li>Use the NannyAI trademark without permission</li>
                        <li>Claim warranty from the original authors</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Cloud Platform License</h2>
              <p className="text-muted-foreground mb-4">
                The NannyAI cloud platform, dashboard, and proprietary services are <strong>not</strong> open source and remain 
                the exclusive property of NannyAI, Inc. These components are licensed under our commercial Terms of Service.
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Components under commercial license:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Web dashboard and UI</li>
                  <li>AI/ML diagnostic models</li>
                  <li>Cloud infrastructure orchestration</li>
                  <li>API services and backend systems</li>
                  <li>Proprietary analytics algorithms</li>
                </ul>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Third-Party Open Source Components</h2>
                  <p className="text-muted-foreground mb-4">
                    NannyAI builds upon the excellent work of the open source community. We use and acknowledge the following projects:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold">eBPF (Extended Berkeley Packet Filter)</h3>
                      <p className="text-sm text-muted-foreground">Licensed under GPL v2</p>
                      <a 
                        href="https://ebpf.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                      >
                        ebpf.io <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold">Linux Kernel</h3>
                      <p className="text-sm text-muted-foreground">Licensed under GPL v2</p>
                      <a 
                        href="https://www.kernel.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                      >
                        kernel.org <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold">libbpf</h3>
                      <p className="text-sm text-muted-foreground">Licensed under LGPL v2.1 or BSD-2-Clause</p>
                      <a 
                        href="https://github.com/libbpf/libbpf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                      >
                        GitHub Repository <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold">BPF Compiler Collection (BCC)</h3>
                      <p className="text-sm text-muted-foreground">Licensed under Apache 2.0</p>
                      <a 
                        href="https://github.com/iovisor/bcc" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                      >
                        GitHub Repository <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold">Prometheus</h3>
                      <p className="text-sm text-muted-foreground">Licensed under Apache 2.0</p>
                      <a 
                        href="https://prometheus.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                      >
                        prometheus.io <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold">React</h3>
                      <p className="text-sm text-muted-foreground">Licensed under MIT</p>
                      <a 
                        href="https://react.dev" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                      >
                        react.dev <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Complete Dependency List</h2>
              <p className="text-muted-foreground mb-4">
                For a complete list of all third-party dependencies and their licenses used in NannyAI, please see our GitHub repository:
              </p>
              <a 
                href="https://github.com/nannyai/agent/blob/main/DEPENDENCIES.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                View Full Dependency List <ExternalLink className="h-4 w-4" />
              </a>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Contributing</h2>
              <p className="text-muted-foreground mb-4">
                We welcome contributions to our open source components! By contributing, you agree that your contributions will be 
                licensed under the Apache License 2.0.
              </p>
              <div className="space-y-2">
                <a 
                  href="https://github.com/nannyai/agent/blob/main/CONTRIBUTING.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-2 block"
                >
                  Contribution Guidelines <ExternalLink className="h-4 w-4" />
                </a>
                <a 
                  href="https://github.com/nannyai/agent/blob/main/CODE_OF_CONDUCT.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-2 block"
                >
                  Code of Conduct <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Questions About Licensing?</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about licensing, commercial use, or need clarification on how you can use NannyAI:
              </p>
              <div className="text-muted-foreground space-y-2">
                <p><strong>Email:</strong> <a href="mailto:legal@nannyai.dev" className="text-primary hover:underline">legal@nannyai.dev</a></p>
                <p><strong>GitHub:</strong> <a href="https://github.com/nannyai" className="text-primary hover:underline">github.com/nannyai</a></p>
              </div>
            </GlassMorphicCard>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default License;