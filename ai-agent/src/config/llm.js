const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { ChatOpenAI } = require('@langchain/openai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

function createLLM() {
  const provider = process.env.LLM_PROVIDER || 'google';
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER=openai');
    return new ChatOpenAI({ modelName: 'gpt-4', temperature: 0.1, openAIApiKey: process.env.OPENAI_API_KEY });
  }
  if (provider === 'google') {
    if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is required when LLM_PROVIDER=google');
    return new ChatGoogleGenerativeAI({ modelName: 'gemini-2.0-flash', temperature: 0.1, apiKey: process.env.GOOGLE_API_KEY });
  }
  throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
}

module.exports = { createLLM };
