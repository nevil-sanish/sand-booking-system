import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, where, getDocs
} from 'firebase/firestore';
import { USER_STATUSES } from '../utils/constants';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const approveUser = async (userId, password) => {
    await updateDoc(doc(db, 'users', userId), {
      status: USER_STATUSES.APPROVED,
      password,
    });
  };

  const flagUser = async (userId, flagged) => {
    await updateDoc(doc(db, 'users', userId), { flagged });
  };

  const setUserPassword = async (userId, password) => {
    await updateDoc(doc(db, 'users', userId), { password });
  };

  const getPendingUsers = () => {
    return users.filter(u => u.status === USER_STATUSES.PENDING);
  };

  const getApprovedUsers = () => {
    return users.filter(u => u.status === USER_STATUSES.APPROVED);
  };

  return {
    users,
    loading,
    approveUser,
    flagUser,
    setUserPassword,
    getPendingUsers,
    getApprovedUsers,
  };
}
