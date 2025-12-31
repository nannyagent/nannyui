import React from 'react';
import { Link } from 'react-router-dom';
import { Github, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 sm:py-12 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Product Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-sidebar-foreground">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/use-cases" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-sidebar-foreground">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="https://ebpf.io" target="_blank" rel="noopener noreferrer" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  eBPF.io
                </a>
              </li>
              <li>
                <a href="https://www.kernel.org" target="_blank" rel="noopener noreferrer" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Linux Kernel
                </a>
              </li>
              <li>
                <Link to="/support" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-sidebar-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/sales" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Sales
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-sidebar-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/license" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  License
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/trademarks" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Trademarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Open Source Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-sidebar-foreground">Open Source</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/harshavmb/nannyapi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors flex items-center"
                >
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </a>
              </li>
              <li>
                <Link to="/open-source" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Open Source
                </Link>
              </li>
            </ul>

            <h3 className="font-semibold mb-4 mt-6 text-sm uppercase tracking-wider text-sidebar-foreground">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://reddit.com/r/nannyai" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reddit
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/nannyai" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 sm:pt-8 border-t border-sidebar-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-sidebar-foreground/70">
                © {new Date().getFullYear()} NannyAI. All rights reserved.
              </p>
              <p className="text-xs text-sidebar-foreground/60 mt-1">
                Linux® is a registered trademark of Linus Torvalds. eBPF® is a registered trademark.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <Link to="/status" className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                API Status
              </Link>
              <span className="text-xs text-sidebar-foreground/70">
                Built with ❤️ for the Linux community
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
