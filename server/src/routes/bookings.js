import express from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.use(authRequired);

router.get('/', (req, res) => {
	const rows = db
		.prepare(
			`SELECT b.id, b.status, b.notes, b.created_at, e.title as event_title
			 FROM bookings b JOIN events e ON e.id = b.event_id
			 WHERE b.user_id = ? ORDER BY b.id DESC`
		)
		.all(req.user.id);
	return res.json({ bookings: rows });
});

export default router;