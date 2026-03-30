/**
 * Admin Seed Script
 * Run this ONCE to create the initial admin account in Firestore.
 * 
 * Usage:
 *   1. Open browser console on the running app
 *   2. Paste this code and run it
 * 
 * Or import the function in a component temporarily.
 */

import { db } from './services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export async function seedAdmin() {
  const phone = '9999999999'; // Change to your admin phone
  const password = 'admin123'; // Change to your admin password
  const name = 'Admin';

  // Check if admin already exists
  const q = query(collection(db, 'users'), where('phone', '==', phone));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    console.log('Admin account already exists!');
    return;
  }

  await addDoc(collection(db, 'users'), {
    name,
    phone,
    password,
    role: 'admin',
    status: 'approved',
    flagged: false,
    fcmToken: '',
    createdAt: serverTimestamp(),
  });

  console.log(`Admin account created! Phone: ${phone}, Password: ${password}`);
}

// Auto-run when imported
// seedAdmin();
