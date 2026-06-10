import { API_BASE, SUBJECT_COLOURS, FALLBACK_COLOR, Subject, SUBJECTS, DAYS, TIME_SLOTS } from '../constants';

export { SUBJECTS, DAYS, TIME_SLOTS };
import {
  User,
  Assignment,
  TimetableEntry,
  Note,
  DashboardData,
  ChatMessage,
  ApiResponse
} from './types';

let token: string | null = null;

export function setToken(t: string | null) { token = t; }
export function getToken() { return token; }

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMsg = data.error || `Request failed with status ${res.status}`;

    const error = new Error(errorMsg);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export const auth = {
  register: (username: string, password: string) => request<ApiResponse<{token: string, username: string}>>('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) => request<ApiResponse<{token: string, username: string}>>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
};

export const assignments = {
  list: () => request<Assignment[]>('/assignments'),
  create: (name: string, subject: string, due_date: string) => request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify({ name, subject, due_date }) }),
  update: (id: number, data: Partial<Assignment>) => request<Assignment>(`/assignments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number) => request<ApiResponse<boolean>>(`/assignments/${id}`, { method: 'DELETE' }),
};

export const timetable = {
  list: () => request<TimetableEntry[]>('/timetable'),
  create: (subject: string, room: string, day: string, time_slot: string) => request<TimetableEntry>('/timetable', { method: 'POST', body: JSON.stringify({ subject, room, day, time_slot }) }),
  remove: (id: number) => request<ApiResponse<boolean>>(`/timetable/${id}`, { method: 'DELETE' }),
  clearAll: () => request<ApiResponse<boolean>>('/timetable', { method: 'DELETE' }),
};

export const notesApi = {
  list: (subject?: string) => request<Note[]>(`/notes${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`),
  create: async (subject: string, title: string, content: string, image?: File | null): Promise<Note> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const body = new FormData();
    body.append('subject', subject);
    body.append('title', title);
    body.append('content', content);
    if (image) body.append('image', image);
    const res = await fetch(`${API_BASE}/notes`, { method: 'POST', headers, body });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: 'Upload failed' })); throw new Error(d.error || 'Upload failed'); }
    return res.json();
  },
  remove: (id: number) => request<ApiResponse<boolean>>(`/notes/${id}`, { method: 'DELETE' }),
};

export const dashboard = {
  get: () => request<DashboardData>('/dashboard'),
};

export const ai = {
  chat: (messages: ChatMessage[]) => request<ApiResponse<{content: string}>>('/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) }),
};

export function subjectBg(subject: string) {
  const c = SUBJECT_COLOURS[subject] || FALLBACK_COLOR;
  return { background: `${c}22`, color: c, borderColor: `${c}44` };
}

export function subjectDotBg(subject: string) {
  return { background: SUBJECT_COLOURS[subject] || FALLBACK_COLOR };
}
