import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { OperationType } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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
