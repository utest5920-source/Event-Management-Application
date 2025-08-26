const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all events (with filters)
router.get('/', async (req, res) => {
  try {
    const { event_type, location, min_budget, max_budget } = req.query;
    
    let query = `
      SELECT e.*, 
      (SELECT photo_url FROM event_photos ep WHERE ep.event_id = e.event_id LIMIT 1) as featured_image
      FROM events e 
      WHERE 1=1
    `;
    const params = [];

    if (event_type) {
      query += ' AND e.event_type = ?';
      params.push(event_type);
    }
    if (location) {
      query += ' AND e.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (min_budget) {
      query += ' AND e.budget_min >= ?';
      params.push(min_budget);
    }
    if (max_budget) {
      query += ' AND e.budget_max <= ?';
      params.push(max_budget);
    }

    query += ' ORDER BY e.created_at DESC';

    const [events] = await db.execute(query, params);
    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Get event details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [events] = await db.execute('SELECT * FROM events WHERE event_id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const [photos] = await db.execute('SELECT * FROM event_photos WHERE event_id = ?', [id]);
    const [packages] = await db.execute('SELECT * FROM packages WHERE event_id = ?', [id]);

    const event = events[0];
    event.photos = photos;
    event.packages = packages;

    res.json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch event details' });
  }
});

// Create new event (Admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('event_type').isIn(['Wedding', 'Birthday Party', 'Baby Shower']),
  body('company_name').notEmpty(),
  body('contact_number').isMobilePhone('any'),
  body('location').notEmpty(),
  body('budget_min').isDecimal(),
  body('budget_max').isDecimal()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, event_type, company_name, contact_number, location,
      budget_min, budget_max, description
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO events (title, event_type, company_name, contact_number, location, 
       budget_min, budget_max, description, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, event_type, company_name, contact_number, location, 
       budget_min, budget_max, description, req.user.user_id]
    );

    res.status(201).json({ 
      message: 'Event created successfully', 
      event_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, event_type, company_name, contact_number, location,
      budget_min, budget_max, description
    } = req.body;

    await db.execute(
      `UPDATE events SET title = ?, event_type = ?, company_name = ?, contact_number = ?, 
       location = ?, budget_min = ?, budget_max = ?, description = ? WHERE event_id = ?`,
      [title, event_type, company_name, contact_number, location, 
       budget_min, budget_max, description, id]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM events WHERE event_id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// Upload event photos (Admin only)
router.post('/:id/photos', authenticateToken, requireAdmin, upload.array('photos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    for (const file of files) {
      await db.execute(
        'INSERT INTO event_photos (event_id, photo_url, alt_text) VALUES (?, ?, ?)',
        [id, `/uploads/events/${file.filename}`, file.originalname]
      );
    }

    res.json({ message: 'Photos uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload photos' });
  }
});

module.exports = router;
