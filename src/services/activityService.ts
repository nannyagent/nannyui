import { supabase } from '@/lib/supabase';
import { getCurrentSession } from '@/services/authService';

export interface Activity {
  id: string;
  user_id: string;
  agent_id: string | null;
  activity_type: string;
  summary: string;
  metadata: {
    status?: 'success' | 'error' | 'warning' | 'info';
    ip_address?: string;
    user_agent?: string;
    device_type?: string;
    duration_ms?: number;
    [key: string]: any;
  } | null;
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

// Activity types
export const ACTIVITY_TYPES = {
  // Agent activities
  AGENT_CREATED: 'agent_created',
  AGENT_DELETED: 'agent_deleted',
  AGENT_CONNECTED: 'agent_connected',
  AGENT_DISCONNECTED: 'agent_disconnected',
  
  // Patch activities
  PATCH_STARTED: 'patch_started',
  PATCH_COMPLETED: 'patch_completed',
  PATCH_FAILED: 'patch_failed',
  PATCH_SCHEDULED: 'patch_scheduled',
  
  // Investigation activities
  INVESTIGATION_STARTED: 'investigation_started',
  INVESTIGATION_COMPLETED: 'investigation_completed',
  
  // Account activities
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  PASSWORD_CHANGED: 'password_changed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Legacy types
  DATA_SYNC: 'data_sync',
  TOKEN_GENERATED: 'token_generated',
  SESSION_STARTED: 'session_started',
  WEBSOCKET_CONNECTED: 'websocket_connected',
} as const;

/**
 * Fetch recent activities from Supabase directly
 * @param limit Number of activities to fetch (default: 10)
 */
export const getRecentActivities = async (limit: number = 10): Promise<Activity[]> => {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      console.error('No session found for activities');
      return [];
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return (data || []).map(activity => ({
      ...activity,
      title: activity.summary,
      description: `${activity.activity_type} - ${activity.metadata?.status || 'info'}`
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
    if (!session?.user?.id) {
      console.error('No session found for activities');
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

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply filter if not 'all'
    if (filter !== 'all') {
      query = query.eq('activity_type', filter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const transformedActivities = (data || []).map(activity => ({
      ...activity,
      title: activity.summary,
      description: `${activity.activity_type} - ${activity.metadata?.status || 'info'}`
    }));

    return {
      activities: transformedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filter
    };
  } catch (error) {
    console.error('Exception fetching paginated activities:', error);
    throw error;
  }
};

/**
 * Create a new activity log
 * @param activity Activity data to insert
 */
export const createActivity = async (
  activityData: {
    activity_type: string;
    summary: string;
    agent_id?: string | null;
    metadata?: Record<string, any>;
  }
): Promise<{ data: Activity | null; error: Error | null }> => {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { data: null, error: new Error('No active session') };
    }

    const { data, error } = await supabase
      .from('activities')
      .insert([{
        user_id: session.user.id,
        agent_id: activityData.agent_id || null,
        activity_type: activityData.activity_type,
        summary: activityData.summary,
        metadata: activityData.metadata || { status: 'success' }
      }])
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
 * Log agent creation activity
 */
export const logAgentCreated = async (agentId: string, agentName: string) => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.AGENT_CREATED,
    summary: `Agent "${agentName}" was registered`,
    agent_id: agentId,
    metadata: { status: 'success', agent_name: agentName }
  });
};

/**
 * Log agent deletion activity
 */
export const logAgentDeleted = async (agentId: string, agentName: string) => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.AGENT_DELETED,
    summary: `Agent "${agentName}" was deleted`,
    agent_id: agentId,
    metadata: { status: 'info', agent_name: agentName }
  });
};

/**
 * Log patch execution started
 */
export const logPatchStarted = async (agentId: string, executionType: string) => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.PATCH_STARTED,
    summary: `Patch ${executionType} started`,
    agent_id: agentId,
    metadata: { status: 'info', execution_type: executionType }
  });
};

/**
 * Log patch execution completed
 */
export const logPatchCompleted = async (agentId: string, executionType: string, success: boolean) => {
  return createActivity({
    activity_type: success ? ACTIVITY_TYPES.PATCH_COMPLETED : ACTIVITY_TYPES.PATCH_FAILED,
    summary: `Patch ${executionType} ${success ? 'completed successfully' : 'failed'}`,
    agent_id: agentId,
    metadata: { status: success ? 'success' : 'error', execution_type: executionType }
  });
};

/**
 * Log investigation started
 */
export const logInvestigationStarted = async (agentId: string, issue: string) => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.INVESTIGATION_STARTED,
    summary: `Investigation started: ${issue.substring(0, 50)}${issue.length > 50 ? '...' : ''}`,
    agent_id: agentId,
    metadata: { status: 'info', issue }
  });
};

/**
 * Log MFA enabled
 */
export const logMfaEnabled = async () => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.MFA_ENABLED,
    summary: 'Multi-factor authentication was enabled',
    metadata: { status: 'success' }
  });
};

/**
 * Log password changed
 */
export const logPasswordChanged = async () => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.PASSWORD_CHANGED,
    summary: 'Account password was changed',
    metadata: { status: 'success' }
  });
};

/**
 * Log user login
 */
export const logUserLogin = async () => {
  return createActivity({
    activity_type: ACTIVITY_TYPES.LOGIN,
    summary: 'User logged in',
    metadata: { status: 'success' }
  });
};

/**
 * Get icon name based on activity type
 */
export const getActivityIcon = (activityType: string): string => {
  const iconMap: Record<string, string> = {
    // New activity types
    [ACTIVITY_TYPES.AGENT_CREATED]: 'Server',
    [ACTIVITY_TYPES.AGENT_DELETED]: 'Server',
    [ACTIVITY_TYPES.AGENT_CONNECTED]: 'Wifi',
    [ACTIVITY_TYPES.AGENT_DISCONNECTED]: 'WifiOff',
    [ACTIVITY_TYPES.PATCH_STARTED]: 'Shield',
    [ACTIVITY_TYPES.PATCH_COMPLETED]: 'ShieldCheck',
    [ACTIVITY_TYPES.PATCH_FAILED]: 'ShieldAlert',
    [ACTIVITY_TYPES.PATCH_SCHEDULED]: 'Calendar',
    [ACTIVITY_TYPES.INVESTIGATION_STARTED]: 'Search',
    [ACTIVITY_TYPES.INVESTIGATION_COMPLETED]: 'CheckCircle',
    [ACTIVITY_TYPES.MFA_ENABLED]: 'Lock',
    [ACTIVITY_TYPES.MFA_DISABLED]: 'Unlock',
    [ACTIVITY_TYPES.PASSWORD_CHANGED]: 'Key',
    [ACTIVITY_TYPES.LOGIN]: 'LogIn',
    [ACTIVITY_TYPES.LOGOUT]: 'LogOut',
    // Legacy types
    data_sync: 'Server',
    token_generated: 'Key',
    session_started: 'Activity',
    websocket_connected: 'Activity',
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

/**
 * Get unique activity types for filtering
 */
export const getActivityTypes = async (): Promise<string[]> => {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return [];
    }

    const { data, error } = await supabase
      .from('activities')
      .select('activity_type')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching activity types:', error);
      return [];
    }

    const types = [...new Set(data?.map(d => d.activity_type) || [])];
    return types;
  } catch (error) {
    console.error('Exception fetching activity types:', error);
    return [];
  }
};