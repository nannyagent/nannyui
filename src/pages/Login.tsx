import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '@/components/LoginHeader';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import Footer from '@/components/Footer';
import ErrorBanner from '@/components/ErrorBanner';
import { useToast } from '@/hooks/use-toast';
import { signInWithGitHub, signInWithGoogle, signInWithEmail, getCurrentUser, isMFAEnabled } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        // Check if MFA is required
        const mfaEnabled = await isMFAEnabled();
        if (mfaEnabled) {
          navigate('/mfa-verification');
        } else {
          navigate('/dashboard');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await signInWithGitHub();
      
      if (error) {
        setIsError(true);
        toast({
          title: "Authentication Error",
          description: error || "Failed to sign in with GitHub.",
          variant: "destructive",
        });
      } else if (data) {
        // Successfully authenticated, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Error initiating GitHub login:", error);
      setIsError(true);
      toast({
        title: "Authentication Error",
        description: `Failed to initiate GitHub login. Please try again later.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        setIsError(true);
        toast({
          title: "Authentication Error",
          description: error || "Failed to sign in with Google.",
          variant: "destructive",
        });
      } else if (data) {
        // Successfully authenticated, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Error initiating Google login:", error);
      setIsError(true);
      toast({
        title: "Authentication Error",
        description: `Failed to initiate Google login. Please try again later.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { user, error, mfaRequired } = await signInWithEmail(email, password);
      
      if (error) {
        setIsError(true);
        toast({
          title: "Authentication Error",
          description: error || "Failed to sign in with email.",
          variant: "destructive",
        });
        return;
      }

      if (user) {
        // Check if MFA verification is required
        if (mfaRequired) {
          toast({
            title: "MFA Required",
            description: "Please complete two-factor authentication.",
          });
          navigate('/mfa-verification');
        } else {
          toast({
            title: "Success",
            description: "Signed in successfully!",
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error signing in with email:", error);
      setIsError(true);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-20 z-0"
        style={{ 
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(100, 116, 255, 0.4), rgba(100, 116, 255, 0.05))" 
        }}
      />
      
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {isError && (
            <ErrorBanner 
              message="We're having trouble with authentication. Please try again later."
              onDismiss={() => setIsError(false)}
            />
          )}
          
          <GlassMorphicCard className="w-full mx-auto">
            <div className="py-8 px-4 sm:px-6">
              <LoginHeader />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 space-y-4"
              >
                {!showEmailLogin ? (
                  <>
                    <Button
                      onClick={handleGitHubLogin}
                      className="w-full flex items-center justify-center"
                      variant="outline"
                      disabled={isLoading}
                      size="lg"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      Sign in with GitHub
                    </Button>
                    
                    <Button
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center"
                      variant="outline"
                      disabled={isLoading}
                      size="lg"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowEmailLogin(true)}
                      className="w-full flex items-center justify-center"
                      variant="outline"
                      size="lg"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Sign in with Email
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setShowEmailLogin(false)}
                      className="w-full"
                      variant="ghost"
                      disabled={isLoading}
                    >
                      Back to other options
                    </Button>
                  </form>
                )}
                
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </a>
                </p>
              </motion.div>
            </div>
          </GlassMorphicCard>
        </div>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
