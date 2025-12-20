import { pb } from '@/integrations/pocketbase/client';

export interface DeviceAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}

export interface AgentAuthPublicResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

/**
 * Service to handle device authentication flow for agents
 */
class DeviceAuthService {
  /**
   * Call the agent authorization endpoint
   */
  private async callAgentAuthorize(userCode: string): Promise<DeviceAuthResponse> {
    try {
      const token = pb.authStore.token;

      if (!token) {
        return { success: false, error: 'User not authenticated' };
      }

      const baseUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
      const response = await fetch(`${baseUrl}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'authorize',
          user_code: userCode
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        message: result.message || 'Device authorized successfully',
        token: result.token
      };
    } catch (error) {
      return {
        success: false,
        error: `Device authorization failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Registers a device using the user code
   */
  async registerDevice(userCode: string): Promise<DeviceAuthResponse> {
    const token = pb.authStore.token;

    if (!token) {
      return {
        success: false,
        error: 'User not authenticated. Please log in first.',
      };
    }

    // Validate input - now accepts 8-10 characters
    if (!userCode || userCode.length < 8 || userCode.length > 10) {
      return {
        success: false,
        error: 'Please enter a valid 8-10 character user code',
      };
    }

    // Authorize the device
    const result = await this.callAgentAuthorize(userCode.toUpperCase());

    return result;
  }
}

export const deviceAuthService = new DeviceAuthService();
export type { DeviceAuthResponse, AgentAuthPublicResponse };
