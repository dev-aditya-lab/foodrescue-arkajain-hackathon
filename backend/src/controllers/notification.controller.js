import notificationModel from "../model/notification.model.js";

export async function getMyNotifications(req, res) {
  try {
    const notifications = await notificationModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getUnreadNotificationCount(req, res) {
  try {
    const unreadCount = await notificationModel.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    const notification = await notificationModel.findOneAndUpdate(
      { _id: notificationId, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markAllNotificationsAsRead(req, res) {
  try {
    await notificationModel.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
