const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(expected) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== expected) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

const requireOwner = requireRole('owner');
const requireBarber = requireRole('barber');
const requireAdmin = requireRole('admin');

module.exports = { requireAuth, requireOwner, requireBarber, requireAdmin };
