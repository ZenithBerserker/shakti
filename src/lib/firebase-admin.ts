import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App;

export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env missing: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    );
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  return app;
}

export async function verifyFirebaseIdToken(idToken: string) {
  const auth = getAuth(getFirebaseAdminApp());
  return auth.verifyIdToken(idToken);
}
