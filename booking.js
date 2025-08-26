const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create booking request
router.post('/', authenticateToken, [
  body('event_id').isInt(),
  body('package_id').optional().isInt(),
  body('booking_date').isDate(),
  body('message').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, package_id, booking_date, message } = req.body;

    const [result] = await db.execute(
      'INSERT INTO booking_requests (user_id, event_id, package_id, booking_date, message) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, event_id, package_id, booking_date, message]
    );

    res.status(201).json({ 
      message: 'Booking request sent successfully', 
      booking_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create booking request' });
  }
});

// Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT br.*, e.title, e.company_name, e.contact_number, p.package_name, p.price
      FROM booking_requests br
      JOIN events e ON br.event_id = e.event_id
      LEFT JOIN packages p ON br.package_id = p.package_id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
    `, [req.user.user_id]);

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get all bookings (Admin only)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT br.*, u.name as user_name, u.mobile_number, e.title, e.company_name, p.package_name, p.price
      FROM booking_requests br
      JOIN users u ON br.user_id = u.user_id
      JOIN events e ON br.event_id = e.event_id
      LEFT JOIN packages p ON br.package_id = p.package_id
      ORDER BY br.created_at DESC
    `);

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Update booking status (Admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('status').isIn(['Pending', 'Confirmed', 'Rejected', 'Cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    await db.execute('UPDATE booking_requests SET status = ? WHERE booking_id = ?', [status, id]);

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

module.exports = router;
