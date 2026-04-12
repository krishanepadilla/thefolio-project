// backend/routes/post.routes.js
const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/posts — Public: all published posts (newest first)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id — Public: single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name profilePic');
    if (!post || post.status === 'removed') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts — Member or Admin: create new post
router.post('/', protect, memberOrAdmin, async (req, res) => {
  try {
    const { title, body, image } = req.body;
    const post = await Post.create({
      title,
      body,
      image: image || '',
      author: req.user._id,
    });
    await post.populate('author', 'name profilePic');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id — Edit: only post owner OR admin
// ✅ FIX: Removed memberOrAdmin middleware from this route.
// memberOrAdmin blocks users whose role isn't 'member' or 'admin' at the
// middleware level — before the handler can even check isOwner. By moving
// all authorization into the handler itself we avoid silent 403s and give
// a clear error message instead.
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status === 'removed') {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // ✅ FIX: Use !== undefined so falsy-but-valid values like "" are saved.
    // The old `if (req.body.title)` check would skip saving an empty string.
    if (req.body.title !== undefined) post.title = req.body.title;
    if (req.body.body  !== undefined) post.body  = req.body.body;
    if (req.body.image !== undefined) post.image = req.body.image;

    await post.save();

    // ✅ FIX: Populate author so frontend receives full post object
    await post.populate('author', 'name profilePic');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id — Delete: only post owner OR admin
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;