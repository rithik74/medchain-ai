# MedChain AI - 24-Hour Hackathon Implementation Plan

## Timeline Overview
- **Total Time**: 24 hours
- **Team Size**: 1-4 developers
- **Approach**: Agile, iterative, MVP-first

---

## Phase 1: Project Setup (Hours 0-2)

### 1.1 Initialize Monorepo
- [ ] Create main project directory
- [ ] Initialize Git repository
- [ ] Create `.gitignore` (node_modules, .env, etc.)

### 1.2 Frontend Setup
- [ ] `npx create-vite@latest frontend -- --template react`
- [ ] Install dependencies: `tailwindcss`, `ethers`, `axios`
- [ ] Configure Tailwind CSS
- [ ] Create basic folder structure (components, services, utils)

### 1.3 Backend Setup
- [ ] Initialize Node.js project: `npm init -y`
- [ ] Install dependencies: `express`, `dotenv`, `sequelize`, `pg`, `cors`, `nodemailer`
- [ ] Create folder structure (routes, controllers, services, models)
- [ ] Set up `server.js` with Express boilerplate

### 1.4 Database Setup
- [ ] Install PostgreSQL locally or use cloud instance
- [ ] Create database: `medchain_db`
- [ ] Write schema file (`schema.sql`)
- [ ] Create migrations for:
  - Patients table (id, name, email, age, created_at)
  - Vitals table (id, patient_id, heart_rate, spo2, temperature, timestamp)
  - RiskLogs table (id, patient_id, risk_level, reason, action, timestamp)

### 1.5 AI Agent Setup
- [ ] Create `ai-agent` directory
- [ ] Install: `langchain`, `@langchain/openai`
- [ ] Create `.env` with `OPENAI_API_KEY`
- [ ] Set up basic agent scaffold

### 1.6 Blockchain Setup
- [ ] Initialize Hardhat project: `npx hardhat init`
- [ ] Configure `hardhat.config.js` for Polygon Amoy
- [ ] Get test MATIC from Amoy faucet
- [ ] Create `.env` with `PRIVATE_KEY` and `RPC_URL`

**Deliverable**: All environments running, dependencies installed, basic project structure complete.

---

## Phase 2: Backend API (Hours 2-6)

### 2.1 Database Models (Sequelize)
- [ ] Create `Patient.js` model
- [ ] Create `Vitals.js` model
- [ ] Create `RiskLog.js` model
- [ ] Set up associations (one-to-many relationships)
- [ ] Test database connection

### 2.2 Core API Routes
- [ ] **POST /api/patients** - Create new patient
- [ ] **GET /api/patients** - List all patients
- [ ] **GET /api/patients/:id** - Get patient details
- [ ] **POST /api/vitals** - Submit new vitals reading
- [ ] **GET /api/vitals/:patientId** - Get vitals history

### 2.3 Risk Analysis Endpoint
- [ ] **POST /api/risk/analyze** - Send vitals to AI agent
- [ ] Integrate AI service call
- [ ] Store risk assessment in RiskLogs table
- [ ] Return risk analysis to frontend

### 2.4 Blockchain Integration Service
- [ ] Create `blockchainService.js`
- [ ] Implement hash generation function (SHA-256)
- [ ] Implement contract interaction function
- [ ] **POST /api/blockchain/store** - Store hash on-chain

### 2.5 Testing
- [ ] Test all endpoints with Postman
- [ ] Verify database writes
- [ ] Check error handling

**Deliverable**: Fully functional REST API with database persistence.

---

## Phase 3: AI Risk Detection Agent (Hours 6-9)

### 3.1 LangChain Agent Setup
- [ ] Create healthcare risk assessment prompt (use opusprompt.md)
- [ ] Configure OpenAI LLM connection
- [ ] Set up LangChain agent with custom prompt

### 3.2 Risk Analysis Chain
- [ ] Create input parser for vitals JSON
- [ ] Implement risk calculation logic
- [ ] Create output formatter (structured JSON)
- [ ] Add error handling for API failures

### 3.3 Integration with Backend
- [ ] Create `aiService.js` in backend
- [ ] Import AI agent module
- [ ] Create `analyzeRisk(vitalsData)` function
- [ ] Handle async responses

### 3.4 Testing
- [ ] Test with various vital combinations:
  - Normal vitals (LOW risk)
  - Elevated heart rate (MEDIUM risk)
  - Low SpO2 (HIGH risk)
  - Multiple critical values (CRITICAL risk)
- [ ] Verify JSON output format
- [ ] Test response time (<2 seconds target)

**Deliverable**: Working AI agent that returns structured risk assessments.

---

## Phase 4: Frontend Dashboard (Hours 9-14)

