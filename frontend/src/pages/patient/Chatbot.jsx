// frontend/src/pages/patient/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Languages, Loader, RotateCcw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const initialMessage = {
  id: 1,
  type: 'bot',
  text: 'Hello! I\'m your AI health assistant. How can I help you today? / नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?',
  timestamp: new Date(),
  language: 'en'
};

const Chatbot = () => {
  const location = useLocation();
  
  // Load messages from localStorage on mount
  const getStoredMessages = () => {
    try {
      const stored = localStorage.getItem('chatbot_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
    return [initialMessage];
  };

  const [messages, setMessages] = useState(getStoredMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'hi'
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const isFirstMount = useRef(true);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('chatbot_messages', JSON.stringify(messages));
      } catch (error) {
        console.log('Error saving messages:', error);
      }
    }
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't reset on navigation - we're using localStorage now
  // Only reset when explicitly clicking "New Chat"

  // Function to start a new chat
  const handleNewChat = () => {
    const newMessages = [{ ...initialMessage, id: Date.now(), timestamp: new Date() }];
    setMessages(newMessages);
    localStorage.setItem('chatbot_messages', JSON.stringify(newMessages));
    setInputMessage('');
    setIsLoading(false);
    setIsListening(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    toast.success(language === 'hi' ? 'नई चैट शुरू की गई' : 'New chat started');
  };

  // Toggle voice recording
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Set language for recognition
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
      toast.success(`Listening in ${language === 'hi' ? 'Hindi' : 'English'}...`);
    }
  };

  // Text-to-Speech function
  const speakText = (text, lang = 'en') => {
    if (!('speechSynthesis' in window)) {
      return; // Silently fail if not supported
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Wait a bit to ensure synthesis is ready
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
          setIsSpeaking(false);
          // Only log error, don't show toast to avoid annoying users
          console.log('Speech synthesis error:', event.error);
        };

        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.log('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    toast.success(`Language switched to ${newLang === 'hi' ? 'Hindi' : 'English'}`);
  };

  // Detect language from text
  const detectLanguage = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text) ? 'hi' : 'en';
  };

  // Send message to AI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Detect language from user input
    const detectedLang = detectLanguage(inputMessage);
    setLanguage(detectedLang);

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date(),
      language: detectedLang
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get auth token - use same key as api.js
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Please login again');
        return;
      }
      
      // Send to backend API
      const response = await axios.post(
        `${API_URL}/chatbot/message`,
        {
          message: messageToSend,
          language: detectedLang,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.data.message,
          timestamp: new Date(response.data.data.timestamp),
          language: response.data.data.language
        };

        setMessages(prev => [...prev, botMessage]);

        // Auto-speak the response if enabled
        if (autoSpeak) {
          setTimeout(() => {
            speakText(response.data.data.message, response.data.data.language);
          }, 500);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: language === 'hi' 
          ? 'क्षमा करें, मुझे उत्तर देने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।'
          : 'Sorry, I\'m having trouble responding. Please try again later.',
        timestamp: new Date(),
        language: language
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (error.response?.status === 503) {
        toast.error('AI service not configured. Please contact administrator.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to get AI response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'hi' ? 'AI स्वास्थ्य सहायक' : 'AI Health Assistant'}
              </h2>
              <p className="text-sm text-gray-500">
                {language === 'hi' 
                  ? 'अपने स्वास्थ्य के बारे में मुझसे पूछें' 
                  : 'Ask me about your health concerns'}
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 transition flex items-center space-x-1"
              title="Start New Chat"
            >
              <RotateCcw className="w-5 h-5 text-green-600" />
              <span className="text-xs font-semibold text-green-600">
                {language === 'hi' ? 'नई चैट' : 'New'}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 transition flex items-center space-x-1"
              title="Switch Language"
            >
              <Languages className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">
                {language.toUpperCase()}
              </span>
            </button>
            
            {/* Auto-speak Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-lg transition ${autoSpeak ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              title={autoSpeak ? 'Disable Auto-speak' : 'Enable Auto-speak'}
            >
              {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            {/* Speaking indicator */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 rounded-lg bg-red-100 text-red-600 animate-pulse"
                title="Stop Speaking"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-xl ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex flex-col space-y-1">
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                <div className="flex items-center space-x-2 px-2">
                  <p
                    className={`text-xs ${
                      message.type === 'user' ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {message.type === 'bot' && (
                    <button
                      onClick={() => speakText(message.text, message.language)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      title="Speak this message"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl border border-gray-200">
              <Loader className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-600">
                {language === 'hi' ? 'सोच रहा हूं...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-lg transition ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={isListening ? 'Stop Recording' : 'Start Voice Input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={language === 'hi' ? 'अपना संदेश टाइप करें...' : 'Type your message...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{language === 'hi' ? 'भेजें' : 'Send'}</span>
          </button>
        </form>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            {language === 'hi' 
              ? '⚠️ आपातकालीन स्थिति में कृपया तुरंत डॉक्टर से संपर्क करें।'
              : '⚠️ For medical emergencies, please contact a doctor immediately.'}
          </p>
          <p className="text-xs text-blue-600">
            {language === 'hi' ? '🎤 हिंदी और English में बोलें' : '🎤 Speak in Hindi or English'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
