import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DayWorkoutPlan, DailyStats } from '../types';
import { DEFAULT_WEEKLY_PLAN, INITIAL_STATS } from '../data/mockData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use firestoreDatabaseId from configuration
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');

// Test connection on startup per instructions
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: offline or initializing.");
    }
  }
}
testFirestoreConnection();

/**
 * Standardize username or phone number into a secure, deterministic email format for Firebase Auth:
 * - If contains '@': use directly as email (e.g. name@domain.com)
 * - If phone digits: "user_15551234567@aurafit.app"
 * - If alphanumeric username (e.g. "Kartheek.g"): "user_kartheek.g@aurafit.app"
 */
export function formatPhoneToEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Check if it's purely digits/phone characters
  const cleanDigits = trimmed.replace(/\D/g, '');
  if (cleanDigits.length >= 7 && !/[a-z]/.test(trimmed)) {
    return `user_${cleanDigits}@aurafit.app`;
  }
  // Alphanumeric username (replace disallowed chars with underscore)
  const safeUsername = trimmed.replace(/[^a-z0-9._-]/g, '_');
  return `user_${safeUsername}@aurafit.app`;
}

export function formatRawPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits;
  }
  return digits;
}

export interface UserAccountData {
  uid: string;
  phoneNumber: string;
  displayName: string;
  weeklyPlan: DayWorkoutPlan[];
  stats: DailyStats;
}

// User-scoped storage keys for offline backup
function getUserStorageKey(uid: string, key: string) {
  return `aurafit_${uid}_${key}`;
}

/**
 * Fetch private user-scoped workout state from Firestore
 * Guarantees User A cannot see User B's state
 */
export async function loadUserWorkoutData(uid: string): Promise<{ weeklyPlan: DayWorkoutPlan[]; stats: DailyStats }> {
  try {
    const dataRef = doc(db, 'users', uid, 'data', 'workoutState');
    const snap = await getDoc(dataRef);
    if (snap.exists()) {
      const data = snap.data();
      const weeklyPlan = data.weeklyPlan ? JSON.parse(data.weeklyPlan) : DEFAULT_WEEKLY_PLAN;
      const stats = data.stats ? JSON.parse(data.stats) : INITIAL_STATS;
      // Cache in user-isolated local cache
      localStorage.setItem(getUserStorageKey(uid, 'plan'), JSON.stringify(weeklyPlan));
      localStorage.setItem(getUserStorageKey(uid, 'stats'), JSON.stringify(stats));
      return { weeklyPlan, stats };
    }
  } catch (err) {
    console.warn('Could not read from cloud, falling back to user-scoped local cache', err);
  }

  // Fallback to user-scoped cache or fresh default
  const cachedPlan = localStorage.getItem(getUserStorageKey(uid, 'plan'));
  const cachedStats = localStorage.getItem(getUserStorageKey(uid, 'stats'));
  
  const weeklyPlan = cachedPlan ? JSON.parse(cachedPlan) : DEFAULT_WEEKLY_PLAN;
  const stats = cachedStats ? JSON.parse(cachedStats) : INITIAL_STATS;
  return { weeklyPlan, stats };
}

/**
 * Save private user-scoped workout state into Firestore
 */
export async function saveUserWorkoutData(uid: string, weeklyPlan: DayWorkoutPlan[], stats: DailyStats): Promise<void> {
  // Always update user-isolated cache first
  localStorage.setItem(getUserStorageKey(uid, 'plan'), JSON.stringify(weeklyPlan));
  localStorage.setItem(getUserStorageKey(uid, 'stats'), JSON.stringify(stats));

  try {
    const dataRef = doc(db, 'users', uid, 'data', 'workoutState');
    await setDoc(dataRef, {
      uid,
      weeklyPlan: JSON.stringify(weeklyPlan),
      stats: JSON.stringify(stats),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving to cloud Firestore:', err);
  }
}
