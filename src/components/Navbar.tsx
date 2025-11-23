
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
      className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/40"
    >
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-muted/80 transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
