/**
 * MFA utilities for TOTP setup and backup key generation
 */

/**
 * Generate a random secret key for TOTP (8 bytes = 64 bits, base32 encoded)
 */
export const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

/**
 * Generate backup codes (8 codes, each 8 characters, alphanumeric uppercase)
 */
export const generateBackupCodes = (count: number = 8): string[] => {
  const codes: string[] = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }
  
  return codes;
};

/**
 * Format backup codes for display (with dashes)
 */
export const formatBackupCode = (code: string): string => {
  return code.slice(0, 4) + '-' + code.slice(4);
};

/**
 * Generate a QR code URL for TOTP enrollment
 * This uses the standard otpauth:// URL format
 */
export const generateTOTPQRUrl = (
  email: string,
  secret: string,
  appName: string = 'NannyAI'
): string => {
  const encodedEmail = encodeURIComponent(email);
  const encodedAppName = encodeURIComponent(appName);
  
  return `otpauth://totp/${encodedAppName}:${encodedEmail}?secret=${secret}&issuer=${encodedAppName}`;
};
