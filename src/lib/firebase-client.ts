"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let app: FirebaseApp;

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_* variables are required for OTP login.");
  }

  app = initializeApp(config);
  return app;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
