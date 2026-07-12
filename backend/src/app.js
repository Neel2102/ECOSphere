const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { uploadDir } = require('./middlewares/uploadMiddleware');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

// Profile images are served statically; the DB stores only the relative path.
app.use('/uploads/profile-images', express.static(uploadDir));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
