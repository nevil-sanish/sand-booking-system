/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// This file must be in the public/ directory

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDS7iSeBM_U5lu_6jm6InVYPHVpFpIfXhc",
  authDomain: "sand-app-9cd9c.firebaseapp.com",
  projectId: "sand-app-9cd9c",
  storageBucket: "sand-app-9cd9c.firebasestorage.app",
  messagingSenderId: "182566720111",
  appId: "1:182566720111:web:0c27a9b4952c013150b39a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  if (title) {
    self.registration.showNotification(title, {
      body: body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
    });
  }
});
