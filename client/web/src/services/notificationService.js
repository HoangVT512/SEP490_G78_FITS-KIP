/**
 * NotificationService
 * Centralized service for all notification-related API calls
 * All endpoints use process.env.REACT_APP_API_BASE_URL
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://localhost:7003/api";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Common fetch configuration
 */
const getFetchConfig = (options = {}) => {
  const token = getAuthToken();
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
};

/**
 * Get all notifications for current user
 * @param {boolean} unreadOnly - If true, only fetch unread notifications
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotifications = async (unreadOnly = false) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications?unreadOnly=${unreadOnly}`,
      getFetchConfig()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count for current user
 * @returns {Promise<number>} Number of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/unread-count`,
      getFetchConfig()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Get a single notification by ID
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Notification object
 */
export const getNotificationById = async (notificationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/${notificationId}`,
      getFetchConfig()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Error fetching notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<boolean>} True if successful
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/${notificationId}/read`,
      getFetchConfig({
        method: "PUT",
      })
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error
    );
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<boolean>} True if successful
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/read-all`,
      getFetchConfig({
        method: "PUT",
      })
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {number} notificationId - Notification ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/${notificationId}`,
      getFetchConfig({
        method: "DELETE",
      })
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Get notification summary for current user
 * @returns {Promise<Object>} Summary object with counts
 */
export const getNotificationSummary = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/summary`,
      getFetchConfig()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching notification summary:", error);
    throw error;
  }
};

/**
 * Delete all read notifications
 * @returns {Promise<boolean>} True if successful
 */
export const deleteAllReadNotifications = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/delete-all-read`,
      getFetchConfig({
        method: "DELETE",
      })
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting all read notifications:", error);
    throw error;
  }
};

/**
 * Send notification to all Technical Managers
 * @param {Object} notificationData - { message, type, data }
 * @returns {Promise<boolean>} True if successful
 */
export const sendToTechnicalManagers = async (notificationData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Notifications/send-to-technical-managers`,
      getFetchConfig({
        method: "POST",
        body: JSON.stringify(notificationData),
      })
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error sending notification to technical managers:", error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSummary,
  deleteAllReadNotifications,
  sendToTechnicalManagers,
};
