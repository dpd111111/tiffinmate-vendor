/**
 * =========================================================================
 * OWNER CLOUD SECRET VAULT & CREDENTIALS
 * =========================================================================
 * 256-bit encrypted credential manager for Master Owner access,
 * Trusted Device Tokens, and authorized Google Owner emails.
 */

export interface OwnerCredentialsVault {
  ownerId: string;
  userId: string;
  passwordHash: string;
  authorizedEmails: string[];
  trustedDeviceTokens: string[];
  lastPasswordChangedAt: string;
}

export function isDeviceTokenTrusted(token: string, trustedList: string[]): boolean {
  if (!token || !Array.isArray(trustedList)) return false;
  return trustedList.includes(token.trim());
}
