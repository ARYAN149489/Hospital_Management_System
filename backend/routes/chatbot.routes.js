const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

// Import controller
const chatbotController = require('../controllers/chatbot.controller');

router.post('/message', authenticate, chatbotController.sendMessage);
router.post('/detect-language', authenticate, chatbotController.detectLanguage);

module.exports = router;
