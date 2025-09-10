import { initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database'


const createFirebaseApp = () =>
{
  try
  {
    return getApp();
  } catch
  {
    return initializeApp({
      credential: cert('./serviceAccountKey.json'),
      databaseURL: 'https://the-ark-2f5fe-default-rtdb.asia-southeast1.firebasedatabase.app'
    })
    // return initializeApp({
    //   credential: cert('./serviceAccountKeyDev.json'),
    //   databaseURL: 'https://thearksg-dev.firebaseio.com'
    // })
  }
};

export const app = createFirebaseApp();
export const fs = getFirestore();
export const fsFieldPath = FieldPath
export const db = getDatabase();
