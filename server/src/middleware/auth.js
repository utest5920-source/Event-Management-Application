import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.user = payload;
		return next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

export function requireRole(role) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
		if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
		return next();
	};
}