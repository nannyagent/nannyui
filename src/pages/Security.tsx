import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { Shield, Lock, AlertTriangle, Bug, Award, Eye, FileCheck } from 'lucide-react';

const Security = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Security</h1>
          <p className="text-muted-foreground mb-8">
            Security is at the core of everything we build. Learn about our security practices, responsible disclosure policy, and compliance certifications.
          </p>

          <div className="space-y-8">
            <GlassMorphicCard>
              <div className="flex items-start space-x-4 mb-6">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Our Security Commitment</h2>
                  <p className="text-muted-foreground mb-4">
                    At NannyAI, security isn't just a feature—it's foundational to our platform. We monitor critical Linux systems, 
                    which means we take our own security responsibilities seriously. Our multi-layered approach protects your data, 
                    infrastructure, and privacy.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <Lock className="h-5 w-5 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">Encryption Everywhere</h3>
                      <p className="text-sm text-muted-foreground">TLS 1.3, AES-256, end-to-end encryption</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <Eye className="h-5 w-5 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">Zero Trust Architecture</h3>
                      <p className="text-sm text-muted-foreground">Continuous verification, least privilege access</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <Award className="h-5 w-5 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">SOC 2 Type II Certified</h3>
                      <p className="text-sm text-muted-foreground">Independently audited security controls</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <FileCheck className="h-5 w-5 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">GDPR Compliant</h3>
                      <p className="text-sm text-muted-foreground">EU data protection standards</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Bug className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Responsible Disclosure Policy</h2>
                  <p className="text-muted-foreground mb-4">
                    We appreciate the security research community and welcome responsible disclosure of security vulnerabilities. 
                    If you discover a security issue, please report it privately to our security team.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">How to Report</h3>
                      <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong>Email:</strong> <a href="mailto:security@nannyai.dev" className="text-primary hover:underline">security@nannyai.dev</a></p>
                        <p className="text-sm"><strong>PGP Key:</strong> <a href="https://nannyai.dev/pgp-key.asc" className="text-primary hover:underline">Download Public Key</a></p>
                        <p className="text-sm text-muted-foreground">For sensitive reports, please encrypt your message using our PGP key.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">What to Include</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Detailed description of the vulnerability</li>
                        <li>Steps to reproduce the issue</li>
                        <li>Potential impact and attack scenarios</li>
                        <li>Your contact information (optional for anonymity)</li>
                        <li>Proof-of-concept code (if applicable)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Our Commitment to You</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><strong>24-hour acknowledgment:</strong> We'll confirm receipt within one business day</li>
                        <li><strong>Regular updates:</strong> Status updates every 7 days until resolution</li>
                        <li><strong>Credit:</strong> Public recognition (if desired) in our security advisories</li>
                        <li><strong>No legal action:</strong> We won't pursue legal action for good-faith security research</li>
                        <li><strong>90-day disclosure:</strong> Coordinated disclosure after patch deployment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Bug Bounty Program</h2>
                  <p className="text-muted-foreground mb-4">
                    We reward security researchers who help us keep NannyAI secure. Our bug bounty program covers critical and high-severity vulnerabilities.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-4">Severity</th>
                          <th className="text-left py-2 px-4">Impact</th>
                          <th className="text-left py-2 px-4">Reward Range</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border">
                          <td className="py-2 px-4"><span className="text-red-500 font-semibold">Critical</span></td>
                          <td className="py-2 px-4">Remote code execution, data breach</td>
                          <td className="py-2 px-4 font-semibold">$5,000 - $20,000</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-2 px-4"><span className="text-orange-500 font-semibold">High</span></td>
                          <td className="py-2 px-4">Authentication bypass, privilege escalation</td>
                          <td className="py-2 px-4 font-semibold">$2,000 - $5,000</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-2 px-4"><span className="text-yellow-500 font-semibold">Medium</span></td>
                          <td className="py-2 px-4">XSS, CSRF, information disclosure</td>
                          <td className="py-2 px-4 font-semibold">$500 - $2,000</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4"><span className="text-blue-500 font-semibold">Low</span></td>
                          <td className="py-2 px-4">Minor information leaks, UI issues</td>
                          <td className="py-2 px-4 font-semibold">$100 - $500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Out of Scope:</strong> Social engineering, physical attacks, DoS attacks, spam, issues in third-party services, 
                      publicly known vulnerabilities, issues requiring unlikely user interaction.
                    </p>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Infrastructure Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">🏗️ Cloud Infrastructure</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Multi-region deployment with automatic failover</li>
                    <li>Infrastructure-as-Code (Terraform) with version control</li>
                    <li>Network segmentation and VPC isolation</li>
                    <li>DDoS protection and WAF (Web Application Firewall)</li>
                    <li>Regular vulnerability scanning and penetration testing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">🔐 Access Controls</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Multi-factor authentication (MFA) required for all team members</li>
                    <li>Role-based access control (RBAC) with least privilege principle</li>
                    <li>Hardware security keys for production access</li>
                    <li>Just-in-time access provisioning</li>
                    <li>Comprehensive audit logging of all administrative actions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">📊 Monitoring & Incident Response</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>24/7 security operations center (SOC)</li>
                    <li>Real-time intrusion detection and prevention systems</li>
                    <li>Automated threat intelligence feeds</li>
                    <li>Security Information and Event Management (SIEM)</li>
                    <li>Incident response plan with defined SLAs</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Encryption</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>In Transit:</strong> TLS 1.3 with perfect forward secrecy</li>
                    <li><strong>At Rest:</strong> AES-256 encryption for all stored data</li>
                    <li><strong>Backups:</strong> Encrypted with separate key management</li>
                    <li><strong>Key Management:</strong> Hardware Security Modules (HSMs)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Data Retention</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Automated data retention policies based on compliance requirements</li>
                    <li>Secure data deletion using cryptographic erasure</li>
                    <li>Daily encrypted backups retained for 90 days</li>
                    <li>Right to be forgotten compliance (GDPR Article 17)</li>
                  </ul>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Application Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Secure Development:</strong> Security-first SDLC with threat modeling</li>
                  <li><strong>Code Review:</strong> Mandatory peer review and automated security scanning</li>
                  <li><strong>Dependency Management:</strong> Automated vulnerability scanning (Dependabot, Snyk)</li>
                  <li><strong>Static Analysis:</strong> SAST tools integrated into CI/CD pipeline</li>
                  <li><strong>Dynamic Testing:</strong> DAST and penetration testing quarterly</li>
                  <li><strong>Container Security:</strong> Image scanning, minimal base images, read-only filesystems</li>
                  <li><strong>API Security:</strong> Rate limiting, input validation, authentication on all endpoints</li>
                </ul>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Compliance & Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
                  <p className="text-sm text-muted-foreground">Annual audit of security, availability, and confidentiality controls</p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">GDPR</h3>
                  <p className="text-sm text-muted-foreground">EU General Data Protection Regulation compliance</p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">ISO 27001</h3>
                  <p className="text-sm text-muted-foreground">Information security management system (in progress)</p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">CCPA</h3>
                  <p className="text-sm text-muted-foreground">California Consumer Privacy Act compliance</p>
                </div>
              </div>
              
              <div className="mt-6 bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Request Audit Reports:</strong> Enterprise customers can request our latest SOC 2 report by contacting 
                  <a href="mailto:compliance@nannyai.dev" className="text-primary hover:underline ml-1">compliance@nannyai.dev</a>
                </p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Security Advisories</h2>
                  <p className="text-muted-foreground mb-4">
                    We publish security advisories for all resolved vulnerabilities. Subscribe to stay informed about security updates:
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://github.com/nannyai/security-advisories" 
                      className="text-primary hover:underline block"
                    >
                      GitHub Security Advisories
                    </a>
                    <a 
                      href="https://nannyai.dev/security/rss" 
                      className="text-primary hover:underline block"
                    >
                      RSS Feed
                    </a>
                    <a 
                      href="mailto:security-announce@nannyai.dev?subject=Subscribe" 
                      className="text-primary hover:underline block"
                    >
                      Email Newsletter
                    </a>
                  </div>
                </div>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Hall of Fame</h2>
              <p className="text-muted-foreground mb-4">
                We recognize and thank security researchers who have responsibly disclosed vulnerabilities:
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Alex Chen</strong> - Critical authentication bypass (CVE-2024-XXXX)</p>
                <p>• <strong>Sarah Johnson</strong> - XSS vulnerability in dashboard</p>
                <p>• <strong>Mohammed Al-Rashid</strong> - SQL injection in API endpoint</p>
                <p>• <strong>Anonymous Researcher</strong> - Information disclosure issue</p>
                <p className="text-xs mt-4 italic">Want to be listed here? Report a valid security issue!</p>
              </div>
            </GlassMorphicCard>

            <GlassMorphicCard>
              <h2 className="text-2xl font-semibold mb-4">Security Contact</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> <a href="mailto:security@nannyai.dev" className="text-primary hover:underline">security@nannyai.dev</a></p>
                <p><strong>PGP Fingerprint:</strong> <code className="text-xs">1234 5678 9ABC DEF0 1234 5678 9ABC DEF0 1234 5678</code></p>
                <p><strong>Response Time:</strong> Within 24 hours for critical issues</p>
              </div>
            </GlassMorphicCard>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default Security;