// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./config/db');

const authRoutes    = require('./routes/auth.routes');
const postRoutes    = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes   = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

// ── 1. Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 2. Routes ─────────────────────────────────────────────────────────────────
app.use('/auth',     authRoutes);
app.use('/posts',    postRoutes);
app.use('/comments', commentRoutes);
app.use('/admin',    adminRoutes);
app.use('/contact',  contactRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// ── TEMPORARY: remove this route after seeding ────────────────────────────────
app.get('/seed-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const exists = await User.findOne({ email: 'admin@thefolio.com' });
    if (exists) {
      return res.json({ message: 'Admin already exists', email: 'admin@thefolio.com' });
    }
    await User.create({
      name: 'TheFolioAdmin',
      email: 'admin@thefolio.com',
      password: 'Admin@1234',
      role: 'admin'
    });
    res.json({ message: 'Admin created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ── END TEMPORARY ─────────────────────────────────────────────────────────────

// ── 3. Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ── 4. Connect DB then Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;