### 4.1 Core Components
- [ ] **Header.jsx** - App title, MetaMask connection status
- [ ] **Dashboard.jsx** - Main layout container
- [ ] **PatientCard.jsx** - Display patient info
- [ ] **VitalsInput.jsx** - Form to input vitals
- [ ] **RiskAlert.jsx** - Visual risk level indicator
- [ ] **BlockchainStatus.jsx** - Show transaction status

### 4.2 API Integration
- [ ] Create `services/api.js` with Axios instance
- [ ] Implement API calls:
  - `fetchPatients()`
  - `submitVitals(data)`
  - `analyzeRisk(data)`
  - `storeOnBlockchain(hash)`

### 4.3 UI/UX Design (Tailwind)
- [ ] Create color scheme:
  - GREEN for LOW risk
  - YELLOW for MEDIUM risk
  - ORANGE for HIGH risk
  - RED for CRITICAL risk
- [ ] Design responsive layout
- [ ] Add loading states
- [ ] Add success/error notifications

### 4.4 Patient Vitals Input Flow
- [ ] Form with fields: heart_rate, spo2, temperature
- [ ] Input validation (numeric ranges)
- [ ] Submit button triggers:
  1. POST to `/api/vitals`
  2. POST to `/api/risk/analyze`
  3. Display risk result
  4. Option to store on blockchain

### 4.5 Real-time Risk Display
- [ ] Show risk level with color coding
- [ ] Display reason and recommended action
- [ ] Show timestamp of analysis
- [ ] List all flagged vitals

**Deliverable**: Interactive React dashboard with vitals input and risk display.

---

## Phase 5: Alert System (Hours 14-16)

### 5.1 Email Alert Service
- [ ] Create `alertService.js` in backend
- [ ] Configure Nodemailer with SMTP
- [ ] Create email template for alerts:
  - Subject: "[RISK LEVEL] Patient Alert - [Patient Name]"
  - Body: Include vitals, risk level, reason, action

### 5.2 Alert Trigger Logic
- [ ] Modify risk analysis endpoint
- [ ] If risk_level >= MEDIUM, trigger email
- [ ] Send to configured alert email address
- [ ] Log alert in database (optional)

### 5.3 Testing
- [ ] Use Mailtrap or Gmail for testing
- [ ] Trigger MEDIUM risk scenario
- [ ] Trigger CRITICAL risk scenario
- [ ] Verify email delivery and formatting

**Deliverable**: Automated email alerts for elevated risk levels.

---

## Phase 6: Blockchain Integration (Hours 16-20)

### 6.1 Smart Contract Development
- [ ] Create `MedicalRecordHash.sol`:
  ```solidity
  contract MedicalRecordHash {
      struct Record {
          bytes32 recordHash;
          uint256 timestamp;
          address submitter;
      }
      
      mapping(string => Record[]) public patientRecords;
      
      event RecordStored(string patientId, bytes32 recordHash, uint256 timestamp);
      
      function storeRecord(string memory patientId, bytes32 recordHash) public {
          // Implementation
      }
      
      function getRecords(string memory patientId) public view returns (Record[] memory) {
          // Implementation
      }
  }
  ```

### 6.2 Deployment
- [ ] Write deployment script (`scripts/deploy.js`)
- [ ] Deploy to Polygon Amoy testnet
- [ ] Verify contract on PolygonScan
- [ ] Save contract address to `.env`

### 6.3 Backend Blockchain Service
- [ ] Create `blockchainService.js`
- [ ] Load contract ABI and address
- [ ] Implement `storeHash(patientId, recordHash)` function
- [ ] Return transaction hash to frontend

### 6.4 Frontend Blockchain Integration
- [ ] Create `services/blockchain.js`
- [ ] Connect MetaMask using ethers.js
- [ ] Create "Store on Blockchain" button
- [ ] Show transaction status (pending, confirmed)
- [ ] Display transaction hash with PolygonScan link

### 6.5 Hash Generation
- [ ] Create `hashService.js` in backend
- [ ] Generate SHA-256 hash from vitals JSON
- [ ] Store hash on blockchain
- [ ] Save hash and tx hash in database

**Deliverable**: Working blockchain integration storing medical record hashes on Polygon Amoy.

---

## Phase 7: Final Demo Flow & Polish (Hours 20-24)

### 7.1 End-to-End Testing
- [ ] Create demo patient in database
- [ ] Test complete flow:
  1. Input vitals
  2. Get AI risk analysis
  3. Receive email alert (if risk elevated)
  4. Store hash on blockchain
  5. Verify on PolygonScan

### 7.2 Demo Data Preparation
- [ ] Create 3-5 sample patients
- [ ] Prepare pre-defined vital scenarios:
  - Scenario 1: Normal vitals (no alert)
  - Scenario 2: Medium risk (email alert)
  - Scenario 3: Critical risk (urgent email + blockchain)

