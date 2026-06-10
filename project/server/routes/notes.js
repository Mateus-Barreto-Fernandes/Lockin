import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { auth, asyncHandler } from '../middleware.js';
import { validate, createError } from '../validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')) });

const router = Router();
router.use(auth);

router.get('/', asyncHandler((req, res) => {
  const { subject } = req.query;
  const rows = subject
    ? db.prepare('SELECT * FROM notes WHERE user_id = ? AND subject = ? ORDER BY created_at DESC').all(req.userId, subject)
    : db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(rows);
}));

router.post('/', upload.single('image'), asyncHandler((req, res) => {
  const { subject, title, content } = req.body;

  if (!validate.isNotEmpty(subject) || !validate.isNotEmpty(title)) {
    throw createError('Subject and title are required');
  }
  if (!validate.isString(subject) || !validate.isString(title)) {
    throw createError('Subject and title must be strings');
  }
  if (subject.length > 100 || title.length > 255) {
    throw createError('Input exceeds maximum allowed length');
  }

  const image_path = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare('INSERT INTO notes (user_id, subject, title, content, image_path) VALUES (?, ?, ?, ?, ?)').run(req.userId, subject, title, content || '', image_path);
  res.status(201).json(db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid));
}));

router.delete('/:id', asyncHandler((req, res) => {
  const r = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (r.changes === 0) throw createError('Not found', 404);
  res.json({ ok: true });
}));

export default router;
