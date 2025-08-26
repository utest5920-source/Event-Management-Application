const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT user_id, mobile_number, name, gender, location, role, is_verified, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
