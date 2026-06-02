const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const SALT_ROUNDS = process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : 12;

function sanitizeUser(userRow) {
  if (!userRow) return null;
  const { password_hash, ...rest } = userRow;
  return rest;
}

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, role } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const allowedRoles = ['admin','owner','barber'];
    if (!allowedRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const existing = await userService.getByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await userService.create({ full_name, email, password_hash, phone, role });

    const token = jwt.sign({ userId: created.id, role: created.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: sanitizeUser(created), token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await userService.getByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    // `requireAuth` middleware populates `req.user` with { userId, role }
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await userService.getById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};
