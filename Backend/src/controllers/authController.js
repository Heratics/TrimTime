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

// POST /api/auth/register
// Only allows 'owner' role. Barbers are created by owners via /api/barbers.
// Admins are seeded directly in the database.
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, role } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Only owners may self-register. Barber accounts are created by the admin panel.
    if (role !== 'owner') {
      return res.status(400).json({ error: 'Self-registration is only available for shop owners.' });
    }

    const existing = await userService.getByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await userService.create({ full_name, email, password_hash, phone, role, status: 'pending' });

    res.status(201).json({ pending: true, message: 'Your account is pending admin approval. You will be able to log in once approved.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await userService.getByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending admin approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account registration was rejected.' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Your account has been disabled. Contact support.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await userService.getById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/lookup?email=...
// Allows an owner to look up a user's ID by email so they can link a barber account.
// Only returns id, full_name, role — no sensitive fields.
exports.lookupByEmail = async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email query param required' });

    const user = await userService.getByEmail(email);
    if (!user) return res.status(404).json({ error: 'No user found with that email' });

    res.json({ user: { id: user.id, full_name: user.full_name, role: user.role } });
  } catch (err) {
    next(err);
  }
};
