import { supabase } from '@/lib/supabase';
import { getCurrentSession } from '@/services/authService';

export interface Activity {
  id: string;
  user_id: string;
  agent_id: string;
  activity_type: string;
  summary: string;
  metadata: {
    status: 'success' | 'error' | 'warning' | 'info';
    ip_address: string;
    user_agent: string;
    device_type: string;
    duration_ms: number;
  };
  created_at: string;
  // Legacy fields for backward compatibility
  title?: string;
  description?: string;
  icon?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filter: string;
}

// Get Supabase URL (hardcoded for production)
const getSupabaseUrl = (): string => {
  return 'https://gpqzsricripnvbrpsyws.supabase.co';
};

/**
 * Fetch recent activities from the API
 * @param limit Number of activities to fetch (default: 5)
 */
export const getRecentActivities = async (limit: number = 5): Promise<Activity[]> => {
  try {
    const session = await getCurrentSession();
    if (!session?.access_token) {
      console.error('No session found for activities API');
      return [];
    }

    const supabaseUrl = getSupabaseUrl();
    const response = await fetch(`${supabaseUrl}/functions/v1/activities-api?page=1&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch activities:', response.status, response.statusText);
      return [];
    }

    const data: ActivitiesResponse = await response.json();
    
    // Transform the data to include title and description for backward compatibility
    return data.activities.map(activity => ({
      ...activity,
      title: activity.summary,
      description: `${activity.activity_type} - ${activity.metadata?.status || 'unknown'}`
    }));
  } catch (error) {
    console.error('Exception fetching activities:', error);
    return [];
  }
};

/**
 * Fetch activities with pagination
 * @param page Page number (default: 1)
 * @param limit Number of activities per page (default: 10)
 * @param filter Filter type (default: 'all')
 */
export const getActivitiesPaginated = async (
  page: number = 1, 
  limit: number = 10, 
  filter: string = 'all'
): Promise<ActivitiesResponse> => {
  try {
    const session = await getCurrentSession();
    if (!session?.access_token) {
      console.error('No session found for activities API');
      return {
        activities: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        filter: 'all'
      };
    }

    const supabaseUrl = getSupabaseUrl();
    const response = await fetch(`${supabaseUrl}/functions/v1/activities-api?page=${page}&limit=${limit}&filter=${filter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch activities:', response.status, response.statusText);
      throw new Error(`Failed to fetch activities: ${response.status}`);
    }

    const data: ActivitiesResponse = await response.json();
    
    // Transform activities to include backward compatibility fields
    const transformedActivities = data.activities.map(activity => ({
      ...activity,
      title: activity.summary,
      description: `${activity.activity_type} - ${activity.metadata?.status || 'unknown'}`
    }));

    return {
      ...data,
      activities: transformedActivities
    };
  } catch (error) {
    console.error('Exception fetching paginated activities:', error);
    throw error;
  }
};

/**
 * Fetch activities for a specific user
 * @param userId User ID to filter activities
 * @param limit Number of activities to fetch (default: 10)
 */
export const getUserActivities = async (userId: string, limit: number = 10): Promise<Activity[]> => {
  try {
    // Use the new API but filter by user_id
    const result = await getActivitiesPaginated(1, limit, 'all');
    // Filter by user_id on the client side since the API doesn't support user filtering yet
    return result.activities.filter(activity => activity.user_id === userId);
  } catch (error) {
    console.error('Exception fetching user activities:', error);
    return [];
  }
};

/**
 * Fetch activities by type
 * @param activityType Type of activity to filter
 * @param limit Number of activities to fetch (default: 10)
 */
export const getActivitiesByType = async (
  activityType: string,
  limit: number = 10
): Promise<Activity[]> => {
  try {
    // Use the new API and filter by activity type
    const result = await getActivitiesPaginated(1, limit, activityType);
    return result.activities;
  } catch (error) {
    console.error('Exception fetching activities by type:', error);
    return [];
  }
};

/**
 * Create a new activity log
 * @param activity Activity data to insert
 */
export const createActivity = async (
  activity: Omit<Activity, 'id' | 'created_at'>
): Promise<{ data: Activity | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception creating activity:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get icon name based on activity type
 */
export const getActivityIcon = (activityType: string): string => {
  const iconMap: Record<string, string> = {
    // New API activity types
    data_sync: 'Server',
    token_generated: 'Key',
    session_started: 'Activity',
    websocket_connected: 'Activity',
    // Legacy activity types for backward compatibility
    agent: 'Server',
    user: 'Users', 
    session: 'Activity',
    token: 'Key',
    system: 'Activity',
    other: 'Activity',
  };

  return iconMap[activityType] || 'Activity';
};

/**
 * Format activity time for display
 */
export const formatActivityTime = (createdAt: string): string => {
  const now = new Date();
  const activityDate = new Date(createdAt);
  const diffMs = now.getTime() - activityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return activityDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};
