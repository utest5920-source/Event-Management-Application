import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../uploads'));
	},
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		cb(null, unique + '-' + safeName);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
		cb(null, true);
	}
});

router.use(authRequired, requireRole('ADMIN'));

router.post('/events', (req, res) => {
	const { category, title, budgetMin, budgetMax, companyName, contactNumber, location, description } = req.body;
	if (!category || !title) return res.status(400).json({ error: 'category and title required' });
	const result = db
		.prepare(
			'INSERT INTO events (category, title, budget_min, budget_max, company_name, contact_number, location, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
		)
		.run(
			category,
			title,
			budgetMin || null,
			budgetMax || null,
			companyName || '',
			contactNumber || '',
			location || '',
			description || '',
			req.user.id
		);
	const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
	return res.status(201).json({ event });
});

router.put('/events/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
	if (!existing) return res.status(404).json({ error: 'Event not found' });
	const { category, title, budgetMin, budgetMax, companyName, contactNumber, location, description } = req.body;
	db.prepare(
		'UPDATE events SET category = ?, title = ?, budget_min = ?, budget_max = ?, company_name = ?, contact_number = ?, location = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
	)
		.run(
			category || existing.category,
			title || existing.title,
			budgetMin ?? existing.budget_min,
			budgetMax ?? existing.budget_max,
			companyName ?? existing.company_name,
			contactNumber ?? existing.contact_number,
			location ?? existing.location,
			description ?? existing.description,
			id
		);
	const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
	return res.json({ event });
});

router.delete('/events/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
	if (!existing) return res.status(404).json({ error: 'Event not found' });
	db.prepare('DELETE FROM events WHERE id = ?').run(id);
	return res.json({ success: true });
});

router.post('/events/:id/photos', upload.array('photos', 10), (req, res) => {
	const id = parseInt(req.params.id, 10);
	const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
	if (!existing) return res.status(404).json({ error: 'Event not found' });
	const files = req.files || [];
	for (const file of files) {
		db.prepare('INSERT INTO event_photos (event_id, file_path) VALUES (?, ?)')
			.run(id, '/uploads/' + path.basename(file.path));
	}
	const photos = db.prepare('SELECT id, file_path FROM event_photos WHERE event_id = ?').all(id);
	return res.json({ photos });
});

router.get('/bookings', (req, res) => {
	const rows = db
		.prepare(
			`SELECT b.id, b.status, b.notes, b.created_at, u.mobile as user_mobile, e.title as event_title
			 FROM bookings b
			 JOIN users u ON u.id = b.user_id
			 JOIN events e ON e.id = b.event_id
			 ORDER BY b.id DESC`
		)
		.all();
	return res.json({ bookings: rows });
});

router.put('/bookings/:id/status', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const { status } = req.body;
	if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
		return res.status(400).json({ error: 'Invalid status' });
	}
	const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
	if (!existing) return res.status(404).json({ error: 'Booking not found' });
	db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
		.run(status, id);
	const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
	return res.json({ booking });
});

export default router;