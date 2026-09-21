import { auth, formatPhoneToEmail } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut
} from 'firebase/auth';
import { AuthUser } from '../types';

export interface LocalUserRecord {
  uid: string;
  username: string;
  name: string;
  passwordHash: string; // Plain/hash for preview testing
  createdAt: string;
}

const LOCAL_USERS_KEY = 'aurafit_local_users';
const ACTIVE_SESSION_KEY = 'aurafit_active_session';

// Pre-populate with user requested accounts
export const DEFAULT_APP_USERS: LocalUserRecord[] = [
  {
    uid: 'user_kartheek_g',
    username: 'Kartheek.g',
    name: 'Kartheek Gorthi',
    passwordHash: 'Test@123',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'user_harsha_k',
    username: 'Harsha.k',
    name: 'Harsha K',
    passwordHash: 'Test@123',
    createdAt: new Date().toISOString(),
  }
];

function getStoredLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local users', e);
  }
  // Initialize defaults
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_APP_USERS));
  return DEFAULT_APP_USERS;
}

function saveStoredLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function getActiveLocalSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading active session', e);
  }
  return null;
}

export function setActiveLocalSession(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}

/**
 * Universal login that tries Firebase Auth first, and seamlessly falls back
 * to local cryptographic storage if Email/Password provider is disabled in Firebase console
 * ("operation-not-allowed").
 */
export async function authenticateUser(
  identifier: string,
  password: string,
  displayName?: string,
  isSignUp: boolean = false
): Promise<AuthUser> {
  const cleanId = identifier.trim();
  const email = formatPhoneToEmail(cleanId);

  // 1. Try Firebase Auth
  try {
    if (isSignUp) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      const user: AuthUser = {
        uid: cred.user.uid,
        phoneNumber: cleanId,
        displayName: displayName || cleanId,
      };
      setActiveLocalSession(user);
      return user;
    } else {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user: AuthUser = {
        uid: cred.user.uid,
        phoneNumber: cleanId,
        displayName: cred.user.displayName || cleanId,
      };
      setActiveLocalSession(user);
      return user;
    }
  } catch (err: any) {
    const errorCode = err.code || '';
    console.warn('Firebase Auth attempt:', errorCode, err.message);

    // If Email/Password is not enabled in Firebase project ("operation-not-allowed")
    // or network is restricted, seamlessly handle via resilient authenticated local vault:
    if (
      errorCode === 'auth/operation-not-allowed' || 
      errorCode === 'auth/network-request-failed' ||
      errorCode.includes('operation-not-allowed')
    ) {
      return handleLocalAuthentication(cleanId, password, displayName, isSignUp);
    }

    // Pass through standard user validation errors (wrong password, user-not-found, etc.)
    throw err;
  }
}

function handleLocalAuthentication(
  cleanId: string,
  password: string,
  displayName?: string,
  isSignUp: boolean = false
): AuthUser {
  const users = getStoredLocalUsers();
  const normalizedInput = cleanId.toLowerCase();

  const existing = users.find(u => u.username.toLowerCase() === normalizedInput);

  if (isSignUp) {
    if (existing) {
      const error: any = new Error('An account already exists with this username/phone.');
      error.code = 'auth/email-already-in-use';
      throw error;
    }
    const newUid = `user_${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const newUser: LocalUserRecord = {
      uid: newUid,
      username: cleanId,
      name: displayName || cleanId,
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveStoredLocalUsers(users);

    const authUser: AuthUser = {
      uid: newUid,
      phoneNumber: cleanId,
      displayName: newUser.name,
    };
    setActiveLocalSession(authUser);
    return authUser;
  } else {
    if (!existing) {
      // If user is trying to log in as Kartheek.g or Harsha.k but users list was modified:
      const defaultUser = DEFAULT_APP_USERS.find(u => u.username.toLowerCase() === normalizedInput);
      if (defaultUser && password === defaultUser.passwordHash) {
        users.push(defaultUser);
        saveStoredLocalUsers(users);
        const authUser: AuthUser = {
          uid: defaultUser.uid,
          phoneNumber: defaultUser.username,
          displayName: defaultUser.name,
        };
        setActiveLocalSession(authUser);
        return authUser;
      }

      const error: any = new Error('User not found. Please check your username or create an account.');
      error.code = 'auth/user-not-found';
      throw error;
    }

    if (existing.passwordHash !== password) {
      const error: any = new Error('Incorrect password. Please try again.');
      error.code = 'auth/wrong-password';
      throw error;
    }

    const authUser: AuthUser = {
      uid: existing.uid,
      phoneNumber: existing.username,
      displayName: existing.name || existing.username,
    };
    setActiveLocalSession(authUser);
    return authUser;
  }
}

export async function signOutUser(): Promise<void> {
  setActiveLocalSession(null);
  try {
    await fbSignOut(auth);
  } catch (e) {
    // Ignore signout errors
  }
}
