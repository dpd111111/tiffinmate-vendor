/**
 * =========================================================================
 * CORE SERVER AUTHENTICATION & ROLE ENGINE
 * =========================================================================
 * Validates credentials across all roles:
 * - Owner: Salted hashes, Master Owner Keys & Trusted Device Tokens
 * - Management / Staff: 4-digit Security PIN & Staff Vault Account
 * - Customer: Verified phone numbers and active subscription tokens
 */

import crypto from 'crypto';

export interface AuthSession {
  role: 'owner' | 'manager' | 'cook' | 'helper' | 'delivery' | 'vendor' | 'customer';
  userId: string;
  name: string;
  token: string;
  expiresAt: number;
}

export function hashSecret(secret: string, salt: string = 'tiffinmate_salt_2026'): string {
  return crypto.createHmac('sha256', salt).update(secret).digest('hex');
}

export function generateSecureSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
