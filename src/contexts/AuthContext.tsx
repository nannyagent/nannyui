import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import type { UserRecord } from '@/integrations/pocketbase/types';

export interface AuthContextType {
  user: UserRecord | null;
  token: string | null;
  loading: boolean;
  signOut?: () => Promise<void>;
  signIn?: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial auth state
    if (pb.authStore.isValid) {
      setUser(pb.authStore.record as UserRecord);
      setToken(pb.authStore.token);
    }
    setLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record as UserRecord | null);
      setToken(_token || null);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
