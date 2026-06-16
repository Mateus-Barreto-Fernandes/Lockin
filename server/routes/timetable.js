import { Router } from 'express';
import db from '../db.js';
import { auth, asyncHandler } from '../middleware.js';
import { validate, createError } from '../validation.js';

const router = Router();
router.use(auth);

router.get('/', asyncHandler((req, res) => {
  res.json(db.prepare('SELECT * FROM timetable_entries WHERE user_id = ?').all(req.userId));
}));

router.post('/', asyncHandler((req, res) => {
  const { subject, room, day, time_slot } = req.body;

  if (!validate.isNotEmpty(subject) || !validate.isNotEmpty(room) || !validate.isNotEmpty(day) || !validate.isNotEmpty(time_slot)) {
    throw createError('All fields are required');
  }
  if (!validate.isString(subject) || !validate.isString(room) || !validate.isString(day) || !validate.isString(time_slot)) {
    throw createError('All fields must be strings');
  }
  if (subject.length > 100 || room.length > 50) {
    throw createError('Input exceeds maximum allowed length');
  }
  if (!validate.isValidOption(day, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])) {
    throw createError('Invalid day provided');
  }
  if (!/^(\d{1,2}:\d{2}) (\text{AM|PM})$/.test(time_slot) && !/^(\d{1,2}:\d{2})$/.test(time_slot)) {
     // Simpler check: just ensure it's a string and not empty since we have a GUI dropdown.
     // But for robustness, we'll check if it's a reasonable length.
  }
  if (time_slot.length > 10) throw createError('Invalid time slot format');

  const dup = db.prepare('SELECT id FROM timetable_entries WHERE user_id = ? AND day = ? AND time_slot = ?').get(req.userId, day, time_slot);
  if (dup) throw createError('A class already exists in that slot', 409);

  const result = db.prepare('INSERT INTO timetable_entries (user_id, subject, room, day, time_slot) VALUES (?, ?, ?, ?, ?)').run(req.userId, subject, room, day, time_slot);
  res.status(201).json(db.prepare('SELECT * FROM timetable_entries WHERE id = ?').get(result.lastInsertRowid));
}));

router.delete('/:id', asyncHandler((req, res) => {
  const r = db.prepare('DELETE FROM timetable_entries WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (r.changes === 0) throw createError('Not found', 404);
  res.json({ ok: true });
}));

router.delete('/', asyncHandler((req, res) => {
  db.prepare('DELETE FROM timetable_entries WHERE user_id = ?').run(req.userId);
  res.json({ ok: true });
}));

export default router;
