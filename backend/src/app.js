const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { uploadDir } = require('./middlewares/uploadMiddleware');
const { evidenceDir } = require('./middlewares/evidenceUploadMiddleware');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const environmentalRoutes = require('./routes/environmentalRoutes');
const socialRoutes = require('./routes/socialRoutes');
const governanceRoutes = require('./routes/governanceRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const trainingRoutes = require('./routes/trainingRoutes');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      env.nodeEnv === 'development' ||
      origin === env.clientUrl ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Uploaded files are served statically; the DB stores only relative paths.
app.use('/uploads/profile-images', express.static(uploadDir));
app.use('/uploads/evidence', express.static(evidenceDir));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'EcoSphere API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/social/training', trainingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
