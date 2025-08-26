const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendOTP, generateOTP } = require('../utils/otp');

const router = express.Router();

// Send OTP
router.post('/send-otp', [
  body('mobile_number').isMobilePhone('any').withMessage('Valid mobile number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile_number } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await db.execute(
      'INSERT INTO otp_verification (mobile_number, otp_code, expires_at) VALUES (?, ?, ?)',
      [mobile_number, otp, expiresAt]
    );

    // Send OTP (implement your SMS service here)
    await sendOTP(mobile_number, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and Login/Register
router.post('/verify-otp', [
  body('mobile_number').isMobilePhone('any'),
  body('otp_code').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile_number, otp_code } = req.body;

    // Verify OTP
    const [otpRecords] = await db.execute(
      'SELECT * FROM otp_verification WHERE mobile_number = ? AND otp_code = ? AND expires_at > NOW() AND is_verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [mobile_number, otp_code]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await db.execute(
      'UPDATE otp_verification SET is_verified = TRUE WHERE id = ?',
      [otpRecords[0].id]
    );

    // Check if user exists
    let [users] = await db.execute('SELECT * FROM users WHERE mobile_number = ?', [mobile_number]);
    
    let user;
    if (users.length === 0) {
      // Register new user
      const [result] = await db.execute(
        'INSERT INTO users (mobile_number, is_verified) VALUES (?, TRUE)',
        [mobile_number]
      );
      user = { user_id: result.insertId, mobile_number, role: 'User', is_verified: true };
    } else {
      // Update existing user
      await db.execute('UPDATE users SET is_verified = TRUE WHERE mobile_number = ?', [mobile_number]);
      user = users[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        mobile_number: user.mobile_number,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT user_id, mobile_number, name, gender, location, role FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().isLength({ min: 2 }),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('location').optional().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, gender, location } = req.body;
    
    await db.execute(
      'UPDATE users SET name = ?, gender = ?, location = ? WHERE user_id = ?',
      [name, gender, location, req.user.user_id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
