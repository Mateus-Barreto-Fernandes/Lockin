export interface User {
  id: number;
  username: string;
  hashed_password?: string;
  created_at?: string;
}

export interface Assignment {
  id: number;
  name: string;
  subject: string;
  due_date: string;
  completed: number;
}

export interface TimetableEntry {
  id: number;
  user_id: number;
  subject: string;
  room: string;
  day: string;
  time_slot: string;
}

export interface Note {
  id: number;
  user_id: number;
  subject: string;
  title: string;
  content: string;
  image_path?: string | null;
  created_at?: string;
}

export interface DashboardMetrics {
  dueThisWeek: number;
  completed: number;
  total: number;
  notesSaved: number;
}

export interface DashboardData {
  todayClasses: TimetableEntry[];
  upcomingDeadlines: Assignment[];
  metrics: DashboardMetrics;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
