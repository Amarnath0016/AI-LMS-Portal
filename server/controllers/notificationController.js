import mongoose from "mongoose";
import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Ownership check: must belong to the user
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found or access denied." });
    }

    return res.json({ success: true, message: "Notification marked as read.", data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ userId }, { $set: { read: true } });
    return res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Ownership check: must belong to the user
    const deleted = await Notification.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found or access denied." });
    }

    return res.json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
