import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { serverEnv } from "@/config/env.server";

const FIREBASE_APP_NAME = "safetrust-wallet-auth";

let adminApp: ReturnType<typeof initializeApp> | undefined;

export function getWalletFirebaseAdmin() {
  if (!adminApp) {
    const projectId =
      serverEnv.FIREBASE_ADMIN_PROJECT_ID ??
      serverEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error("Firebase Admin project ID is not configured.");
    }
    adminApp = getApps().find(
      (candidate) => candidate.name === FIREBASE_APP_NAME,
    );
    if (!adminApp) {
      adminApp = initializeApp(
        {
          credential: cert({
            projectId,
            clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY.replace(
              /\\n/g,
              "\n",
            ),
          }),
          projectId,
        },
        FIREBASE_APP_NAME,
      );
    }
  }

  return {
    auth: getAuth(adminApp),
    firestore: getFirestore(adminApp),
  };
}
