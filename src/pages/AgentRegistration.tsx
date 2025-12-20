import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Shield, CheckCircle, AlertCircle, Loader2, Key, Copy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deviceAuthService, DeviceAuthResponse } from '@/services/deviceAuthService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import withAuth from '@/utils/withAuth';

const AgentRegistration = () => {
  const [userCode, setUserCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<DeviceAuthResponse | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Token copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the user code from your nannyagent.",
        variant: "destructive",
      });
      return;
    }

    const codeLength = userCode.trim().length;
    if (codeLength < 8 || codeLength > 10) {
      toast({
        title: "Invalid Code Format",
        description: "User code must be 8-10 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAuthResult(null);

    try {
      const result = await deviceAuthService.registerDevice(userCode.trim());
      setAuthResult(result);
      
      if (result.success) {
        toast({
          title: "Device Registered Successfully",
          description: "Your nannyagent is now ready to use!",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register device. Please check your code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorResult: DeviceAuthResponse = {
        success: false,
        error: "An unexpected error occurred during registration.",
      };
      setAuthResult(errorResult);
      
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUserCode('');
    setAuthResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/80">
      <Helmet>
        <title>Agent Registration - Linux Agents API</title>
        <meta name="description" content="Register a new Linux agent with the API service" />
      </Helmet>
      
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper>
            <div className="flex-1 p-6">
              {/* Page header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-primary mr-3" />
                  <h1 className="text-3xl font-bold tracking-tight">Device Registration</h1>
                </div>
                <p className="text-muted-foreground">
                  Register your nannyagent by entering the user code displayed on your device.
                </p>
              </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl">
              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="h-5 w-5 mr-2" />
                      Registration Process
                    </CardTitle>
                    <CardDescription>
                      Follow these steps to register your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Initialize Nannyagent Registration</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Run the registration command on your Linux server. Your nannyagent will display an 8-10 character user code.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Enter User Code</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Copy the user code from your nannyagent and enter it in the form on the right.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Complete Registration</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your nannyagent will automatically receive authentication tokens and start working.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert className="mt-6">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Make sure you're logged into your account before registering nannyagents. 
                        Only authenticated users can register new nannyagents.
                      </AlertDescription>
                    </Alert>


                  </CardContent>
                </Card>
              </motion.div>

              {/* Registration form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GlassMorphicCard className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="userCode">User Code</Label>
                      <Input
                        id="userCode"
                        type="text"
                        placeholder="Enter the code (e.g., ABC123XYZ)"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                        className="mt-1 font-mono text-center text-lg tracking-widest"
                        disabled={isLoading}
                        maxLength={10}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the 8-10 character code displayed by your nannyagent
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || !userCode.trim() || userCode.trim().length < 8 || userCode.trim().length > 10}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Registering Device...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Register Device
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Results */}
                  {authResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-border"
                    >
                      {authResult.success ? (
                        <div className="space-y-4">
                          <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              {authResult.message || 'Agent registered successfully!'}
                            </AlertDescription>
                          </Alert>
                          
                          {authResult.token && (
                            <div>
                              <Label>Agent Authentication Token</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={authResult.token}
                                  readOnly
                                  className="font-mono text-xs bg-muted"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyToClipboard(authResult.token!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Your agent will use this token for API authentication. Keep it secure!
                              </p>
                            </div>
                          )}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={resetForm}
                            className="w-full"
                          >
                            Register Another Device
                          </Button>
                        </div>
                      ) : (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {authResult.error || 'Registration failed. Please try again.'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </motion.div>
                  )}
                </GlassMorphicCard>
              </motion.div>


            </div>
          </div>
        </TransitionWrapper>
      </div>
      </div>
      <Footer />
    </div>
  );
};

const AgentRegistrationPage = withAuth(AgentRegistration);
export default AgentRegistrationPage;