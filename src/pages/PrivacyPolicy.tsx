import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { Shield, Lock, Eye, UserCheck, Database, AlertTriangle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 12, 2025</p>

          <div className="space-y-8">
            <GlassMorphicCard>
              <div className="flex items-start space-x-4 mb-6">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                  <p className="text-muted-foreground mb-4">
                    NannyAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                    use, disclose, and safeguard your information when you use our Linux system monitoring and diagnostics platform.
                  </p>
                  <p className="text-muted-foreground">
                    We take your privacy seriously and are committed to transparency about our data practices.
                  </p>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Database className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                  
                  <h3 className="text-lg font-semibold mb-2 mt-4">Account Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Email address</li>
                    <li>Name and organization details</li>
                    <li>Password (encrypted)</li>
                    <li>Account preferences and settings</li>
                  </ul>

                  <h3 className="text-lg font-semibold mb-2 mt-4">System Telemetry Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>System metrics (CPU, memory, disk, network usage)</li>
                    <li>Process and application performance data</li>
                    <li>Kernel events and system calls (via eBPF)</li>
                    <li>Network traffic metadata (not content)</li>
                    <li>Agent health and status information</li>
                  </ul>

                  <h3 className="text-lg font-semibold mb-2 mt-4">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Dashboard interactions and feature usage</li>
                    <li>API calls and access patterns</li>
                    <li>Login times and IP addresses</li>
                    <li>Browser type and device information</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <UserCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">We use the collected information for:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Providing and maintaining our monitoring services</li>
                    <li>Analyzing system performance and generating diagnostic insights</li>
                    <li>Detecting anomalies and potential security threats</li>
                    <li>Improving our AI models and platform features</li>
                    <li>Sending service notifications and updates</li>
                    <li>Providing customer support</li>
                    <li>Ensuring platform security and preventing fraud</li>
                    <li>Complying with legal obligations</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                  <p className="text-muted-foreground mb-4">
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>End-to-end encryption for data in transit (TLS 1.3)</li>
                    <li>Encryption at rest using AES-256</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Role-based access controls (RBAC)</li>
                    <li>Multi-factor authentication (MFA) support</li>
                    <li>Automated threat detection and response</li>
                    <li>Regular data backups with encryption</li>
                    <li>SOC 2 Type II compliance (in progress)</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Eye className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
                  <p className="text-muted-foreground mb-4">
                    We do not sell your personal information. We may share your data only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (cloud hosting, analytics)</li>
                    <li><strong>Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                    <li><strong>Aggregated Data:</strong> Anonymous, aggregated statistics for research and product improvement</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us at <a href="mailto:support@nannyai.dev" className="text-primary hover:underline">support@nannyai.dev</a>
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your data for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after deletion</li>
                <li><strong>System Metrics:</strong> Stored for up to 13 months for historical analysis</li>
                <li><strong>Logs and Events:</strong> Retained for 90 days</li>
                <li><strong>Billing Information:</strong> Kept for 7 years for tax and legal compliance</li>
              </ul>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies for authentication, preferences, and analytics. You can control cookie 
                preferences through your browser settings. See our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards 
                are in place, including Standard Contractual Clauses (SCCs) and data processing agreements compliant with GDPR 
                and other applicable regulations.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not directed to individuals under 18 years of age. We do not knowingly collect personal information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                    the new policy on this page and updating the "Last updated" date. Continued use of our services after changes 
                    constitute acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="text-muted-foreground space-y-2">
                <p><strong>Email:</strong> <a href="mailto:support@nannyai.dev" className="text-primary hover:underline">support@nannyai.dev</a></p>
                <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@nannyai.dev" className="text-primary hover:underline">dpo@nannyai.dev</a></p>
                <p><strong>Address:</strong> NannyAI, Inc., 123 Tech Street, San Francisco, CA 94105, USA</p>
              </div>
            </GlassMorphicCard>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;