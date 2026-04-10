require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Suggested for security
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

// 1. Initialize Database
connectDB();

// 2. Middleware Stack
app.use(helmet()); // Sets various security headers

const allowedOrigins = [
  'http://localhost:3000',
  'https://thefolio-project-sandy.vercel.app',
  'https://thefolio-project-sandy.vercel.app/' // Added the slash version
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // CORS must come BEFORE routes
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// 4. Global Error Handler (Keep this at the bottom of the stack)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 5. Server Export/Listen
const PORT = process.env.PORT || 5000;

// Important for Vercel: Export the app
module.exports = app; 

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}