const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/responseHandler');
const AppError = require('../utils/appError');

const sendMessage = catchAsync(async (req, res) => {
  console.log('📨 Chatbot message received:', req.body.message?.substring(0, 50));
  
  const { message, language = 'en', conversationHistory = [] } = req.body;

  if (!message || !message.trim()) {
    console.log('❌ Empty message');
    throw new AppError('Message is required', 400);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ Gemini AI not configured');
    throw new AppError('AI service is not configured. Please add GEMINI_API_KEY to environment variables.', 503);
  }

  const systemPrompt = language === 'hi' 
    ? `आप एक सहायक चिकित्सा AI सहायक हैं। आप मरीजों को उनके स्वास्थ्य संबंधी सवालों के जवाब देते हैं।

महत्वपूर्ण नियम:
1. केवल चिकित्सा और स्वास्थ्य से संबंधित प्रश्नों का उत्तर दें
2. हमेशा विनम्र और सहायक रहें
3. यदि कोई गंभीर लक्षण है, तो तुरंत डॉक्टर से परामर्श लेने की सलाह दें
4. कभी भी निश्चित निदान न दें - केवल सामान्य जानकारी प्रदान करें
5. आपातकालीन मामलों में, तुरंत आपातकालीन सेवाओं को कॉल करने के लिए कहें
6. हमेशा हिंदी में उत्तर दें
7. संक्षिप्त और स्पष्ट उत्तर दें

यदि प्रश्न चिकित्सा/स्वास्थ्य से संबंधित नहीं है, तो विनम्रता से बताएं कि आप केवल स्वास्थ्य संबंधी प्रश्नों में मदद कर सकते हैं।`
    : `You are a helpful medical AI assistant. You help patients with their health-related questions.

Important rules:
1. Only answer medical and health-related questions
2. Always be polite and helpful
3. If there are serious symptoms, advise to consult a doctor immediately
4. Never give definitive diagnoses - only provide general information
5. For emergencies, tell them to call emergency services immediately
6. Always respond in English
7. Keep responses concise and clear

If the question is not medical/health-related, politely explain that you can only help with health-related queries.`;

  let conversationContext = systemPrompt + '\n\n';
  
  const recentHistory = conversationHistory.slice(-5);
  recentHistory.forEach(msg => {
    conversationContext += `${msg.type === 'user' ? 'Patient' : 'Assistant'}: ${msg.text}\n`;
  });
  
  conversationContext += `Patient: ${message}\nAssistant:`;

  console.log('🤖 Calling Gemini API directly...');
  
  // Use the REST API directly with v1beta endpoint and gemini-2.5-flash model
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    const response = await axios.post(apiUrl, {
      contents: [{
        parts: [{
          text: conversationContext
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    console.log('✅ AI response generated successfully');
    return sendResponse(res, 200, true, 'AI response generated successfully', {
      message: botReply,
      language: language,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Chatbot API request error:', error.message);
    if (error.response) {
      console.error('API Response error:', error.response.data);
    }
    throw new AppError('Failed to get AI response', 500);
  }
});

const detectLanguage = catchAsync(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    throw new AppError('Text is required', 400);
  }

  const hindiRegex = /[\u0900-\u097F]/;
  const isHindi = hindiRegex.test(text);

  return sendResponse(res, 200, true, 'Language detected successfully', {
    language: isHindi ? 'hi' : 'en',
    confidence: isHindi ? 0.9 : 0.9
  });
});

module.exports = {
  sendMessage,
  detectLanguage
};
