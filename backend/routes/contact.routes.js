// backend/routes/contact.routes.js
const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const Contact   = require('../models/Contact');

// POST /api/contact
router.post('/', async (req, res) => {

  // ── 1. Check DB is actually connected before doing anything ──
  if (mongoose.connection.readyState !== 1) {
    console.error('Contact route: MongoDB is NOT connected. readyState =', mongoose.connection.readyState);
    return res.status(500).json({ message: 'Database not connected. Check your MONGO_URI in .env' });
  }

  try {
    const { name, email, message } = req.body;

    console.log('Contact form received:', { name, email, message }); // visible in terminal

    // ── 2. Validate ──────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    // ── 3. Save ───────────────────────────────────────────────
    const newContact = await Contact.create({
      name:    name.trim(),
      email:   email.trim(),
      message: message.trim(),
    });

    console.log('Contact saved successfully:', newContact._id);
    res.status(201).json({ message: 'Message received!' });

  } catch (error) {
    // Prints the EXACT Mongoose/MongoDB error in your terminal
    console.error('Contact save error name    :', error.name);
    console.error('Contact save error message :', error.message);
    console.error('Contact save error full    :', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;