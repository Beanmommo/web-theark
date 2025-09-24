import { fs } from "./firebase";

export const useFirestoreAdmin = () => {
  /**
   * Firestore fetch a single document
   * @param path e.g. "customers/customer123"
   */
  const firestoreDocumentFetch = async (path: string) => {
    const docRef = fs.doc(path);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error(`Document not found at path: ${path}`);
    }
  };

  /**
   * Firestore fetch a whole collection
   * @param path collection name e.g. "customers"
   */
  const firestoreFetchCollection = async (path: string) => {
    const snapshot = await fs.collection(path).get();
    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      throw new Error(`No documents found in collection: ${path}`);
    }
  };

  /**
   * Firestore add (push) a new doc with auto ID
   */
  const firestoreAdd = async (path: string, data: any) => {
    const docRef = await fs.collection(path).add(data);
    const docSnap = await docRef.get();
    return { id: docSnap.id, ...docSnap.data() };
  };

  /**
   * Firestore update a doc
   */
  const firestoreUpdate = async (path: string, data: any) => {
    const docRef = fs.doc(path);
    await docRef.update(data);
    return { id: docRef.id };
  };

  /**
   * Firestore remove (delete a doc)
   */
  const firestoreRemove = async (path: string) => {
    const docRef = fs.doc(path);
    await docRef.delete();
    return { id: docRef.id };
  };
};
