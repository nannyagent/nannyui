import { pb } from '@/lib/pocketbase';
import { getAgentStats } from './agentService';

export interface DashboardStats {
  totalAgents: number;
  totalUsers: number;
  uptime: string;
}

/**
 * Fetch dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const safeCount = async (collectionName: string): Promise<number> => {
      try {
        const result = await pb.collection(collectionName).getList(1, 1, {
          fields: 'id',
        });
        return result.totalItems;
      } catch (err) {
        // console.warn(`Error querying ${collectionName}:`, err);
        return 0;
      }
    };

    const [agentStats, totalUsers] = await Promise.all([
      getAgentStats(),
      safeCount('users'),
    ]);
    
    const totalAgents = agentStats.total;

    return {
      totalAgents,
      totalUsers,
      uptime: '99.9%', // Placeholder
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalAgents: 0,
      totalUsers: 0,
      uptime: '0%',
    };
  }
};
