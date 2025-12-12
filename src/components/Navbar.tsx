
"use client";

import React, { useState, useEffect } from 'react';
import { Bell, User, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/services/authService';

const Navbar: React.FC = () => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Try to get name from user metadata, fallback to email
          const displayName = user.user_metadata?.name || 
                             user.user_metadata?.full_name || 
                             user.email?.split('@')[0] || 
                             'User';
          setUserName(displayName);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-sidebar/95 backdrop-blur-md sticky top-0 z-10 border-b border-sidebar-border"
    >
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-sidebar-accent/30 border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-sidebar-primary text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/60"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-sidebar-accent/30 transition-colors relative">
            <Bell className="h-5 w-5 text-sidebar-foreground/80" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-sidebar-primary rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-sidebar-foreground">{userName}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
