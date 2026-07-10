const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { initChatSocket } = require('./sockets/chatSocket');

const app = express();
const PORT = process.env.PORT || 5000;
const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...configuredOrigins, ...defaultAllowedOrigins])];

// CORS allows the React app, which runs on another port during development,
// to call this API from the browser. localhost and 127.0.0.1 are different
// browser origins, so the local defaults allow both.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const { hostname, protocol } = new URL(origin);
        if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
          return callback(null, true);
        }
      } catch (error) {
        // Ignore malformed origins and reject them below.
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

// These middleware functions parse JSON and form bodies before routes read req.body.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded CV files are served from /uploads/<filename> so employers can open them.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health checks are useful for confirming both Express and the database are reachable.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.warn('Database connection warning:', error.message);
    // Return 200 anyway so frontend knows API is responsive
    res.json({ status: 'ok', database: 'unavailable', warning: error.message });
  }
});

// Each group of API endpoints is mounted under a clear route prefix.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', messageRoutes);
app.use('/api/admin', adminRoutes);

// Any request that reached this point did not match a defined route.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler. Multer upload errors and normal server errors are returned as JSON.
app.use((error, req, res, next) => {
  if (error.name === 'MulterError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.message && (error.message.includes('Only PDF') || error.message.includes('Only PNG'))) {
    return res.status(400).json({ message: error.message });
  }
  res.status(500).json({ message: 'Server error', error: error.message });
});

// The plain http server wraps the Express app so Socket.io can attach to the
// same port -- the frontend hits REST endpoints and the chat socket at the
// same host:port, just different protocols (http:// vs ws://).
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Controllers reach the socket instance via req.app.get('io') so a message
// sent through the REST fallback still broadcasts to anyone connected live.
app.set('io', io);
initChatSocket(io);

// Start the HTTP server after all middleware and routes have been registered.
server.listen(PORT, () => {
  console.log(`JobConnect API running on port ${PORT}`);
  console.log('Socket.io chat is attached to the same port');
});
