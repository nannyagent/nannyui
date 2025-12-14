
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, isMFAEnabled } from '@/services/authService';

// Session storage key for MFA verification
const MFA_VERIFIED_KEY = 'nannyai_mfa_verified';

/**
 * Check if MFA has been verified in this session
 */
export const isMFAVerified = (): boolean => {
  return sessionStorage.getItem(MFA_VERIFIED_KEY) === 'true';
};

/**
 * Mark MFA as verified for this session
 */
export const setMFAVerified = (verified: boolean): void => {
  if (verified) {
    sessionStorage.setItem(MFA_VERIFIED_KEY, 'true');
  } else {
    sessionStorage.removeItem(MFA_VERIFIED_KEY);
  }
};

/**
 * Clear MFA verification (called on logout)
 */
export const clearMFAVerification = (): void => {
  sessionStorage.removeItem(MFA_VERIFIED_KEY);
};

/**
 * Higher-order component that provides authentication protection for routes using Supabase
 * Also enforces MFA verification if MFA is enabled for the user
 */
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [mfaRequired, setMfaRequired] = useState<boolean | null>(null);
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
            
            // Check if MFA is enabled for this user
            const mfaEnabled = await isMFAEnabled();
            
            if (mfaEnabled) {
              // Check if MFA has been verified in this session
              const mfaVerified = isMFAVerified();
              setMfaRequired(!mfaVerified);
            } else {
              setMfaRequired(false);
            }
          } else {
            setIsAuthenticated(false);
            setMfaRequired(false);
            
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
          setMfaRequired(false);
          
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

    // While checking authentication, show a loading indicator
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If not authenticated, redirect to login page
    if (isAuthenticated === false) {
      // Prevent redirect loops by checking if we're already on the home page
      if (location.pathname === '/') {
        return null;
      }
      
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // If authenticated but MFA is required and not verified, redirect to MFA verification
    if (isAuthenticated && mfaRequired) {
      // Avoid redirect loop if already on MFA verification page
      if (location.pathname === '/mfa-verification') {
        return <Component {...props} />;
      }
      
      return <Navigate to="/mfa-verification" replace state={{ from: location }} />;
    }

    // If authenticated and MFA is verified (or not required), render the protected component
    return <Component {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
