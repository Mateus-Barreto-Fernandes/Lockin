import { Router } from 'express';
import db from '../db.js';
import { auth, asyncHandler } from '../middleware.js';
import { validate, createError } from '../validation.js';

const router = Router();
router.use(auth);

router.get('/', asyncHandler((req, res) => {
  const rows = db.prepare('SELECT * FROM assignments WHERE user_id = ? ORDER BY due_date ASC').all(req.userId);
  res.json(rows);
}));

router.post('/', asyncHandler((req, res) => {
  const { name, subject, due_date } = req.body;

  if (!validate.isNotEmpty(name) || !validate.isNotEmpty(subject) || !validate.isNotEmpty(due_date)) {
    throw createError('Name, subject and due date are required');
  }
  if (!validate.isString(name) || !validate.isString(subject)) {
    throw createError('Name and subject must be strings');
  }
  if (!validate.isValidDate(due_date)) {
    throw createError('Due date must be a valid date in YYYY-MM-DD format');
  }
  if (name.length > 255 || subject.length > 100) {
    throw createError('Input exceeds maximum allowed length');
  }

  const result = db.prepare('INSERT INTO assignments (user_id, name, subject, due_date, completed) VALUES (?, ?, ?, ?, 0)').run(req.userId, name, subject, due_date);
  res.status(201).json(db.prepare('SELECT * FROM assignments WHERE id = ?').get(result.lastInsertRowid));
}));

router.patch('/:id', asyncHandler((req, res) => {
  const row = db.prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!row) throw createError('Assignment not found', 404);

  const { completed, name, subject, due_date } = req.body;

  if (name !== undefined && (!validate.isString(name) || name.length > 255)) throw createError('Invalid name');
  if (subject !== undefined && (!validate.isString(subject) || subject.length > 100)) throw createError('Invalid subject');
  if (due_date !== undefined && !validate.isValidDate(due_date)) throw createError('Invalid date format');
  if (completed !== undefined && ![0, 1].includes(Number(completed))) throw createError('Completed must be a boolean or 0/1');

  db.prepare('UPDATE assignments SET name=?, subject=?, due_date=?, completed=? WHERE id=? AND user_id=?').run(
    name ?? row.name, subject ?? row.subject, due_date ?? row.due_date,
    completed !== undefined ? (completed ? 1 : 0) : row.completed,
    req.params.id, req.userId
  );
  res.json(db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id));
}));

router.delete('/:id', asyncHandler((req, res) => {
  const r = db.prepare('DELETE FROM assignments WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (r.changes === 0) throw createError('Not found', 404);
  res.json({ ok: true });
}));

export default router;
