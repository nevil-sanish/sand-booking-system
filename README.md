# Mullonkal Sand - Sand Ordering System

A production-ready, mobile-first web application for managing sand and construction material orders. Built with React (Vite) and Firebase, the system provides separate interfaces for customers and administrators with real-time data synchronization.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Default Admin Account](#default-admin-account)
- [User Workflows](#user-workflows)
- [Admin Workflows](#admin-workflows)
- [Firestore Schema](#firestore-schema)
- [Cloud Functions](#cloud-functions)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Overview

Mullonkal Sand is a mobile-first ordering platform designed for sand and construction material suppliers. Customers can browse available items, place orders with GPS-based delivery locations, and track order status in real-time. Administrators manage inventory, approve user registrations, process orders, and communicate with customers through an integrated messaging system.

---

## Features

### Customer Features

- Registration and authentication via phone number and name with admin-controlled approval
- Real-time display of available items with pricing
- Multi-item cart with quantity controls and price calculations
- Interactive map (Leaflet/OpenStreetMap) with GPS support and reverse geocoding
- Price locking at order time with delivery time selection
- Real-time order status tracking (pending, confirmed, completed, cancelled)
- Pending order cancellation
- In-app messaging from administrator
- Password management

### Administrator Features

- Dashboard with order statistics and quick action cards
- Tabbed order management with confirm, complete, cancel, and call actions
- Full CRUD operations for items (add, edit, update price, enable/disable)
- User approval with password assignment, suspicious user flagging, password reset
- Per-user messaging with delivery status tracking (sent, delivered, seen)

### System Features

- Real-time Firestore listeners for items, orders, and messages
- Firebase Cloud Messaging for push notifications
- Scheduled Cloud Function for unseen message alerts (10-hour threshold)
- Suspicious user flagging with warning banners
- Responsive mobile-first UI with bottom navigation

---

## Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Frontend      | React 18, Vite                          |
| Styling       | Vanilla CSS (custom design system)      |
| Routing       | React Router v6                         |
| State         | React Context API                       |
| Database      | Firebase Firestore                      |
| Notifications | Firebase Cloud Messaging (FCM)          |
| Functions     | Firebase Cloud Functions (Node.js 18)   |
| Maps          | Leaflet, React-Leaflet, OpenStreetMap   |
| Icons         | Lucide React                            |

---

## Project Structure

```
mullonkal-sand/
├── public/
│   ├── favicon.svg
│   └── firebase-messaging-sw.js
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Spinner.jsx
│   │   └── layout/
│   │       ├── BottomNav.jsx
│   │       ├── Header.jsx
│   │       └── Layout.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useItems.js
│   │   ├── useMessages.js
│   │   ├── useOrders.js
│   │   └── useUsers.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ItemsPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   └── UsersPage.jsx
│   │   ├── auth/
│   │   │   ├── ChangePasswordPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   └── user/
│   │       ├── CartPage.jsx
│   │       ├── HomePage.jsx
│   │       ├── LocationPage.jsx
│   │       ├── MessagesPage.jsx
│   │       ├── OrdersPage.jsx
│   │       ├── OrderSummaryPage.jsx
│   │       └── ProfilePage.jsx
│   ├── services/
│   │   └── firebase.js
│   ├── styles/
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── index.css
│   │   └── pages.css
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   └── main.jsx
├── functions/
│   ├── index.js
│   └── package.json
├── .env
├── firebase.json
├── firestore.rules
├── index.html
├── package.json
└── vite.config.js
```

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Firebase project with Firestore enabled
- Firebase CLI (optional, for deploying Cloud Functions)

---

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mullonkal-sand
```

2. Install frontend dependencies:

```bash
npm install
```

3. Install Cloud Functions dependencies (if deploying functions):

```bash
cd functions
npm install
cd ..
```

---

## Configuration

Create a `.env` file in the project root with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firestore Setup

The following collections are used and will be created automatically when the first document is written:

- `users`
- `items`
- `orders`
- `messages`

### Firestore Indexes

Composite indexes may be required for certain queries. Firebase will provide a direct link in the browser console when an index is needed. Click the link to create the index automatically.

### FCM Setup (Optional)

1. Navigate to Firebase Console > Project Settings > Cloud Messaging
2. Generate a VAPID key
3. Update `public/firebase-messaging-sw.js` with your Firebase configuration if it differs from the default

---

## Running the Application

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Default Admin Account

The application includes a built-in default admin account for initial setup:

| Field    | Value        |
|----------|--------------|
| Phone    | 9999999999   |
| Password | admin123     |

On first login with these credentials, the system automatically creates the admin document in Firestore. If the document already exists, the system will synchronize the password and role fields.

To change the default credentials, modify the `DEFAULT_ADMIN_PHONE` and `DEFAULT_ADMIN_PASSWORD` constants in `src/contexts/AuthContext.jsx`.

---

## User Workflows

### Registration

1. Navigate to the registration page
2. Enter full name and phone number
3. Submit the form; account status is set to "pending"
4. Wait for admin approval and password assignment

### Placing an Order

1. Log in with phone number and assigned password
2. Browse available items on the home page
3. Add items to cart with desired quantities
4. Select delivery location via GPS or by tapping the map
5. Set a delivery time using the time picker
6. Review the order summary and confirm
7. Track order status on the orders page

### Cancelling an Order

Orders may only be cancelled while in "pending" status. Once confirmed by the administrator, cancellation is no longer available.

---

## Admin Workflows

### Managing Items

1. Navigate to Items via the bottom navigation
2. Add new items with name, price, and unit
3. Edit existing items to update names or prices
4. Toggle items active or inactive using the switch control

### Approving Users

1. Navigate to Users via the bottom navigation
2. Select the Pending tab to view new registrations
3. Click Approve and assign an initial password
4. The user can then log in with their phone number and the assigned password

### Processing Orders

1. Navigate to Orders via the bottom navigation
2. Filter orders by status using the tabbed interface
3. View order details including customer information, items, total, delivery location, and time
4. Confirm, complete, or cancel orders using the action buttons
5. Contact customers directly using the call button

### Messaging Users

1. Navigate to Messages via the bottom navigation
2. Select a user from the list
3. Compose and send a message
4. Monitor delivery status (sent, delivered, seen)

### Flagging Suspicious Users

1. Navigate to Users and select the Approved tab
2. Click the flag icon to mark a user as suspicious
3. The user will see a warning banner on their next login
4. Click the unflag icon to remove the designation

---

## Firestore Schema

### users

| Field     | Type      | Description                          |
|-----------|-----------|--------------------------------------|
| name      | string    | Full name                            |
| phone     | string    | 10-digit phone number (unique)       |
| password  | string    | Account password                     |
| role      | string    | "admin" or "user"                    |
| status    | string    | "pending" or "approved"              |
| flagged   | boolean   | Suspicious user indicator            |
| fcmToken  | string    | Firebase Cloud Messaging token       |
| createdAt | timestamp | Account creation timestamp           |

### items

| Field     | Type      | Description                          |
|-----------|-----------|--------------------------------------|
| name      | string    | Item name                            |
| price     | number    | Price per unit                       |
| unit      | string    | Unit of measurement (e.g., "load")   |
| active    | boolean   | Availability status                  |
| createdAt | timestamp | Creation timestamp                   |
| updatedAt | timestamp | Last modification timestamp          |

### orders

| Field      | Type      | Description                         |
|------------|-----------|-------------------------------------|
| userId     | string    | Ordering user reference             |
| userName   | string    | Customer name (denormalized)        |
| userPhone  | string    | Customer phone (denormalized)       |
| items      | array     | [{itemId, name, price, quantity}]   |
| totalPrice | number    | Total price (locked at order time)  |
| location   | map       | {lat, lng, address}                 |
| timeNeeded | string    | Requested delivery time             |
| status     | string    | pending, confirmed, completed, or cancelled |
| createdAt  | timestamp | Order creation timestamp            |

### messages

| Field     | Type      | Description                          |
|-----------|-----------|--------------------------------------|
| userId    | string    | Target user ID                       |
| content   | string    | Message body                         |
| status    | string    | sent, delivered, or seen             |
| createdAt | timestamp | Message creation timestamp           |

---

## Cloud Functions

### checkUnseenMessages

- **Trigger**: Scheduled (every 1 hour)
- **Purpose**: Identifies messages older than 10 hours that remain unread and notifies administrators via push notification

### onNewOrder

- **Trigger**: Firestore onCreate (orders collection)
- **Purpose**: Sends push notification to administrators when a new order is placed

### sendNotification

- **Trigger**: Callable HTTPS function
- **Purpose**: Sends a targeted push notification to a specific user

### Deploying Functions

```bash
firebase deploy --only functions
```

---

## Deployment

### Frontend

Build the application and deploy the `dist/` directory to any static hosting provider:

```bash
npm run build
```

Compatible hosting platforms include Firebase Hosting, Vercel, Netlify, and similar services.

### Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

### Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

---

## Security Considerations

- **Password Storage**: Passwords are stored as plain text in Firestore per project specification. For production use with sensitive data, consider implementing Firebase Authentication or password hashing.
- **Firestore Rules**: The included rules are permissive for development purposes. Restrict read and write access based on authentication state and user roles before production deployment.
- **Default Credentials**: Change the default admin phone number and password after initial setup.
- **Environment Variables**: Firebase client configuration keys are safe for client-side exposure. Do not store server-side secrets in the `.env` file.

---

## License

This project is proprietary software. All rights reserved.
