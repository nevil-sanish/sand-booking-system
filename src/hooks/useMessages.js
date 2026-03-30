import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, getDocs, serverTimestamp
} from 'firebase/firestore';
import { MESSAGE_STATUSES } from '../utils/constants';

export function useMessages(userId = null, isAdmin = false) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId && !isAdmin) {
      setLoading(false);
      return;
    }

    let q;
    if (isAdmin) {
      q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'messages'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, isAdmin]);

  const sendMessage = async (targetUserId, content) => {
    await addDoc(collection(db, 'messages'), {
      userId: targetUserId,
      content,
      status: MESSAGE_STATUSES.SENT,
      createdAt: serverTimestamp(),
    });
  };

  const markAsSeen = async (messageId) => {
    await updateDoc(doc(db, 'messages', messageId), {
      status: MESSAGE_STATUSES.SEEN,
    });
  };

  const markAsDelivered = async (messageId) => {
    await updateDoc(doc(db, 'messages', messageId), {
      status: MESSAGE_STATUSES.DELIVERED,
    });
  };

  const getMessagesByUser = (targetUserId) => {
    return messages.filter(m => m.userId === targetUserId);
  };

  const getUnseenCount = () => {
    return messages.filter(m => m.status !== MESSAGE_STATUSES.SEEN).length;
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsSeen,
    markAsDelivered,
    getMessagesByUser,
    getUnseenCount,
  };
}
