import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { formatPhoneToEmail } from './firebase';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const seedAuth = getAuth(app);
const seedDb = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');

export interface PredefinedUser {
  username: string;
  name: string;
  password: string;
}

export const PREDEFINED_USERS: PredefinedUser[] = [
  {
    username: 'Kartheek.g',
    name: 'Kartheek Gorthi',
    password: 'Test@123',
  },
  {
    username: 'Harsha.k',
    name: 'Harsha K',
    password: 'Test@123',
  }
];

let isSeedingDone = false;

/**
 * Ensures the requested users (Kartheek.g & Harsha.k) are registered in Firebase Auth and Firestore.
 * Runs silently in the background once upon application launch.
 */
export async function seedRequestedUsers(): Promise<void> {
  if (isSeedingDone) return;
  isSeedingDone = true;

  for (const userDef of PREDEFINED_USERS) {
    const email = formatPhoneToEmail(userDef.username);
    try {
      // 1. Try to sign in or create if does not exist
      let uid = '';
      try {
        const userCred = await signInWithEmailAndPassword(seedAuth, email, userDef.password);
        uid = userCred.user.uid;
        if (!userCred.user.displayName) {
          await updateProfile(userCred.user, { displayName: userDef.name });
        }
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/operation-not-allowed') {
          // Email/password auth provider disabled or not configured in project
          continue;
        }
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          // Create user
          try {
            const newCred = await createUserWithEmailAndPassword(seedAuth, email, userDef.password);
            uid = newCred.user.uid;
            await updateProfile(newCred.user, { displayName: userDef.name });
          } catch (createErr: any) {
            // If operation not allowed, local auth fallback in authStore will manage the accounts
            continue;
          }
        } else {
          // If already signed in or other transient error, ignore
          continue;
        }
      }

      // 2. Ensure user profile exists in Firestore
      if (uid) {
        const profileRef = doc(seedDb, 'users', uid);
        const snap = await getDoc(profileRef);
        if (!snap.exists()) {
          await setDoc(profileRef, {
            uid,
            phoneNumber: userDef.username,
            name: userDef.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
    } catch (err) {
      console.warn(`Seed check for ${userDef.username}:`, err);
    }
  }
}
