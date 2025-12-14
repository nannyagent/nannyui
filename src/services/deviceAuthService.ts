import { supabase } from '@/lib/supabase';

interface DeviceAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}

interface AgentAuthPublicResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface DeviceApproveResponse {
  success: boolean;
  error?: string;
  data?: Record<string, string | number>;
}

/**
 * Service to handle device authentication flow for agents
 * 
 * Flow:
 * 1. Agent calls /device/authorize to get device_code and user_code
 * 2. User enters user_code in the web interface to approve the device
 * 3. Agent polls /token endpoint to receive authentication tokens
 */
class DeviceAuthService {
  /**
   * Call the device-auth approve endpoint
   */
  private async callDeviceApprove(userCode: string, session: {access_token: string}): Promise<DeviceApproveResponse> {
    try {
      if (!session || !session.access_token) {
        return { success: false, error: 'User not authenticated' };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
      const response = await fetch(`${supabaseUrl}/functions/v1/device-auth/device/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_code: userCode
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: result.error || `HTTP ${response.status}: ${response.statusText}` 
        };
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Device approval failed: ${error.message || error}` };
    }
  }

  /**
   * Registers a device using the user code
   * This approves the device for the agent to receive tokens
   */
  async registerDevice(userCode: string, session?: {access_token?: string}): Promise<DeviceAuthResponse> {
    // Use provided session, fallback to direct supabase call if needed
    let currentSession = session as {access_token: string} | null;
    
    if (!currentSession?.access_token) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          currentSession = { access_token: data.session.access_token };
        }
      } catch {
        // Fallback to localStorage if direct call fails
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            // Extract project ID from URL: https://example12345.supabase.co
            const projectIdMatch = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
            const projectId = projectIdMatch?.[1];
            if (projectId) {
              const authTokenKey = `sb-${projectId}-auth-token`;
              const storedSession = localStorage.getItem(authTokenKey);
              if (storedSession) {
                const parsed = JSON.parse(storedSession);
                if (parsed.access_token) {
                  currentSession = { access_token: parsed.access_token };
                }
              }
            }
          }
        } catch {
          // Silent fail
        }
      }
    }
    
    if (!currentSession?.access_token) {
      return {
        success: false,
        error: 'User not authenticated. Please log in first.',
      };
    }

    // Validate input
    if (!userCode || userCode.length !== 10) {
      return {
        success: false,
        error: 'Please enter a valid 10-character user code',
      };
    }

    // Approve the device
    const result = await this.callDeviceApprove(userCode, currentSession);
    
    if (result.success) {
      return {
        success: true,
        message: 'Device registered successfully! Your nannyagent is now ready to use.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Device registration failed',
      };
    }
  }


}

export const deviceAuthService = new DeviceAuthService();
export type { DeviceAuthResponse, AgentAuthPublicResponse };