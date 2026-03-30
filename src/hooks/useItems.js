import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';

export function useItems(activeOnly = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (activeOnly) {
      q = query(
        collection(db, 'items'),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
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

  return { items, loading, addItem, updateItem, toggleItem };
}
