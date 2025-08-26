import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { generateNumericOtp, hashOtp, nowSeconds } from '../utils/otp.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

function issueToken(user) {
	const payload = { id: user.id, mobile: user.mobile, role: user.role };
	const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '2h' });
	return token;
}

router.post('/request-otp', (req, res) => {
	const { mobile } = req.body;
	if (!mobile) return res.status(400).json({ error: 'Mobile is required' });

	const otp = generateNumericOtp(6);
	const expiresAt = nowSeconds() + 5 * 60; // 5 minutes
	const codeHash = hashOtp(otp);

	// Rate limit: remove old and keep the last 5 requests per number
	db.prepare('DELETE FROM otp_codes WHERE expires_at < ?').run(nowSeconds());
	db.prepare('INSERT INTO otp_codes (mobile, code_hash, expires_at) VALUES (?, ?, ?)')
		.run(mobile, codeHash, expiresAt);

	// For demo: return OTP in response
	return res.json({ success: true, otp, expiresAt });
});

router.post('/verify-otp', (req, res) => {
	const { mobile, otp } = req.body;
	if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });

	const row = db
		.prepare('SELECT * FROM otp_codes WHERE mobile = ? ORDER BY id DESC LIMIT 1')
		.get(mobile);
	if (!row) return res.status(400).json({ error: 'OTP not found. Request again.' });
	if (row.expires_at < nowSeconds()) return res.status(400).json({ error: 'OTP expired' });
	if (row.attempt_count >= 5) return res.status(429).json({ error: 'Too many attempts' });

	const codeHash = hashOtp(otp);
	if (codeHash !== row.code_hash) {
		db.prepare('UPDATE otp_codes SET attempt_count = attempt_count + 1 WHERE id = ?').run(row.id);
		return res.status(400).json({ error: 'Invalid OTP' });
	}

	// Upsert user
	let user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
	if (!user) {
		db.prepare('INSERT INTO users (mobile, role) VALUES (?, ?)').run(mobile, 'USER');
		user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
		// create empty profile
		db.prepare('INSERT INTO profiles (user_id, name, gender, location) VALUES (?, ?, ?, ?)')
			.run(user.id, '', '', '');
	}

	// Cleanup used OTP
	db.prepare('DELETE FROM otp_codes WHERE id = ?').run(row.id);

	const token = issueToken(user);
	return res.json({ token, user: { id: user.id, mobile: user.mobile, role: user.role } });
});

router.get('/me', authRequired, (req, res) => {
	const user = db.prepare('SELECT id, mobile, role FROM users WHERE id = ?').get(req.user.id);
	const profile = db
		.prepare('SELECT name, gender, location FROM profiles WHERE user_id = ?')
		.get(req.user.id);
	return res.json({ user, profile });
});

router.put('/me/profile', authRequired, (req, res) => {
	const { name, gender, location } = req.body;
	db.prepare('UPDATE profiles SET name = ?, gender = ?, location = ? WHERE user_id = ?')
		.run(name || '', gender || '', location || '', req.user.id);
	const profile = db
		.prepare('SELECT name, gender, location FROM profiles WHERE user_id = ?')
		.get(req.user.id);
	return res.json({ profile });
});

export default router;