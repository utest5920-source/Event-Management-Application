const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get packages for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const [packages] = await db.execute('SELECT * FROM packages WHERE event_id = ?', [eventId]);
    res.json({ packages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch packages' });
  }
});

// Create package (Admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('event_id').isInt(),
  body('package_name').notEmpty(),
  body('price').isDecimal(),
  body('description').optional().isLength({ max: 1000 }),
  body('features').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, package_name, price, description, features } = req.body;

    const [result] = await db.execute(
      'INSERT INTO packages (event_id, package_name, price, description, features) VALUES (?, ?, ?, ?, ?)',
      [event_id, package_name, price, description, JSON.stringify(features || [])]
    );

    res.status(201).json({ 
      message: 'Package created successfully', 
      package_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create package' });
  }
});

// Update package (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { package_name, price, description, features } = req.body;

    await db.execute(
      'UPDATE packages SET package_name = ?, price = ?, description = ?, features = ? WHERE package_id = ?',
      [package_name, price, description, JSON.stringify(features || []), id]
    );

    res.json({ message: 'Package updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update package' });
  }
});

// Delete package (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM packages WHERE package_id = ?', [id]);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete package' });
  }
});

module.exports = router;
