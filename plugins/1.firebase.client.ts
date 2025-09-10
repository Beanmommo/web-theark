import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"

import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() =>
{
  // Load Firebase configuration from runtime config
  const config = useRuntimeConfig();
  const firebaseConfig = config.public.firebase;
  if (!firebaseConfig)
  {
    console.warn("Firebase configuration is missing in runtime config.");
    return;
  }
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const firestore = getFirestore(app);
  const database = getDatabase(app)

  return {
    provide: {
      fireApp: app,
      fireAuth: auth,
      fireStore: firestore,
      fireDb: database
    }
  }
})