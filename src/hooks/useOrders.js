import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';

export function useOrders(userId = null, isAdmin = false) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (isAdmin) {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else if (userId) {
      q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, isAdmin]);

  const createOrder = async (orderData) => {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateOrderStatus = async (orderId, status) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  return { orders, loading, createOrder, updateOrderStatus, getOrdersByStatus };
}
