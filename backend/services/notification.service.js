// backend/services/notification.service.js
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const AppError = require('../utils/appError');

class NotificationService {
  async getNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const query = { recipient: userId };

    if (unreadOnly === true || unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return {
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    };
  }

  async getNotificationById(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new AppError('Access denied. This notification does not belong to you', 403);
    }

    return notification;
  }

  async markAsRead(notificationId, userId) {
    const notification = await this.getNotificationById(notificationId, userId);
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result.modifiedCount;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await this.getNotificationById(notificationId, userId);
    await notification.deleteOne();
    return true;
  }

  async clearReadNotifications(userId) {
    const result = await Notification.deleteMany({
      recipient: userId,
      isRead: true
    });
    return result.deletedCount;
  }

  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    return count;
  }

  async createNotification(userId, title, message, type, relatedEntity = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Recipient user not found', 404);
    }

    const notification = await Notification.create({
      recipient: userId,
      title,
      message,
      type,
      relatedEntity
    });

    return notification;
  }
}

module.exports = new NotificationService();
