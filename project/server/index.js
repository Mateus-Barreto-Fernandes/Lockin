import { CONFIG } from './config.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import assignmentsRoutes from './routes/assignments.js';
import timetableRoutes from './routes/timetable.js';
import notesRoutes from './routes/notes.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = CONFIG.PORT;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

app.listen(PORT, () => console.log(`Lockin server running on port ${PORT}`));
