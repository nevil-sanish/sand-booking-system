import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, deleteDoc
} from 'firebase/firestore';

export function useItems(activeOnly = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: We intentionally omit orderBy() here.
    // Combining where('active','==',true) with orderBy('createdAt','desc')
    // requires a composite Firestore index that may not be deployed.
    // Sorting client-side is equivalent and always works.
    let q;
    if (activeOnly) {
      q = query(collection(db, 'items'), where('active', '==', true));
    } else {
      q = query(collection(db, 'items'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })).sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta; // newest first
      });
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching items:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeOnly]);

  const addItem = async (itemData) => {
    await addDoc(collection(db, 'items'), {
      ...itemData,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateItem = async (itemId, updates) => {
    await updateDoc(doc(db, 'items', itemId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const toggleItem = async (itemId, active) => {
    await updateDoc(doc(db, 'items', itemId), {
      active,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteItem = async (itemId) => {
    await deleteDoc(doc(db, 'items', itemId));
  };

  return { items, loading, addItem, updateItem, toggleItem, deleteItem };
}
