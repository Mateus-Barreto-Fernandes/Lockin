import { Router } from 'express';
import db from '../db.js';
import { auth, asyncHandler } from '../middleware.js';

const router = Router();
router.use(auth);

router.post('/chat', asyncHandler(async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });

  const assignments = db.prepare('SELECT * FROM assignments WHERE user_id = ? ORDER BY due_date ASC').all(req.userId);
  const timetable = db.prepare('SELECT * FROM timetable_entries WHERE user_id = ?').all(req.userId);
  const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId);
  const today = new Date().toISOString().split('T')[0];

  const aCtx = assignments.map(a => `- ${a.name} (${a.subject}) — due ${a.due_date} [${a.completed ? 'completed' : a.due_date < today ? 'overdue' : 'pending'}]`).join('\n') || 'No assignments yet.';
  const tCtx = timetable.map(t => `- ${t.day} at ${t.time_slot}: ${t.subject} in ${t.room}`).join('\n') || 'No timetable entries yet.';

  const systemPrompt = `You are Lockin AI, a helpful study assistant for ${user?.username || 'a student'}, a secondary school student in New Zealand.\nToday's date is ${new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n\nAssignments:\n${aCtx}\n\nTimetable:\n${tCtx}\n\nGive practical, concise, helpful responses in a friendly but not over-the-top tone. Use New Zealand English spelling (e.g. "colour" not "color"). When referring to deadlines or the timetable, use the actual data provided.`;

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const e = await response.json().catch(() => ({}));
      return res.status(500).json({ error: e.error || 'Ollama request failed' });
    }

    const data = await response.json();
    const content = data.message?.content || 'Sorry, I couldn\'t generate a response.';
    res.json({ content });
  } catch (error) {
    console.error('[AI Error]', error);
    res.status(500).json({ error: 'Could not connect to Ollama. Make sure Ollama is running!' });
  }
}));

export default router;
