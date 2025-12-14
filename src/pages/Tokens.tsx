
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Info, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import withAuth from '@/utils/withAuth';
import { fetchApi } from '@/utils/config';
import { safeFetch } from '@/utils/errorHandling';
import { placeholderTokens } from '@/mocks/placeholderData';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Tokens = () => {
  const [showTokens, setShowTokens] = React.useState(false);
  const [tokens, setTokens] = useState(placeholderTokens);
  // const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState(null);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const { toast } = useToast();

  // Function to fetch tokens from the API
  const fetchAuthTokens = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with Supabase tokens table
      // For now, using placeholder data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTokens(placeholderTokens);
      setHasError(false);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data from the API
    fetchAuthTokens();
  }, []);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token)
      .then(() => {
        toast({
          title: "Token Copied",
          description: "API token has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to Copy",
          description: "Could not copy token to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleCreateToken = async () => {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create tokens",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const response = await fetchApi('api/auth-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   type: 'Development',
        //   name: `API Token ${new Date().toISOString().slice(0, 10)}`,
        // }),
      }, accessToken);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the newly created token
      setNewToken(data);
      
      // Open the dialog to show the new token
      setIsDialogOpen(true);
      
      // Refresh the list of tokens
      const result = await safeFetch(
        fetchApi('api/auth-tokens', { method: 'GET' }, accessToken),
        placeholderTokens
      );
      
      if (result.data) {
        setTokens(result.data);
      }
      
      toast({
        title: "Token Created",
        description: "New API token has been created successfully",
      });
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Failed to Create Token",
        description: "There was an error creating your API token",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!tokenToRevoke) return;
    
    setIsRevoking(true);
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to revoke tokens",
        variant: "destructive",
      });
      setIsRevoking(false);
      setIsRevokeDialogOpen(false);
      return;
    }
    
    try {
      const response = await fetchApi(`api/auth-token/${tokenToRevoke.id}`, {
        method: 'DELETE',
      }, accessToken);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refresh the token list after successful revocation
      await fetchAuthTokens();
      
      toast({
        title: "Token Revoked",
        description: "API token has been successfully revoked",
      });
    } catch (error) {
      console.error('Error revoking token:', error);
      toast({
        title: "Failed to Revoke Token",
        description: "There was an error revoking your API token",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
      setIsRevokeDialogOpen(false);
      setTokenToRevoke(null);
    }
  };

  const openRevokeDialog = (token) => {
    setTokenToRevoke(token);
    setIsRevokeDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper className="flex-1 p-6">
            <div className="container pb-8">
              {hasError && (
                <ErrorBanner 
                  message="There was an issue loading your authentication tokens. Some data may not be current."
                onDismiss={() => setHasError(false)}
              />
            )}
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight" role="heading">Auth Tokens</h1>
                <p className="text-muted-foreground mt-2">
                  Manage API authentication tokens for your applications.
                </p>
              </div>
              
              <Button 
                onClick={handleCreateToken} 
                disabled={isCreating}
                className="flex items-center py-2 px-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Token'}
              </Button>
            </div>
            
            <GlassMorphicCard className="mb-8">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium">Token Security</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your API tokens have full access to your account. Keep them secure and never share them in public repositories or client-side code.
                  </p>
                </div>
              </div>
            </GlassMorphicCard>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your API Tokens</h2>
              <button 
                onClick={() => setShowTokens(!showTokens)}
                className="flex items-center py-1 px-3 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
              >
                {showTokens ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                    Hide tokens
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Show tokens
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              {tokens.map((token, i) => (
                <motion.div
                  key={token.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                >
                  <GlassMorphicCard>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{token.id}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {token.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                        <div className="flex items-center space-x-1">
                          <div className="px-3 py-1 bg-muted/50 rounded-md text-sm font-mono">
                            {showTokens ? token.token : '••••••••••••••••••••••••••'}
                          </div>
                          <button 
                            className="p-1.5 rounded-md hover:bg-muted/80 transition-colors"
                            onClick={() => handleCopyToken(token.token)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center mr-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{token.created_at}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Last used: {token.lastUsed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
                      <button 
                        className="py-1 px-3 text-sm border border-destructive/30 text-destructive rounded-md hover:bg-destructive/5 transition-colors flex items-center"
                        onClick={() => openRevokeDialog(token)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Revoke
                      </button>
                    </div>
                  </GlassMorphicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </TransitionWrapper>
      </div>

      {/* Dialog to show the newly created token */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Token Created Successfully</DialogTitle>
            <DialogDescription>
              Copy your new token now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/50 rounded-md font-mono text-sm my-4 break-all">
            {newToken?.token || "Token information not available"}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (newToken?.token) {
                  handleCopyToken(newToken.token);
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Token
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for token revocation confirmation */}
      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Token</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this token? This action cannot be undone, and any applications using this token will no longer be able to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsRevokeDialogOpen(false);
              setTokenToRevoke(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevokeToken}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRevoking}
            >
              {isRevoking ? 'Revoking...' : 'Revoke Token'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
      <Footer />
    </div>
  );
};

const TokensPage = withAuth(Tokens);
export default TokensPage;
