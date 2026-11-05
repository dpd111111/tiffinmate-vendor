/**
 * =========================================================================
 * CORE SERVER DATABASE ADAPTER WITH FIREBASE FIRESTORE CLOUD PERSISTENCE
 * =========================================================================
 * Safe, fault-tolerant persistence adapter for:
 * - server_database_snapshot.json (Customers, Orders, Subscriptions)
 * - server_staff_vault.json (Staff accounts & salaries)
 * - server_public_reviews.json (Verified Google SEO reviews)
 * - server_tiffin_assets.json (Menu cards, plans, banners)
 * - server_vendor_vault.json (Vendor rates, daily menus, inventory, payouts)
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

let firestoreDb: any = null;

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== 'remixed-project-id') {
      const existingApps = getApps();
      const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
      firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      console.log('✅ Server Firestore persistence connected:', firebaseConfig.projectId);
    }
  }
} catch (e) {
  console.warn('[Firebase Server Init Warning]:', e);
}

export function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content && content.trim()) {
        return JSON.parse(content) as T;
      }
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

    // Asynchronously sync to Firestore for permanent cloud backup across code updates
    if (firestoreDb) {
      const fileName = path.basename(filePath).replace('.json', '');
      const docRef = doc(firestoreDb, 'app_snapshots', fileName);
      setDoc(docRef, { data, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => {
        console.warn(`[Firestore Sync Warning for ${fileName}]:`, err.message);
      });
    }
    return true;
  } catch (err) {
    console.error(`[Database Write Error] Failed writing ${filePath}:`, err);
    return false;
  }
}

export async function syncFromFirestoreSnapshot<T>(filePath: string, fallback: T): Promise<T> {
  let localData = readJsonSafe<T>(filePath, fallback);
  if (firestoreDb) {
    try {
      const fileName = path.basename(filePath).replace('.json', '');
      const docRef = doc(firestoreDb, 'app_snapshots', fileName);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data()?.data;
        if (cloudData) {
          writeJsonSafe(filePath, cloudData);
          return cloudData as T;
        }
      }
    } catch (e) {
      console.warn(`[Firestore Restore Warning for ${filePath}]:`, e);
    }
  }
  return localData;
}
