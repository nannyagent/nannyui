
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 z-0" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <Terminal className="w-4 h-4 mr-2" />
              <span>Simplifying Linux Diagnostics</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Intelligent Linux Agents for{' '}
              <span className="text-primary">Automated Diagnostics</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Connect your Linux infrastructure to our intelligent API. Diagnose complex problems across distributed systems without manual intervention.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link to="/docs">
                  Documentation
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-background/50 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-sidebar p-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs text-white/70 font-mono">agent-terminal</div>
            </div>
            <div className="bg-black p-4 font-mono text-sm text-green-400 overflow-hidden" style={{ maxHeight: "350px" }}>
              <div className="animate-typing overflow-hidden whitespace-nowrap">
                <span className="text-white/70">$</span> nannyagent --diagnose check system health<br />
                <span className="text-yellow-400">[INFO]</span> Connecting to NannyAI API...<br />
                <span className="text-yellow-400">[INFO]</span> Connection established<br />
                <span className="text-yellow-400">[INFO]</span> Starting diagnostic sequence...<br />
                <span className="text-white/70">$</span> df -h<br />
                Filesystem      Size  Used Avail Use% Mounted on<br />
                /dev/sda1        50G   22G   28G  44% /<br />
                <span className="text-blue-400">[NANNYAI]</span> Analyzing disk usage...<br />
                <span className="text-blue-400">[NANNYAI]</span> Running network diagnostics...<br />
                <span className="text-white/70">$</span> netstat -tuln<br />
                Active Internet connections (only servers)<br />
                Proto Recv-Q Send-Q Local Address           Foreign Address         State<br />
                tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN<br />
                tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN<br />
                <span className="text-blue-400">[NANNYAI]</span> Checking for memory issues...<br />
                <span className="text-white/70">$</span> free -m<br />
                total        used        free      shared  buff/cache   available<br />
                Mem:          7723        4521        852         345        2350        2511<br />
                Swap:         1024         321        703<br />
                <span className="text-green-500">[RESULT]</span> Diagnosis complete. Memory pressure detected.<br />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
