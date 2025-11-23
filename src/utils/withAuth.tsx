
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/services/authService';

/**
 * Higher-order component that provides authentication protection for routes using Supabase
 */
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const { toast } = useToast();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Check if user is authenticated with Supabase
          const user = await getCurrentUser();
          
          if (user) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            
            // Only show toast if not already on the landing page
            if (location.pathname !== '/') {
              toast({
                title: "Authentication required",
                description: "Please sign in to access this page",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Authentication check error:', error);
          setIsAuthenticated(false);
          
          // Only show toast if not already on the landing page
          if (location.pathname !== '/') {
            toast({
              title: "Authentication error",
              description: "Unable to verify your session. Please sign in again.",
              variant: "destructive",
            });
          }
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [location.pathname, toast]);

    // While checking authentication, show a loading indicator or nothing
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If not authenticated, redirect to home page
    if (isAuthenticated === false) {
      // Prevent redirect loops by checking if we're already on the home page
      if (location.pathname === '/') {
        // If already on home page, just render the home page component
        return null;
      }
      
      // Otherwise redirect to home page
      return <Navigate to="/" replace state={{ from: location }} />;
    }

    // If authenticated, render the protected component
    return <Component {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
