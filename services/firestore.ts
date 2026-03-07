import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  getDocs,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) {
    console.warn("Firestore DB not initialized");
    return () => {};
  }
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};

export const addDocument = async (collectionName: string, data: any) => {
  if (!db) throw new Error("Firestore DB not initialized");
  return await addDoc(collection(db, collectionName), data);
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  if (!db) throw new Error("Firestore DB not initialized");
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  if (!db) throw new Error("Firestore DB not initialized");
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
};

export const setDocument = async (collectionName: string, id: string, data: any) => {
  if (!db) throw new Error("Firestore DB not initialized");
  const docRef = doc(db, collectionName, id);
  return await setDoc(docRef, data);
};
