const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

/**
 * Check for unseen messages older than 10 hours
 * Runs every hour and notifies admin if messages are unseen
 */
exports.checkUnseenMessages = onSchedule("every 1 hours", async (event) => {
  const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

  try {
    const unseenMessages = await db
      .collection("messages")
      .where("status", "in", ["sent", "delivered"])
      .where("createdAt", "<=", tenHoursAgo)
      .get();

    if (unseenMessages.empty) {
      console.log("No unseen messages older than 10 hours.");
      return;
    }

    // Get admin users
    const admins = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();

    const adminTokens = [];
    admins.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        adminTokens.push(data.fcmToken);
      }
    });

    if (adminTokens.length === 0) {
      console.log("No admin tokens found for notification.");
      return;
    }

    // Group unseen messages by user
    const userIds = new Set();
    unseenMessages.forEach((doc) => {
      userIds.add(doc.data().userId);
    });

    const message = {
      notification: {
        title: "Unseen Messages Alert",
        body: `${unseenMessages.size} message(s) from ${userIds.size} user(s) haven't been seen for over 10 hours.`,
      },
      tokens: adminTokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(
      `Notifications sent: ${response.successCount} success, ${response.failureCount} failure`
    );
  } catch (error) {
    console.error("Error checking unseen messages:", error);
  }
});

/**
 * Notify admin when a new order is created
 */
exports.onNewOrder = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderData = event.data.data();

  try {
    // Get admin users with FCM tokens
    const admins = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();

    const adminTokens = [];
    admins.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        adminTokens.push(data.fcmToken);
      }
    });

    if (adminTokens.length === 0) return;

    const message = {
      notification: {
        title: "New Order Received!",
        body: `${orderData.userName || "A customer"} placed an order worth ₹${orderData.totalPrice}`,
      },
      data: {
        type: "new_order",
        orderId: event.params.orderId,
      },
      tokens: adminTokens,
    };

    await getMessaging().sendEachForMulticast(message);
    console.log("Admin notified of new order");
  } catch (error) {
    console.error("Error notifying admin:", error);
  }
});

/**
 * Send push notification to a specific user
 */
exports.sendNotification = onCall(async (request) => {
  const { userId, title, body } = request.data;

  if (!userId || !title || !body) {
    throw new HttpsError(
      "invalid-argument",
      "userId, title, and body are required"
    );
  }

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();
    if (!userData.fcmToken) {
      throw new HttpsError(
        "failed-precondition",
        "User has no FCM token registered"
      );
    }

    const message = {
      notification: { title, body },
      token: userData.fcmToken,
    };

    await getMessaging().send(message);
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new HttpsError("internal", error.message);
  }
});
