const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { supabaseAdmin } = require('./config/supabase');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);
    if (error) throw error;

    res.json({ success: true, message: 'API is running', database: 'supabase-connected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, database: 'supabase-disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendee', attendeeRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  res.status(500).json({ success: false, message: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
