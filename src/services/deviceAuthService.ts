import { supabase } from '@/lib/supabase';
import { getCurrentSession, getCurrentUser } from '@/services/authService';

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

interface DeviceAuthRequest {
  device_code: string;
  user_code: string;
}

interface AgentAuthApiRequest {
  device_code: string;
  user_code: string;
  access_token: string;
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
  private async callDeviceApprove(userCode: string, session?: any): Promise<any> {
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
  async registerDevice(userCode: string, session?: any): Promise<DeviceAuthResponse> {
    // Use provided session, fallback to direct supabase call if needed
    let currentSession = session;
    
    if (!currentSession?.access_token) {
      try {
        const { data } = await supabase.auth.getSession();
        currentSession = data.session;
      } catch (error) {
        // Fallback to localStorage if direct call fails
        try {
          const storedSession = localStorage.getItem('sb-gpqzsricripnvbrpsyws-auth-token');
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            if (parsed.access_token) {
              currentSession = parsed;
            }
          }
        } catch (localStorageError) {
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