const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const env = require('./config/env');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const patientRoutes = require('./routes/patients');
const vitalsRoutes = require('./routes/vitals');
const riskRoutes = require('./routes/risk');
const blockchainRoutes = require('./routes/blockchain');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');
const chatRoutes = require('./routes/chat');
const emergencyRoutes = require('./routes/emergency');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const assignmentRoutes = require('./routes/assignments');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

/* ---------------- Middleware ---------------- */

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(helmet({ contentSecurityPolicy: false }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

/* ---------------- Health Check ---------------- */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- Routes ---------------- */

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/appointments', appointmentRoutes);

/* ---------------- Error Handler ---------------- */

app.use(errorHandler);

/* ---------------- Socket.IO ---------------- */

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

/* ---------------- Start Server ---------------- */

async function startServer() {
  try {

    await sequelize.authenticate();
    console.log('✅ Database connection established');

    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');

    // IMPORTANT: Render requires process.env.PORT
    const PORT = process.env.PORT || env.PORT || 5000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🏥 MedChain AI Backend running on port ${PORT}`);
      console.log(`Health: /api/health`);
      console.log(`Auth: /api/auth`);
      console.log(`Socket.IO: Enabled ✅\n`);
    });

  } catch (error) {

    console.error('❌ Unable to start server:', error);
    process.exit(1);

  }
}

startServer();

module.exports = app;