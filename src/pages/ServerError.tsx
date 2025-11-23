import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { Home, RefreshCw, ArrowLeft, AlertTriangle, MessageCircle, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ServerError = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <GlassMorphicCard className="text-center overflow-hidden">
              {/* Animated 500 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="relative">
                  {/* Large 500 text */}
                  <motion.h1 
                    className="text-9xl md:text-[12rem] font-bold text-destructive/10 select-none"
                    animate={{ 
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    500
                  </motion.h1>
                  
                  {/* Alert triangle icon */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <AlertTriangle className="h-24 w-24 text-destructive/40" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Internal Server Error</h2>
                <p className="text-xl text-muted-foreground mb-2">
                  This one's on us, not you!
                </p>
                <p className="text-muted-foreground mb-8">
                  Our servers encountered an unexpected error. Our eBPF monitoring agents have detected the issue 
                  and our team has been automatically notified.
                </p>

                {/* Status alert */}
                <Alert className="mb-8 bg-destructive/10 border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-left">
                    <strong>What happened?</strong> Our backend services encountered an error while processing your request. 
                    This could be due to high load, a temporary service disruption, or a bug in our system.
                  </AlertDescription>
                </Alert>

                {/* What we're doing */}
                <div className="bg-secondary/50 p-6 rounded-lg mb-8 text-left">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    What we're doing about it:
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Our AI-powered investigation system is analyzing the error</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Engineering team has been notified via PagerDuty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>System metrics and logs are being correlated for root cause analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Automatic failover and recovery procedures are in progress</span>
                    </li>
                  </ul>
                </div>

                {/* What you can do */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Try Again</h4>
                    <p className="text-sm text-muted-foreground">
                      Refresh the page or retry your request
                    </p>
                  </div>
                  
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <Home className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Go Home</h4>
                    <p className="text-sm text-muted-foreground">
                      Return to the dashboard and try a different path
                    </p>
                  </div>
                  
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Check Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Visit our status page for updates
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={handleRefresh}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Page
                  </Button>
                  
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </div>

                {/* Support links */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    If the problem persists, we're here to help:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                    <a 
                      href="/status" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      System Status
                    </a>
                    <span className="hidden sm:inline text-muted-foreground">•</span>
                    <a 
                      href="/support" 
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Support
                    </a>
                    <span className="hidden sm:inline text-muted-foreground">•</span>
                    <a 
                      href="https://discord.gg/nannyai" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Discord Community
                    </a>
                  </div>
                </div>
              </motion.div>
            </GlassMorphicCard>

            {/* Technical details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8"
            >
              <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold mb-3">For the technically curious:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">HTTP Status:</strong> 500 Internal Server Error
                  </div>
                  <div>
                    <strong className="text-foreground">Incident ID:</strong> {Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </div>
                  <div>
                    <strong className="text-foreground">Timestamp:</strong> {new Date().toISOString()}
                  </div>
                  <div>
                    <strong className="text-foreground">Monitoring:</strong> eBPF agents active
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This error has been logged and an investigation has been automatically triggered by our AI diagnostic system. 
                  Our SRE team follows our incident response playbook to minimize downtime.
                </p>
              </div>
            </motion.div>

            {/* Fun message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground italic">
                "Even the best eBPF probes can't prevent every error, but they sure can help us fix them fast!" 🚀
              </p>
            </motion.div>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default ServerError;