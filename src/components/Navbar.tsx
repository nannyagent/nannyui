"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/services/authService';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const [userName, setUserName] = useState('User');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Try to get name from user record, fallback to email
          const displayName = user.name || 
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

  const handleNotificationClick = (id: string, link: string) => {
    markAsRead(id);
    navigate(link);
  };

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-sidebar-accent/30 transition-colors relative">
                <Bell className="h-5 w-5 text-sidebar-foreground/80" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                      onClick={() => handleNotificationClick(notification.id, notification.link)}
                    >
                      <div className="flex w-full justify-between items-start mb-1">
                        <span className={`font-medium text-sm ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 hover:bg-sidebar-accent/30 rounded-lg px-2 py-1.5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-sidebar-foreground">{userName}</span>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/activities" className="cursor-pointer">
                  <Bell className="h-4 w-4 mr-2" />
                  Activities
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
