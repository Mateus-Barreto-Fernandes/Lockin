import { Router } from 'express';
import db from '../db.js';
import { auth, asyncHandler } from '../middleware.js';

const router = Router();
router.use(auth);

router.get('/', asyncHandler((req, res) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayName = dayNames[today.getDay()];
  const todayStr = today.toISOString().split('T')[0];
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const todayClasses = db.prepare('SELECT * FROM timetable_entries WHERE user_id = ? AND day = ? ORDER BY time_slot ASC').all(req.userId, todayName);
  const upcomingDeadlines = db.prepare('SELECT * FROM assignments WHERE user_id = ? AND completed = 0 ORDER BY due_date ASC LIMIT 5').all(req.userId);
  const dueThisWeek = db.prepare('SELECT COUNT(*) as c FROM assignments WHERE user_id = ? AND completed = 0 AND due_date >= ? AND due_date <= ?').get(req.userId, todayStr, weekEndStr).c;
  const completedCount = db.prepare('SELECT COUNT(*) as c FROM assignments WHERE user_id = ? AND completed = 1').get(req.userId).c;
  const totalCount = db.prepare('SELECT COUNT(*) as c FROM assignments WHERE user_id = ?').get(req.userId).c;
  const notesCount = db.prepare('SELECT COUNT(*) as c FROM notes WHERE user_id = ?').get(req.userId).c;

  res.json({ todayClasses, upcomingDeadlines, metrics: { dueThisWeek, completed: completedCount, total: totalCount, notesSaved: notesCount } });
}));

export default router;
