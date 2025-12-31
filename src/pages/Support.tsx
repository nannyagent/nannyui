import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { 
  MessageCircle, 
  Book, 
  Mail, 
  ExternalLink, 
  Github,
  FileQuestion,
  Clock,
  Headphones
} from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-bold mb-6">Support & Help Center</h1>
            <p className="text-xl text-muted-foreground">
              Get the help you need, when you need it. Multiple channels to reach our team.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Support Channels */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">How Can We Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Book className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Documentation</h3>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive guides, tutorials, and API references to help you get started and master NannyAI.
                  </p>
                  <a 
                    href="/docs" 
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    Browse Documentation <ExternalLink className="h-4 w-4" />
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <MessageCircle className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Community Discord</h3>
                  <p className="text-muted-foreground mb-4">
                    Join our active community on Discord. Get help from other users and the NannyAI team.
                  </p>
                  <a 
                    href="https://discord.gg/nannyai" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    Join Discord Server <ExternalLink className="h-4 w-4" />
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Github className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">GitHub Issues</h3>
                  <p className="text-muted-foreground mb-4">
                    Report bugs, request features, or contribute to our open source agent on GitHub.
                  </p>
                  <a 
                    href="https://github.com/harshavmb/nannyapi/issues" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    View GitHub Issues <ExternalLink className="h-4 w-4" />
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Mail className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Email Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Send us an email and our support team will get back to you within 24 hours.
                  </p>
                  <a 
                    href="mailto:support@nannyai.dev" 
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    support@nannyai.dev <ExternalLink className="h-4 w-4" />
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <Headphones className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Enterprise Support</h3>
                  <p className="text-muted-foreground mb-4">
                    24/7 priority support with dedicated customer success manager for enterprise customers.
                  </p>
                  <a 
                    href="/contact?type=enterprise" 
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    Contact Sales <ExternalLink className="h-4 w-4" />
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard className="hover:scale-105 transition-transform">
                  <FileQuestion className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">FAQ</h3>
                  <p className="text-muted-foreground mb-4">
                    Quick answers to common questions about installation, configuration, and troubleshooting.
                  </p>
                  <a 
                    href="#faq" 
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    View FAQ Below <ExternalLink className="h-4 w-4" />
                  </a>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Support Plans */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Support Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassMorphicCard>
                  <h3 className="text-2xl font-semibold mb-3">Community</h3>
                  <div className="text-3xl font-bold text-primary mb-4">Free</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Community Discord & forums</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Documentation & guides</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">GitHub issues tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Best-effort email support</span>
                    </li>
                  </ul>
                  <a href="/login" className="block w-full text-center px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                    Get Started
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard className="border-2 border-primary">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                    MOST POPULAR
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Professional</h3>
                  <div className="text-3xl font-bold text-primary mb-4">$99/mo</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Everything in Community</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Email support (24-hour SLA)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Video call assistance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Priority bug fixes</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Configuration assistance</span>
                    </li>
                  </ul>
                  <a href="/pricing" className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Upgrade Now
                  </a>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-2xl font-semibold mb-3">Enterprise</h3>
                  <div className="text-3xl font-bold text-primary mb-4">Custom</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Everything in Professional</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">24/7 phone & chat support</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Dedicated success manager</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Custom onboarding & training</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">SLA guarantees (99.9% uptime)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Professional services available</span>
                    </li>
                  </ul>
                  <a href="/contact?type=enterprise" className="block w-full text-center px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                    Contact Sales
                  </a>
                </GlassMorphicCard>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">How do I install the NannyAI agent?</h3>
                  <p className="text-muted-foreground text-sm">
                    Run our one-line installer: <code className="bg-secondary px-2 py-1 rounded text-xs">curl -sSL https://download.nannyai.dev | sudo bash</code>. 
                    See our <a href="/docs" className="text-primary hover:underline">installation guide</a> for detailed instructions.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Which Linux distributions are supported?</h3>
                  <p className="text-muted-foreground text-sm">
                    NannyAI supports all major Linux distributions with kernel 4.14 or newer, including Ubuntu, CentOS, RHEL, 
                    Debian, Amazon Linux, SUSE, and more. See our <a href="/docs" className="text-primary hover:underline">compatibility matrix</a>.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">What is the performance impact of the agent?</h3>
                  <p className="text-muted-foreground text-sm">
                    The NannyAI agent uses eBPF technology and has minimal overhead: &lt;1% CPU usage and &lt;10 MB memory footprint. 
                    Unlike traditional monitoring tools, eBPF runs in the kernel with zero instrumentation overhead.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Can I use NannyAI in production environments?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! NannyAI is production-ready and used by enterprises worldwide. We offer 99.9% uptime SLA for enterprise plans, 
                    SOC 2 Type II certification, and 24/7 support.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">How is data transmitted and stored?</h3>
                  <p className="text-muted-foreground text-sm">
                    All data is encrypted in transit using TLS 1.3 and at rest using AES-256. We support data residency requirements 
                    and offer on-premise deployment options for enterprise customers. See our <a href="/security" className="text-primary hover:underline">security page</a>.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Do I need to modify my application code?</h3>
                  <p className="text-muted-foreground text-sm">
                    No! eBPF provides kernel-level visibility without requiring any changes to your application code. 
                    Simply install the agent and start monitoring immediately.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">What happens if I exceed my plan limits?</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll notify you via email before you reach your limits. You can upgrade your plan at any time or contact us 
                    to discuss custom pricing for higher volumes.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, you can cancel anytime from your account settings. You'll retain access until the end of your current billing period. 
                    You can export your data within 30 days of cancellation.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">How do I integrate NannyAI with my existing tools?</h3>
                  <p className="text-muted-foreground text-sm">
                    We provide native integrations with popular tools like Slack, PagerDuty, Jira, and Grafana. 
                    Our comprehensive REST API allows custom integrations. See our <a href="/docs" className="text-primary hover:underline">API documentation</a>.
                  </p>
                </GlassMorphicCard>

                <GlassMorphicCard>
                  <h3 className="text-lg font-semibold mb-2">Is the agent open source?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! The NannyAI agent is open source under Apache 2.0 license. You can view the source code, contribute, 
                    or modify it on <a href="https://github.com/harshavmb/nannyapi/agent" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>. 
                    The cloud platform is proprietary.
                  </p>
                </GlassMorphicCard>
              </div>
            </section>

            {/* Contact Section */}
            <section>
              <GlassMorphicCard className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:support@nannyai.dev" 
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Email Support
                  </a>
                  <a 
                    href="https://discord.gg/nannyai" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Join Discord
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

export default Support;