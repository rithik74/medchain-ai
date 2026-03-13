const { ChatMessage, Vitals, Patient } = require('../models');
const env = require('../config/env');

let genAI, model;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini chatbot model loaded');
  } else {
    console.warn('⚠️ GOOGLE_API_KEY not set — chatbot will use fallback replies');
  }
} catch (e) { console.warn('⚠️ Gemini not available for chatbot:', e.message); }

// Simple fallback responses when Gemini is unavailable
function getFallbackReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return "Hello! 👋 I'm MedChain AI Health Assistant. I'm currently running in offline mode, so my responses are limited. Please check back later for full AI-powered advice, or consult your healthcare provider for medical questions.";
  }
  if (lower.includes('heart') || lower.includes('pulse') || lower.includes('rate')) {
    return "A normal resting heart rate is typically between 60-100 bpm. Factors like exercise, stress, and caffeine can affect it. If you're concerned about your heart rate, please consult your doctor. 💓\n\n⚠️ I'm an AI assistant — always verify with a medical professional.";
  }
  if (lower.includes('temperature') || lower.includes('fever')) {
    return "Normal body temperature is around 36.1°C to 37.2°C (97°F to 99°F). A temperature above 38°C (100.4°F) is generally considered a fever. Stay hydrated and rest. If fever persists, consult your doctor. 🌡️\n\n⚠️ I'm an AI assistant — always verify with a medical professional.";
  }
  return "Thank you for your message! I'm MedChain AI Health Assistant. I'm here to help with general health questions about your vitals, symptoms, and wellness. For personalized medical advice, please consult your healthcare provider. 🏥\n\n⚠️ I'm an AI assistant — always verify with a medical professional.";
}

exports.chat = async (req, res, next) => {
  try {
    const { message, patient_id } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Save user message
    try {
      await ChatMessage.create({ sender_id: patient_id || 'anonymous', message, type: 'user' });
    } catch (dbErr) {
      console.error('Failed to save user message:', dbErr.message);
    }

    let vitalsContext = '';
    if (patient_id) {
      try {
        const latest = await Vitals.findOne({ where: { patient_id }, order: [['timestamp', 'DESC']] });
        if (latest) {
          vitalsContext = `\nPatient's latest vitals: HR=${latest.heart_rate}bpm, SpO2=${latest.spo2}%, Temp=${latest.temperature}°C${latest.blood_pressure_systolic ? `, BP=${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}mmHg` : ''}.`;
        }
      } catch (vErr) {
        console.error('Failed to fetch vitals context:', vErr.message);
      }
    }

    let reply;

    // Try Gemini first
    if (model) {
      try {
        const systemPrompt = `You are MedChain AI Health Assistant, a friendly and professional healthcare chatbot. 
You help patients understand their health metrics, answer medical questions, and provide general wellness advice.
IMPORTANT: Always remind users that you are an AI assistant and they should consult a real doctor for medical decisions.
Keep responses concise (2-3 paragraphs max). Use emojis sparingly for warmth.${vitalsContext}`;

        const result = await model.generateContent(`${systemPrompt}\n\nPatient: ${message}`);
        reply = result.response.text();
        console.log('🤖 Gemini chatbot replied successfully');
      } catch (aiErr) {
        console.error('❌ Gemini API error:', aiErr.message);
        reply = getFallbackReply(message);
      }
    } else {
      reply = getFallbackReply(message);
    }

    // Save AI reply
    try {
      await ChatMessage.create({ sender_id: 'ai-assistant', receiver_id: patient_id || 'anonymous', message: reply, type: 'ai' });
    } catch (dbErr) {
      console.error('Failed to save AI reply:', dbErr.message);
    }

    res.json({ success: true, data: { reply, timestamp: new Date() } });
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    // Always return a response, never crash
    res.json({ success: true, data: { reply: getFallbackReply(req.body?.message || ''), timestamp: new Date() } });
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const messages = await ChatMessage.findAll({
      where: { sender_id: [patientId, 'ai-assistant'] },
      order: [['timestamp', 'ASC']],
      limit: 50,
    });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
};
