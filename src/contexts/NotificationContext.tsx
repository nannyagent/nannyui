import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';
import { PatchOperationRecord, RebootOperationRecord } from '@/integrations/pocketbase/types';
import { Investigation } from '@/services/investigationService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  timestamp: Date;
  type: 'patch' | 'investigation' | 'reboot';
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Also show a toast for immediate feedback
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    // Subscribe to patch_operations
    const subscribeToPatchOperations = async () => {
      try {
        await pb.collection('patch_operations').subscribe('*', (e) => {
          if (e.action === 'update') {
            const record = e.record as unknown as PatchOperationRecord;
            // Notify when status changes to completed, failed, or rolled_back
            if (['completed', 'failed', 'rolled_back'].includes(record.status)) {
              addNotification({
                id: `patch-${record.id}-${Date.now()}`,
                title: `Patch Operation ${record.status === 'completed' ? 'Completed' : 'Failed'}`,
                message: `Patch operation for agent ${record.agent_id} has ${record.status}.`,
                link: `/patch-execution/${record.id}`,
                read: false,
                timestamp: new Date(),
                type: 'patch'
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to subscribe to patch_operations:', error);
      }
    };

    // Subscribe to investigations
    const subscribeToInvestigations = async () => {
      try {
        await pb.collection('investigations').subscribe('*', (e) => {
          if (e.action === 'update') {
            const record = e.record as unknown as Investigation;
            // Notify when status changes to completed or failed
            if (['completed', 'failed'].includes(record.status)) {
              addNotification({
                id: `inv-${record.id}-${Date.now()}`,
                title: `Investigation ${record.status === 'completed' ? 'Completed' : 'Failed'}`,
                message: `Investigation for agent ${record.agent_id} has ${record.status}.`,
                link: `/investigations/${record.id}`,
                read: false,
                timestamp: new Date(),
                type: 'investigation'
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to subscribe to investigations:', error);
      }
    };

    // Subscribe to reboot_operations
    const subscribeToRebootOperations = async () => {
      try {
        await pb.collection('reboot_operations').subscribe('*', async (e) => {
          if (e.action === 'update') {
            const record = e.record as unknown as RebootOperationRecord;
            // Notify when status changes to completed, failed, or timeout
            if (['completed', 'failed', 'timeout'].includes(record.status)) {
              const statusText = record.status === 'completed' 
                ? 'Completed' 
                : record.status === 'timeout' 
                  ? 'Timed Out' 
                  : 'Failed';
              // Try to get agent hostname from expanded record or fetch it
              let agentDisplayName = 'Unknown Agent';
              try {
                const expandedRecord = record as unknown as { expand?: { agent_id?: { hostname?: string } } };
                if (expandedRecord.expand?.agent_id?.hostname) {
                  agentDisplayName = expandedRecord.expand.agent_id.hostname;
                } else {
                  // Fetch agent details if not expanded
                  const agent = await pb.collection('agents').getOne(record.agent_id);
                  agentDisplayName = agent.hostname || record.agent_id.substring(0, 8);
                }
              } catch {
                agentDisplayName = record.agent_id.substring(0, 8);
              }
              addNotification({
                id: `reboot-${record.id}-${Date.now()}`,
                title: `Reboot ${statusText}`,
                message: `Reboot operation for ${agentDisplayName} has ${record.status}.${record.error_message ? ` Error: ${record.error_message}` : ''}`,
                link: `/reboot-history`,
                read: false,
                timestamp: new Date(),
                type: 'reboot'
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to subscribe to reboot_operations:', error);
      }
    };

    subscribeToPatchOperations();
    subscribeToInvestigations();
    subscribeToRebootOperations();

    return () => {
      pb.collection('patch_operations').unsubscribe('*');
      pb.collection('investigations').unsubscribe('*');
      pb.collection('reboot_operations').unsubscribe('*');
    };
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
