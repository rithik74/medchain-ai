# MedChain AI - Technology Stack

## Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **State Management**: React Context API / useState
- **Blockchain Integration**: ethers.js v6
- **Build Tool**: Vite
- **UI Components**: Headless UI / Radix UI (optional)

## Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API Architecture**: RESTful API
- **Environment Variables**: dotenv
- **Process Manager**: PM2 (production)
- **Validation**: Joi / express-validator
- **CORS**: cors middleware
- **Logging**: Winston / Morgan

## AI Agent
- **Framework**: LangChain.js
- **LLM Provider**: OpenAI GPT-4 / Google Gemini
- **Agent Type**: ReAct / Function Calling Agent
- **Prompt Engineering**: Custom healthcare analysis prompts
- **Tools**: Custom risk calculation tools
- **Memory**: In-memory conversation buffer

## Blockchain
- **Network**: Polygon Amoy Testnet
- **Smart Contract Language**: Solidity ^0.8.20
- **Development Framework**: Hardhat
- **Testing**: Hardhat Chai Matchers
- **Deployment**: Hardhat Deploy Plugin
- **Blockchain Library**: ethers.js v6
- **Wallet**: MetaMask
- **Block Explorer**: PolygonScan (Amoy)
- **RPC Provider**: Alchemy / Infura / public RPC

## Database
- **RDBMS**: PostgreSQL 15 / MySQL 8
- **ORM**: Sequelize / Knex.js
- **Migration Tool**: Knex migrations / Sequelize migrations
- **Connection Pooling**: Built-in ORM pooling
- **Schema Design**: Relational (Patients, Vitals, Risk Logs)

## Authentication & Security
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API Security**: Helmet.js
- **Rate Limiting**: express-rate-limit
- **Input Sanitization**: express-validator
- **Environment Security**: .env files (never committed)

## Alert System
- **Email Service**: Nodemailer
- **SMTP Provider**: Gmail SMTP / SendGrid / Mailtrap (testing)
- **Template Engine**: Handlebars / EJS (for email templates)
- **Queue System**: Bull / simple in-memory queue (MVP)
- **Notification Types**: Email alerts for HIGH/CRITICAL risk

## Hashing & Cryptography
- **Hashing Algorithm**: SHA-256 (crypto module)
- **Use Case**: Medical record integrity verification
- **Library**: Node.js built-in crypto module
- **Blockchain Storage**: Hash stored on-chain, data off-chain

## Development Tools
- **Version Control**: Git + GitHub
- **Code Editor**: VS Code
- **API Testing**: Postman / Thunder Client
- **Smart Contract Testing**: Hardhat Network
- **Package Manager**: npm / yarn
- **Linting**: ESLint
- **Formatting**: Prettier

## Infrastructure & Deployment
- **Containerization**: Docker (optional for hackathon)
- **Database Hosting**: Local PostgreSQL / Railway / Supabase
- **Backend Hosting**: Render / Railway / Local
- **Frontend Hosting**: Vercel / Netlify
- **Environment**: Development (local), Production (cloud)

## External APIs & Services
- **OpenAI API**: GPT-4 for AI agent
- **Alchemy/Infura**: Polygon Amoy RPC endpoint
- **PolygonScan API**: Transaction verification
- **Faucet**: Polygon Amoy Testnet Faucet (for test MATIC)

## Testing
- **Unit Testing**: Jest
- **Smart Contract Testing**: Hardhat + Chai
- **API Testing**: Supertest
- **Frontend Testing**: React Testing Library (optional for MVP)

## Documentation
- **API Documentation**: Markdown / Postman Collection
- **Code Comments**: JSDoc
- **README**: Comprehensive setup guide
- **Architecture Diagram**: Mermaid / Excalidraw

## Monitoring & Logging (Optional)
- **Application Logs**: Winston
- **Request Logs**: Morgan
- **Error Tracking**: Console logs (MVP) / Sentry (production)

## Key Dependencies Summary
```json
{
  "frontend": [
    "react",
    "react-dom",
    "ethers",
    "axios",
    "tailwindcss"
  ],
  "backend": [
    "express",
    "dotenv",
    "sequelize",
    "pg",
    "nodemailer",
    "jsonwebtoken",
    "bcrypt",
    "cors"
  ],
  "ai-agent": [
    "langchain",
    "@langchain/openai",
    "@langchain/core"
  ],
  "blockchain": [
    "hardhat",
    "@nomicfoundation/hardhat-toolbox",
    "ethers"
  ]
}
```

## Environment Variables Required
```
# Backend
DATABASE_URL=
JWT_SECRET=
PORT=5000

# AI Agent
OPENAI_API_KEY=
# or GOOGLE_API_KEY=

# Blockchain
POLYGON_AMOY_RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
ALERT_EMAIL=
```