### 7.3 UI Polish
- [ ] Add loading spinners
- [ ] Improve error messages
- [ ] Add success confirmations
- [ ] Ensure responsive design works on mobile

### 7.4 Documentation
- [ ] Update README.md with:
  - Project overview
  - Architecture diagram
  - Setup instructions
  - Environment variables
  - Demo walkthrough
- [ ] Create API documentation
- [ ] Add code comments

### 7.5 Presentation Preparation
- [ ] Create demo script
- [ ] Prepare talking points:
  - Problem statement
  - Solution architecture
  - Tech stack highlights
  - Live demo flow
  - Future roadmap
- [ ] Record backup demo video (optional)

### 7.6 Final Checks
- [ ] Test on fresh machine/browser
- [ ] Verify all environment variables
- [ ] Check MetaMask connection
- [ ] Confirm email alerts working
- [ ] Verify blockchain transactions

**Deliverable**: Production-ready demo with documentation and presentation materials.

---

## Demo Scenario

### Scenario Setup
**Patient**: John Doe (ID: P-1001)  
**Age**: 45  
**Medical History**: Hypertension

### Step 1: Normal Vitals Submission
**Input**:
```json
{
  "patient_id": "P-1001",
  "heart_rate": 75,
  "spo2": 98,
  "temperature": 36.8
}
```

**Expected Output**:
- Risk Level: LOW
- Reason: "All vitals within normal range"
- Action: "Continue routine monitoring"
- Alert: None sent
- UI: Green risk indicator

### Step 2: Medium Risk Detection
**Input**:
```json
{
  "patient_id": "P-1001",
  "heart_rate": 108,
  "spo2": 91,
  "temperature": 38.2
}
```

**Expected Output**:
- Risk Level: MEDIUM
- Reason: "Elevated heart rate and borderline low oxygen saturation with fever"
- Action: "Increase monitoring frequency, alert nurse on duty"
- Alert: Email sent to healthcare provider
- UI: Yellow/orange risk indicator

### Step 3: Critical Emergency
**Input**:
```json
{
  "patient_id": "P-1001",
  "heart_rate": 145,
  "spo2": 82,
  "temperature": 39.5
}
```

**Expected Output**:
- Risk Level: CRITICAL
- Reason: "Severe oxygen desaturation (SpO2: 82%) with extreme tachycardia (HR: 145) and high fever"
- Action: "IMMEDIATE emergency response required. Prepare oxygen support, alert emergency team."
- Alert: Urgent email sent immediately
- Blockchain: Medical record hash stored on Polygon Amoy
- UI: Red flashing critical alert

### Step 4: Blockchain Verification
**Demonstrate**:
1. Click "Store on Blockchain" button
2. MetaMask popup for transaction confirmation
3. Transaction submitted to Polygon Amoy
4. Show transaction hash
5. Open PolygonScan link
6. Verify hash stored on-chain
7. Show timestamp and block number

### Key Demo Highlights
- **Real-time AI Analysis**: Show LLM processing vitals in <2 seconds
- **Automated Alerts**: Display email notification in real-time
- **Blockchain Immutability**: Prove medical record hash cannot be tampered
- **Full Stack Integration**: Database → AI → Blockchain → Email in one flow
- **Production-Ready UI**: Clean, professional dashboard with clear risk indicators

### Presentation Flow (5 minutes)
1. **Problem** (30s): Healthcare monitoring delays cause preventable deaths
2. **Solution** (30s): AI-powered real-time risk detection with blockchain audit trail
3. **Tech Stack** (1min): Highlight AI (LangChain), Blockchain (Polygon), Full-stack (MERN)
4. **Live Demo** (2min): Walk through critical risk scenario end-to-end
5. **Impact** (1min): Potential to save lives, reduce costs, improve patient outcomes

### Backup Plan
- Pre-record video demo in case of live technical issues
- Have screenshots of key features ready
- Prepare localhost fallback if deployment fails

---

## Success Criteria
- [ ] AI agent correctly classifies risk levels
- [ ] Email alerts trigger for MEDIUM+ risk
- [ ] Blockchain stores and verifies hashes
- [ ] Frontend displays all data clearly
- [ ] Complete demo runs smoothly in <3 minutes
- [ ] All code documented and committed to GitHub

## Post-Hackathon Roadmap
- Add user authentication (JWT)
- Implement real-time monitoring with WebSockets
- Create mobile app (React Native)
- Integrate wearable device APIs
- Add more vitals (blood pressure, glucose, ECG)
- Deploy to production (AWS/GCP)
- Implement HIPAA compliance measures
- Create analytics dashboard for trends
