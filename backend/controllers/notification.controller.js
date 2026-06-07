// backend/controllers/notification.controller.js
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service');
const { sendResponse } = require('../utils/responseHandler');

exports.getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const result = await notificationService.getNotifications(req.userId, { page, limit, unreadOnly });
  return res.status(200).json({
    success: true,
    count: result.notifications.length,
    total: result.total,
    unreadCount: result.unreadCount,
    page: result.page,
    pages: result.pages,
    data: result.notifications
  });
});

exports.getNotificationById = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id, req.userId);
  return sendResponse(res, 200, true, 'Notification retrieved successfully', notification);
});

exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.userId);
  return sendResponse(res, 200, true, 'Notification marked as read', notification);
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  const count = await notificationService.markAllAsRead(req.userId);
  return sendResponse(res, 200, true, `${count} notification(s) marked as read`, { modifiedCount: count });
});

exports.deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.userId);
  return sendResponse(res, 200, true, 'Notification deleted successfully');
});

exports.clearReadNotifications = catchAsync(async (req, res) => {
  const count = await notificationService.clearReadNotifications(req.userId);
  return sendResponse(res, 200, true, `${count} notification(s) cleared successfully`, { deletedCount: count });
});

exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.userId);
  return res.status(200).json({
    success: true,
    data: {
      count: count,
      unreadCount: count
    }
  });
});

exports.createNotification = catchAsync(async (req, res) => {
  const { userId, title, message, type, relatedEntity } = req.body;
  const notification = await notificationService.createNotification(userId, title, message, type, relatedEntity);
  return sendResponse(res, 201, true, 'Notification created successfully', notification);
});