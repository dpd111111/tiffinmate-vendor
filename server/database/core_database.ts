/**
 * =========================================================================
 * CORE SERVER DATABASE ADAPTER
 * =========================================================================
 * Safe, fault-tolerant persistence adapter for:
 * - server_database_snapshot.json (Customers, Orders, Subscriptions)
 * - server_staff_vault.json (Staff accounts & salaries)
 * - server_public_reviews.json (Verified Google SEO reviews)
 * - server_tiffin_assets.json (Menu cards, plans, banners)
 */

import fs from 'fs';
import path from 'path';

export function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`[Database Read Error] Failed reading ${filePath}:`, err);
  }
  return fallback;
}

export function writeJsonSafe<T>(filePath: string, data: T): boolean {
  try {
    const tempPath = `${filePath}.tmp_${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`[Database Write Error] Failed writing ${filePath}:`, err);
    return false;
  }
}
