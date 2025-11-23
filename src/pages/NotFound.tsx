import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Bug, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TransitionWrapper className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <GlassMorphicCard className="text-center overflow-hidden">
              {/* Animated 404 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="relative">
                  {/* Large 404 text */}
                  <motion.h1 
                    className="text-9xl md:text-[12rem] font-bold text-primary/10 select-none"
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    404
                  </motion.h1>
                  
                  {/* Floating eBPF icon */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Bug className="h-24 w-24 text-primary/30" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
                <p className="text-xl text-muted-foreground mb-2">
                  Oops! This page seems to have vanished into the kernel space.
                </p>
                <p className="text-muted-foreground mb-8">
                  The page you're looking for doesn't exist or may have been moved. Even our eBPF probes couldn't locate it!
                </p>

                {/* Helpful suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <Search className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Double-check the URL</h3>
                    <p className="text-sm text-muted-foreground">
                      Make sure the address is spelled correctly
                    </p>
                  </div>
                  
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <Home className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Start from home</h3>
                    <p className="text-sm text-muted-foreground">
                      Navigate from our homepage to find what you need
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="gap-2"
                  >
                    Dashboard
                  </Button>
                </div>

                {/* Support link */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Still can't find what you're looking for?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                    <a 
                      href="/documentation" 
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Browse Documentation
                    </a>
                    <span className="hidden sm:inline text-muted-foreground">•</span>
                    <a 
                      href="/support" 
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Support
                    </a>
                  </div>
                </div>
              </motion.div>
            </GlassMorphicCard>

            {/* Fun fact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-4 inline-block">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Fun fact:</strong> In Linux, a 404 error means "ENOENT" - No such file or directory. 
                  Our eBPF agents can detect these in real-time! 🚀
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </TransitionWrapper>

      <Footer />
    </div>
  );
};

export default NotFound;
