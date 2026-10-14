import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { OperationType } from './types';

let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

const rawConfig: any = firebaseConfig || {};

const configToUse = {
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId || '',
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || rawConfig.appId || '',
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey || '',
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain || '',
  firestoreDatabaseId: (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId || '',
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket || '',
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId || '',
};

if (configToUse.apiKey && configToUse.projectId) {
  try {
    appInstance = initializeApp(configToUse);
    try {
      if (configToUse.firestoreDatabaseId && configToUse.firestoreDatabaseId !== '(default)') {
        dbInstance = getFirestore(appInstance, configToUse.firestoreDatabaseId);
      } else {
        dbInstance = getFirestore(appInstance);
      }
    } catch (namedDbErr) {
      console.warn('Could not connect to named Firestore database ID, attempting default instance:', namedDbErr);
      try {
        dbInstance = getFirestore(appInstance);
      } catch (defaultDbErr) {
        console.warn('Firestore initialization failed; running in offline/local-storage mode:', defaultDbErr);
      }
    }
    try {
      authInstance = getAuth(appInstance);
    } catch (authErr) {
      console.warn('Firebase Auth initialization warning:', authErr);
    }
  } catch (initErr) {
    console.warn('Firebase app initialization failed; running in offline/local-storage mode:', initErr);
  }
} else {
  console.info('Firebase config credentials not provided; running in local storage mode.');
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;

export function isQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('Quota limit exceeded') ||
    msg.includes('Quota exceeded') ||
    msg.includes('quota metric') ||
    msg.includes('free tier database')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const isQuota = isQuotaError(error);

  const errInfo = {
    error: errMessage,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  // Only log console.error for security/permission errors as mandated by security rules guidelines,
  // avoiding false-positive error triggers for external Google Cloud free-tier quota limits.
  if (!isQuota) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Quota Notice: Free-tier daily read limit active. Operating in local storage cache mode.');
  }

  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'config', 'settings'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or pending initialization.');
    } else if (isQuotaError(error)) {
      console.warn('Firebase free tier daily read quota active.');
    }
    return false;
  }
}
