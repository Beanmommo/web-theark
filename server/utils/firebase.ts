import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore, FieldPath } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const createFirebaseApp = () => {
  try {
    return getApp();
  } catch {
    const runtimeConfig = useRuntimeConfig();
    return initializeApp({
      credential: cert({
        clientEmail: runtimeConfig.firebaseadmin.clientEmail,
        privateKey: runtimeConfig.firebaseadmin.privateKey,
        projectId: runtimeConfig.firebaseadmin.projectId,
      }),
      databaseURL: runtimeConfig.firebaseadmin.databaseURL,
    });

    // return initializeApp({
    //   credential: cert('./serviceAccountKeyDev.json'),
    //   databaseURL: 'https://thearksg-dev.firebaseio.com'
    // })
  }
};

export const app = createFirebaseApp();
export const fs = getFirestore();
export const fsFieldPath = FieldPath;
export const db = getDatabase();
