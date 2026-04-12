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

// ✅ FIX: Only declare express.json() ONCE with the 20mb limit.
// Previously there were two calls — the default 100kb one ran first
// and rejected base64 image payloads before the 20mb one could apply.
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static files from the 'uploads' folder
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

// ── 3. Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── 4. Start Server ──────────────────────────────────────────────────────────
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