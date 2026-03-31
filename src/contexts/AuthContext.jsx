import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import {
  collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { USER_STATUSES, USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored session on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      loadUser(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        if (userData.status === USER_STATUSES.APPROVED) {
          setUser(userData);
        } else {
          localStorage.removeItem('userId');
        }
      } else {
        localStorage.removeItem('userId');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [user?.id]);

  const register = async (name, phone, password) => {
    // Check if phone already exists
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('Phone number already registered');
    }

    const userRef = await addDoc(collection(db, 'users'), {
      name,
      phone,
      password,
      role: USER_ROLES.USER,
      status: USER_STATUSES.PENDING,
      flagged: false,
      fcmToken: '',
      createdAt: serverTimestamp(),
    });

    // Notify Admins
    await addDoc(collection(db, 'notifications'), {
      title: 'New User Registration',
      message: `${name} (${phone}) registered and is awaiting approval.`,
      read: false,
      createdAt: serverTimestamp(),
      type: 'user'
    });

    return userRef.id;
  };

  // Default admin credentials
  const DEFAULT_ADMIN_PHONE = '8888855555';
  const DEFAULT_ADMIN_PASSWORD = 'jameson@119';

  const login = async (phone, password) => {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const snapshot = await getDocs(q);

    // Default admin: auto-create or fix if needed
    if (phone === DEFAULT_ADMIN_PHONE && password === DEFAULT_ADMIN_PASSWORD) {
      if (snapshot.empty) {
        // Create admin doc
        const adminRef = await addDoc(collection(db, 'users'), {
          name: 'Admin',
          phone: DEFAULT_ADMIN_PHONE,
          password: DEFAULT_ADMIN_PASSWORD,
          role: USER_ROLES.ADMIN,
          status: USER_STATUSES.APPROVED,
          flagged: false,
          fcmToken: '',
          createdAt: serverTimestamp(),
        });
        const fullUser = {
          id: adminRef.id, name: 'Admin', phone: DEFAULT_ADMIN_PHONE,
          password: DEFAULT_ADMIN_PASSWORD, role: USER_ROLES.ADMIN,
          status: USER_STATUSES.APPROVED, flagged: false, fcmToken: '',
        };
        setUser(fullUser);
        localStorage.setItem('userId', adminRef.id);
        return fullUser;
      } else {
        // Admin doc exists — fix password/status if needed and log in
        const adminDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', adminDoc.id), {
          password: DEFAULT_ADMIN_PASSWORD,
          role: USER_ROLES.ADMIN,
          status: USER_STATUSES.APPROVED,
        });
        const fullUser = { id: adminDoc.id, ...adminDoc.data(), password: DEFAULT_ADMIN_PASSWORD, role: USER_ROLES.ADMIN, status: USER_STATUSES.APPROVED };
        setUser(fullUser);
        localStorage.setItem('userId', adminDoc.id);
        return fullUser;
      }
    }

    if (snapshot.empty) {
      throw new Error('No account found with this phone number');
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.status === USER_STATUSES.PENDING) {
      throw new Error('Your account is pending approval. Please wait for admin confirmation.');
    }
    
    if (userData.status === USER_STATUSES.REJECTED) {
      throw new Error('Your account request was rejected.');
    }

    if (userData.status === USER_STATUSES.APPROVED && (!userData.password || userData.password === '')) {
      // Legacy catch for old accounts without a password, though all new ones will have it.
      throw new Error('NEEDS_SETUP');
    }

    if (userData.password !== password) {
      throw new Error('Incorrect password');
    }

    const fullUser = { id: userDoc.id, ...userData };
    setUser(fullUser);
    localStorage.setItem('userId', userDoc.id);
    return fullUser;
  };



  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) throw new Error('Not logged in');

    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    await updateDoc(doc(db, 'users', user.id), {
      password: newPassword,
    });

    setUser(prev => ({ ...prev, password: newPassword }));
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    changePassword,
    refreshUser,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isApproved: user?.status === USER_STATUSES.APPROVED,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
