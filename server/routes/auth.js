import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, asyncHandler } from '../middleware.js';
import { validate, createError } from '../validation.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!validate.isNotEmpty(username) || !validate.isNotEmpty(password)) {
    throw createError('Username and password are required');
  }
  if (!validate.isString(username) || username.length < 3) {
    throw createError('Username must be a string of at least 3 characters');
  }
  if (!validate.isString(password) || password.length < 6) {
    throw createError('Password must be at least 6 characters');
  }
  if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
    throw createError('Password must contain at least one letter and one number');
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) throw createError('Username already taken', 409);

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (username, hashed_password) VALUES (?, ?)').run(username, hashed);
  const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!validate.isNotEmpty(username) || !validate.isNotEmpty(password)) {
    throw createError('Username and password are required');
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) throw createError('Invalid username or password', 401);

  const valid = await bcrypt.compare(password, user.hashed_password);
  if (!valid) throw createError('Invalid username or password', 401);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
}));

export default router;
