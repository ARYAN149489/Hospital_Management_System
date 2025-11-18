// backend/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const { param, query, body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('unreadOnly')
      .optional()
      .isBoolean()
      .withMessage('unreadOnly must be a boolean'),
    validate
  ],
  notificationController.getNotifications
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

/**
 * @route   GET /api/notifications/unread/count (alternative route)
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
  '/unread/count',
  authenticate,
  notificationController.getUnreadCount
);

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch(
  '/mark-all-read',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * @route   DELETE /api/notifications/clear-read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete(
  '/clear-read',
  authenticate,
  notificationController.clearReadNotifications
);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get single notification
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid notification ID'),
    validate
  ],
  notificationController.getNotificationById
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid notification ID'),
    validate
  ],
  notificationController.markAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid notification ID'),
    validate
  ],
  notificationController.deleteNotification
);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Message must be between 5 and 1000 characters'),
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isIn(['appointment', 'prescription', 'leave', 'system', 'payment', 'reminder', 'general'])
      .withMessage('Invalid notification type'),
    validate
  ],
  notificationController.createNotification
);

module.exports = router;