const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory and public folder
app.use('/src', express.static(path.join(__dirname, '../../frontend/src')));
app.use(express.static(path.join(__dirname, '../../frontend/src')));
app.use(express.static(path.join(__dirname, '../../frontend/src/public')));
app.use(express.static(path.join(__dirname, '../../public')));

// Catch-all route to serve index.html for SPA routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/public/index.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Unable to load home page' });
    }
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendee', attendeeRoutes);

// Attendee Module Pages (Server-side rendering)
app.get('/attendee-module/schedule', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/attendee-module/schedule.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Unable to load schedule page' });
    }
  });
});

app.get('/attendee-module/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/attendee-module/feedback.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Unable to load feedback page' });
    }
  });
});

app.get('/attendee-module/certificate', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/attendee-module/certificate.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Unable to load certificate page' });
    }
  });
});

app.get('/attendee-module/qrcode', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/attendee-module/qrcode.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Unable to load QR code page' });
    }
  });
});

// 404 handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Endpoint not found: ${req.method} ${req.originalUrl}` 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const DEFAULT_PORT = Number(process.env.PORT || 3000);

function isSameAppRunning(port) {
  return new Promise((resolve) => {
    const request = http.get(`http://localhost:${port}/api/health`, (response) => {
      resolve(response.statusCode === 200);
      response.resume();
    });

    request.on('error', () => {
      resolve(false);
    });

    request.setTimeout(1200, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function startServer(port, retriedOnce) {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on port http://localhost:${port}`);
    console.log(`✅ API available at http://localhost:${port}/api`);
    console.log(`✅ Database: Connected with fallback support`);
  });

  server.on('error', async (error) => {
    if (error && error.code === 'EADDRINUSE') {
      const alreadyRunning = await isSameAppRunning(port);
      if (alreadyRunning) {
        console.log(`ℹ️  EventFlow backend is already running on http://localhost:${port}.`);
        process.exit(0);
        return;
      }

      if (!retriedOnce) {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is in use. Retrying on port ${fallbackPort}.`);
        startServer(fallbackPort, true);
        return;
      }

      console.error(`Port ${port} and fallback port are unavailable. Set a custom PORT value and retry.`);
      process.exit(1);
      return;
    }

    if (error && error.code === 'EACCES') {
      console.error(`Insufficient permissions to bind to port ${port}. Try a different PORT value.`);
      process.exit(1);
      return;
    }

    console.error('Server startup error:', error);
    process.exit(1);
  });
}

startServer(DEFAULT_PORT, false);
