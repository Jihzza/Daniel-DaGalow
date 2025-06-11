// src/utils/notificationUtils.js

/**
 * Checks if Notification API is supported.
 * @returns {boolean}
 */
export const isNotificationAPISupported = () => "Notification" in window;

/**
 * Gets the current notification permission status.
 * @returns {NotificationPermission} 'granted', 'denied', or 'default'
 */
export const getNotificationPermission = () => {
  if (!isNotificationAPISupported()) return "denied"; // Treat as denied if not supported
  return Notification.permission;
};

/**
 * Requests notification permission from the user.
 * @returns {Promise<NotificationPermission>} Resolves with the permission status.
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationAPISupported()) {
    console.log("This browser does not support desktop notification.");
    return "denied";
  }
  if (Notification.permission === "granted") {
    console.log("Notification permission already granted.");
    return "granted";
  }
  if (Notification.permission === "denied") {
    console.log("Notification permission was previously denied.");
    // You cannot re-request if denied. User must change it in browser settings.
    alert("Notification permission is denied. Please enable it in your browser settings if you wish to receive notifications.");
    return "denied";
  }

  // We need to ask the user for permission
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted by user.");
    } else {
      console.log("Notification permission not granted by user.");
    }
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "default"; // Or handle as denied
  }
};

/**
 * Shows a browser notification.
 * @param {string} title The title of the notification.
 * @param {object} options Notification options (body, icon, etc.). See MDN for Notification API.
 * @param {string} link Optional URL to open when notification is clicked.
 */
export const showNotification = (title, options, link = null) => {
  if (getNotificationPermission() !== "granted") {
    return null;
  }

  const notification = new Notification(title, options);

  notification.onclick = (event) => {
    event.preventDefault(); // prevent the browser from focusing the Notification's tab
    if (link) {
      window.open(link, '_blank');
    }
    notification.close();
  };
  return notification;
};