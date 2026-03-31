import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp
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
      // Admin gets all messages. A single-field orderBy needs no composite index.
      q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    } else {
      // User query: omit orderBy to avoid requiring a composite Firestore index.
      // We sort client-side below.
      q = query(
        collection(db, 'messages'),
        where('userId', '==', userId)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })).sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta; // newest first (caller reverses for chronological display)
      });
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
      senderId: isAdmin ? 'admin' : userId,
      content,
      status: MESSAGE_STATUSES.SENT,
      createdAt: serverTimestamp(),
    });
    // When a user sends a message, create an admin notification
    if (!isAdmin) {
      await addDoc(collection(db, 'notifications'), {
        title: 'New Message',
        message: 'A user has sent you a message.',
        read: false,
        createdAt: serverTimestamp(),
        type: 'message',
      });
    }
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

  // For user BottomNav badge: unseen messages from admin
  const getUnseenCount = () => {
    return messages.filter(
      m => m.senderId === 'admin' && m.status !== MESSAGE_STATUSES.SEEN
    ).length;
  };

  // For admin sidebar badge: unseen messages from users
  const getUnseenUserMessagesCount = () => {
    return messages.filter(
      m => m.senderId !== 'admin' && m.status !== MESSAGE_STATUSES.SEEN
    ).length;
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsSeen,
    markAsDelivered,
    getMessagesByUser,
    getUnseenCount,
    getUnseenUserMessagesCount,
  };
}
