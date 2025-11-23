import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { FileText, AlertCircle, Scale, Ban, Shield } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 12, 2025</p>

          <div className="space-y-8">
            <GlassMorphicCard>
              <div className="flex items-start space-x-4 mb-6">
                <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing or using NannyAI's services, you agree to be bound by these Terms of Service and all applicable 
                    laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
                  </p>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
              <p className="text-muted-foreground mb-4">
                NannyAI provides a cloud-based Linux system monitoring and diagnostics platform powered by eBPF technology. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Real-time system monitoring and performance analytics</li>
                <li>AI-powered diagnostic investigations</li>
                <li>Agent management and deployment tools</li>
                <li>API access for programmatic integration</li>
                <li>Dashboard and visualization capabilities</li>
                <li>Alerting and notification services</li>
              </ul>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">2. Account Registration</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>To use our services, you must:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Be at least 18 years old or have parental/guardian consent</li>
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update account information when it changes</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p className="mt-4">
                  You may not share your account credentials or allow others to access your account. You are responsible for 
                  maintaining the confidentiality of your password.
                </p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree NOT to use our services to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Transmit malware, viruses, or harmful code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt our services</li>
                  <li>Reverse engineer our software or APIs</li>
                  <li>Use our services for cryptocurrency mining</li>
                  <li>Monitor systems you don't own or have authorization to monitor</li>
                  <li>Resell or redistribute our services without permission</li>
                  <li>Remove or obscure any proprietary notices</li>
                </ul>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="font-semibold text-foreground">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                  <li>Failed payments may result in service suspension</li>
                  <li>You authorize us to charge your payment method automatically</li>
                </ul>
                
                <h3 className="font-semibold text-foreground mt-4">Cancellation</h3>
                <p>
                  You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. 
                  You will retain access to the services until that date.
                </p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">5. Data Ownership and Usage</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="font-semibold text-foreground">Your Data</h3>
                <p>
                  You retain all rights to the data you upload or generate through our services. You grant us a limited license to 
                  use this data solely to provide our services to you.
                </p>
                
                <h3 className="font-semibold text-foreground mt-4">Our Intellectual Property</h3>
                <p>
                  The NannyAI platform, including all software, algorithms, documentation, and branding, is our exclusive property 
                  and protected by copyright, trademark, and other intellectual property laws.
                </p>
                
                <h3 className="font-semibold text-foreground mt-4">Aggregated Data</h3>
                <p>
                  We may use anonymized, aggregated data for analytics, research, and product improvement purposes without identifying you.
                </p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">6. Service Level Agreement (SLA)</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>For paid subscriptions, we commit to:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>99.9% uptime for our API and core services</li>
                      <li>24/7 system monitoring and incident response</li>
                      <li>Priority support for enterprise customers</li>
                      <li>Regular maintenance windows announced 7 days in advance</li>
                    </ul>
                    <p className="mt-4">
                      Uptime is calculated monthly, excluding scheduled maintenance. Service credits may be issued for 
                      SLA violations as specified in your subscription plan.
                    </p>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="font-semibold text-foreground">DISCLAIMER OF WARRANTIES</p>
                <p>
                  OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE 
                  THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
                </p>
                
                <p className="font-semibold text-foreground mt-4">LIMITATION OF LIABILITY</p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, NANNYAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.
                </p>
                
                <p className="mt-4">
                  Our total liability for any claims related to our services is limited to the amount you paid us in the 12 months 
                  prior to the event giving rise to the claim.
                </p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless NannyAI and its affiliates from any claims, damages, losses, or expenses 
                (including legal fees) arising from your use of our services, violation of these terms, or infringement of any third-party rights.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Ban className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>We may suspend or terminate your access to our services:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>For violation of these Terms of Service</li>
                      <li>For non-payment of fees</li>
                      <li>For fraudulent or illegal activity</li>
                      <li>If required by law or legal process</li>
                      <li>To protect our systems or other users</li>
                    </ul>
                    <p className="mt-4">
                      Upon termination, you must immediately cease using our services. We will provide you with an opportunity 
                      to export your data within 30 days of termination, after which it may be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Scale className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">10. Dispute Resolution</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <h3 className="font-semibold text-foreground">Governing Law</h3>
                    <p>
                      These terms are governed by the laws of the State of California, USA, without regard to conflict of law principles.
                    </p>
                    
                    <h3 className="font-semibold text-foreground mt-4">Arbitration</h3>
                    <p>
                      Any disputes will be resolved through binding arbitration in San Francisco, California, except for claims that 
                      may be brought in small claims court. You waive your right to a jury trial.
                    </p>
                    
                    <h3 className="font-semibold text-foreground mt-4">Class Action Waiver</h3>
                    <p>
                      You agree to resolve disputes individually and waive the right to participate in class actions or collective proceedings.
                    </p>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">11. Export Compliance</h2>
              <p className="text-muted-foreground">
                You agree to comply with all export and import laws and regulations. Our software and services may not be exported 
                or re-exported to certain countries or individuals subject to U.S. export restrictions.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify you of material changes via email or through 
                our platform. Continued use of our services after changes constitutes acceptance of the new terms. If you don't agree 
                with the changes, you must stop using our services.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">14. Entire Agreement</h2>
              <p className="text-muted-foreground">
                These Terms of Service, together with our Privacy Policy and any other agreements referenced herein, constitute the 
                entire agreement between you and NannyAI regarding our services.
              </p>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                  <p className="text-muted-foreground mb-4">
                    For questions about these Terms of Service, please contact us:
                  </p>
                  <div className="text-muted-foreground space-y-2">
                    <p><strong>Email:</strong> <a href="mailto:legal@nannyai.dev" className="text-primary hover:underline">legal@nannyai.dev</a></p>
                    <p><strong>Address:</strong> NannyAI, Inc., 123 Tech Street, San Francisco, CA 94105, USA</p>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default TermsOfService;