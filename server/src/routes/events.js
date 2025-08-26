import express from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
	const { category, q, page = 1, pageSize = 20 } = req.query;
	const limit = Math.min(parseInt(pageSize, 10) || 20, 50);
	const offset = ((parseInt(page, 10) || 1) - 1) * limit;

	let where = 'WHERE 1=1';
	const params = [];
	if (category) {
		where += ' AND category = ?';
		params.push(category);
	}
	if (q) {
		where += ' AND (title LIKE ? OR company_name LIKE ? OR location LIKE ?)';
		params.push(`%${q}%`, `%${q}%`, `%${q}%`);
	}

	const rows = db
		.prepare(
			`SELECT id, category, title, budget_min, budget_max, company_name, contact_number, location, description FROM events ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
		)
		.all(...params, limit, offset);

	return res.json({ events: rows });
});

router.get('/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const event = db
		.prepare(
			'SELECT id, category, title, budget_min, budget_max, company_name, contact_number, location, description FROM events WHERE id = ?'
		)
		.get(id);
	if (!event) return res.status(404).json({ error: 'Event not found' });
	const photos = db.prepare('SELECT id, file_path FROM event_photos WHERE event_id = ?').all(id);
	return res.json({ event, photos });
});

router.post('/bookings', authRequired, (req, res) => {
	const { eventId, notes } = req.body;
	if (!eventId) return res.status(400).json({ error: 'eventId required' });
	const event = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
	if (!event) return res.status(404).json({ error: 'Event not found' });
	const result = db
		.prepare('INSERT INTO bookings (user_id, event_id, notes, status) VALUES (?, ?, ?, ?)')
		.run(req.user.id, eventId, notes || '', 'PENDING');
	const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
	return res.status(201).json({ booking });
});

export default router;