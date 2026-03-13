const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/medchain_db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'google',
  POLYGON_AMOY_RPC_URL: process.env.POLYGON_AMOY_RPC_URL,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  ALERT_EMAIL: process.env.ALERT_EMAIL,
};
