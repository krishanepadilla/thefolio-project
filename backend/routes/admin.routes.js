const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Contact = require('../models/Contact'); // 1. ADD THIS IMPORT
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

const router = express.Router();

// All routes below require: (1) valid token AND (2) admin role
router.use(protect, adminOnly);

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/users — List all non-admin members
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/status — Toggle member active/inactive
router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({ message: `User is now ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT INBOX (The new part)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/contacts — List all contact-form submissions
router.get('/contacts', async (req, res) => { 
  // 2. REMOVED 'protect' and 'admin' here because router.use(protect, adminOnly) 
  // already covers this for the whole file. 
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contact messages.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST MODERATION
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/posts — List ALL posts including removed ones
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/posts/:id/remove — Mark post as removed
router.put('/posts/:id/remove', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = 'removed';
    await post.save();

    res.json({ message: 'Post has been removed', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;