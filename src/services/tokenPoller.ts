/**
 * Temporary token polling utility for testing /token endpoint
 * This simulates what the agent would do to get the tokens
 */

export class TokenPoller {
  private deviceCode: string;
  private intervalId: NodeJS.Timeout | null = null;
  private pollCount = 0;
  private maxPolls = 60; // 5 minutes at 5-second intervals

  constructor(deviceCode: string) {
    this.deviceCode = deviceCode;
  }

  /**
   * Start polling for token
   */
  startPolling(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`🔄 Starting token polling for device_code: ${this.deviceCode}`);
      
      const poll = async () => {
        this.pollCount++;
        console.log(`📡 Poll attempt ${this.pollCount}/${this.maxPolls}`);

        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
          const response = await fetch(`${supabaseUrl}/functions/v1/device-auth/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
              device_code: this.deviceCode
            })
          });

          const result = await response.json();

          if (response.ok) {
            // Success! Got tokens
            console.log('🎉 SUCCESS: Received tokens!');
            console.log('📄 Token Response:', JSON.stringify(result, null, 2));
            console.log('🔑 Access Token:', result.access_token);
            console.log('🔄 Refresh Token:', result.refresh_token);
            console.log('⏱️  Expires In:', result.expires_in, 'seconds');
            
            this.stopPolling();
            resolve(result);
            return;
          }

          // Check error type
          if (result.error === 'authorization_pending') {
            console.log('⏳ Waiting for user authorization...');
          } else if (result.error === 'expired_token') {
            console.log('❌ Device code expired');
            this.stopPolling();
            reject(new Error('Device code expired'));
            return;
          } else {
            console.log('❌ Error:', result.error);
            this.stopPolling();
            reject(new Error(result.error));
            return;
          }

          // Continue polling if authorization pending
          if (this.pollCount >= this.maxPolls) {
            console.log('❌ Max polls reached, stopping');
            this.stopPolling();
            reject(new Error('Polling timeout'));
          }

        } catch (error) {
          console.error('🚨 Poll error:', error);
          if (this.pollCount >= this.maxPolls) {
            this.stopPolling();
            reject(error);
          }
        }
      };

      // Start polling immediately, then every 5 seconds
      poll();
      this.intervalId = setInterval(poll, 5000);
    });
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 Token polling stopped');
  }
}

/**
 * Convenience function to start polling with a device code
 */
export function pollForTokens(deviceCode: string): Promise<any> {
  const poller = new TokenPoller(deviceCode);
  return poller.startPolling();
}

// Example usage for testing:
// import { pollForTokens } from './tokenPoller';
// pollForTokens('your-device-code-here').then(tokens => {
//   console.log('Got tokens:', tokens);
// }).catch(error => {
//   console.error('Polling failed:', error);
// });