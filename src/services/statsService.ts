import { supabase } from '@/lib/supabase';
import { getAgentStats } from './agentService';

export interface DashboardStats {
  totalAgents: number;
  activeTokens: number;
  totalUsers: number;
  uptime: string;
}

/**
 * Fetch dashboard statistics from Supabase
 * This queries various tables to get counts and stats
 * Tables may not exist yet - gracefully handles 404 errors
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Helper function to safely get count from a table
    const safeCount = async (tableName: string): Promise<number> => {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('id', { count: 'exact', head: true });
        
        // If table doesn't exist (404), return 0
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            console.log(`Table '${tableName}' does not exist yet. Run supabase_setup.sql to create it.`);
            return 0;
          }
          console.warn(`Error querying ${tableName}:`, error.message);
          return 0;
        }
        
        return count || 0;
      } catch (err) {
        console.warn(`Exception querying ${tableName}:`, err);
        return 0;
      }
    };

    // Get agent stats from agentService and other counts
    const [agentStats, activeTokens, totalUsers] = await Promise.all([
      getAgentStats(),
      safeCount('tokens'),
      safeCount('users'),
    ]);
    
    const totalAgents = agentStats.total;

    // Uptime calculation can be based on system metrics or a specific table
    // For now, we'll return a placeholder - you can customize this
    const uptime = '99.9%';

    return {
      totalAgents,
      activeTokens,
      totalUsers,
      uptime,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values on error
    return {
      totalAgents: 0,
      activeTokens: 0,
      totalUsers: 0,
      uptime: 'N/A',
    };
  }
};

/**
 * Fetch token statistics
 */
export const getTokenStats = async (userId?: string) => {
  try {
    let query = supabase.from('tokens').select('*');
    
    // If userId provided, filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching token stats:', error);
      return { active: 0, expired: 0, total: 0 };
    }

    // Assuming tokens have an 'active' or 'expires_at' field
    const total = data?.length || 0;
    const active = data?.filter(token => token.active !== false).length || 0;
    const expired = total - active;

    return { active, expired, total };
  } catch (error) {
    console.error('Exception fetching token stats:', error);
    return { active: 0, expired: 0, total: 0 };
  }
};
