import React from 'react';
import { Link } from 'react-router-dom';
import { Github, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Product Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="https://ebpf.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  eBPF.io
                </a>
              </li>
              <li>
                <a href="https://www.kernel.org" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Linux Kernel
                </a>
              </li>
              <li>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/sales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sales
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/license" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  License
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/trademarks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Trademarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Open Source Section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Open Source</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/harshavmb/nannyapi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </a>
              </li>
              <li>
                <Link to="/open-source" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Open Source
                </Link>
              </li>
            </ul>

            <h3 className="font-semibold mb-4 mt-6 text-sm uppercase tracking-wider">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://reddit.com/r/nannyai" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} NannyAI. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Linux® is a registered trademark of Linus Torvalds. eBPF® is a registered trademark.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-foreground">
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