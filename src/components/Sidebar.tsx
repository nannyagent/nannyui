import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronsLeft, 
  ChevronsRight, 
  Home, 
  User, 
  Server, 
  BookOpen,
  Mail,
  Github,
  LogOut,
  Activity,
  DollarSign,
  Shield,
  Search,
  PackageCheck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from '@/services/authService';
import { clearMFAVerification } from '@/utils/withAuth';
import { useToast } from '@/hooks/use-toast';
import NannyAILogo from '@/components/NannyAILogo';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, label, collapsed, active, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center py-3 px-4 rounded-lg transition-all duration-200",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <span className="ml-3 whitespace-nowrap overflow-hidden transition-all duration-200">
          {label}
        </span>
      )}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const links = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/account', icon: User, label: 'Account' },
    { to: '/agents', icon: Server, label: 'Agents' },
    { to: '/agents/register', icon: Shield, label: 'Register Agent' },
    { to: '/activities', icon: Activity, label: 'Activities' },
    { to: '/investigations', icon: Search, label: 'Investigations' },
    { to: '/patch-history', icon: PackageCheck, label: 'Patch Management' },
    { to: '/pricing', icon: DollarSign, label: 'Pricing' },
    { to: '/documentation', icon: BookOpen, label: 'Documentation' },
    { to: '/contact', icon: Mail, label: 'Contact' },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      
      // Clear MFA verification on logout
      clearMFAVerification();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // Mobile trigger button (visible on small screens)
  const MobileTrigger = () => (
    <button
      onClick={() => setMobileOpen(true)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-lg text-sidebar-foreground shadow-lg hover:bg-sidebar-accent/30 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link 
          to="/" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          {(!collapsed || isMobile) && (
            <>
              <NannyAILogo size="md" />
              <span className="font-bold text-sidebar-foreground">NANNYAI</span>
            </>
          )}
          {collapsed && !isMobile && <NannyAILogo size="md" />}
        </Link>
        
        {isMobile ? (
          <button
            onClick={closeMobileMenu}
            className="ml-auto p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        )}
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar">
        <nav className="px-2 space-y-1">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              collapsed={collapsed && !isMobile}
              active={location.pathname === link.to || location.pathname.startsWith(link.to + '/')}
              onClick={isMobile ? closeMobileMenu : undefined}
            />
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <a 
          href="https://github.com/harshavmb/nannyapi" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={cn(
            "flex items-center py-3 px-4 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground transition-all duration-200"
          )}
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          <Github className="h-5 w-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span className="ml-3">GitHub Repos</span>}
        </a>
        
        <button 
          onClick={() => {
            handleLogout();
            if (isMobile) closeMobileMenu();
          }}
          className={cn(
            "flex items-center py-3 px-4 rounded-lg w-full text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground transition-all duration-200"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile trigger button */}
      <MobileTrigger />

      {/* Desktop sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex-col hidden lg:flex",
          collapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col z-50 lg:hidden"
            >
              <SidebarContent isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
