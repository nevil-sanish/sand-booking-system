import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, deleteDoc
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
        where('userId', '==', userId)
      );
    } else {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
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
    // Add Notification
    await addDoc(collection(db, 'notifications'), {
      title: 'New Order',
      message: `A new order has been placed and is waiting for confirmation.`,
      read: false,
      createdAt: serverTimestamp(),
      type: 'order'
    });

    return docRef.id;
  };

  const updateOrderStatus = async (orderId, status) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const deleteOrder = async (orderId) => {
    await deleteDoc(doc(db, 'orders', orderId));
  };

  return { orders, loading, createOrder, updateOrderStatus, getOrdersByStatus, deleteOrder };
}
