export const API_BASE = '/api';

export const SUBJECTS = ['Mathematics', 'English', 'Digital Tech', 'History', 'Science', 'PE', 'Other'] as const;
export type Subject = typeof SUBJECTS[number];

export const SUBJECT_COLOURS: Record<string, string> = {
  Mathematics: '#4da6ff',
  English: '#ff6eb4',
  'Digital Tech': '#3dd6d6',
  History: '#f5a623',
  Science: '#3dd68c',
  PE: '#ff5f5f',
  Other: '#9994b8',
};

export const FALLBACK_COLOR = '#9994b8';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const TIME_SLOTS = ['8:30 am', '10:00 am', '11:30 am', '1:30 pm', '3:00 pm'] as const;

export const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#0f0f11', fg: '#f0eeff' },
  { id: 'light', name: 'Light', bg: '#f5f5f7', fg: '#1a1830' },
  { id: 'midnight', name: 'Midnight', bg: '#060810', fg: '#e8eeff' },
  { id: 'forest', name: 'Forest', bg: '#0a120e', fg: '#e0f0e8' },
  { id: 'sunset', name: 'Sunset', bg: '#120a0a', fg: '#f0e8e8' },
  { id: 'slate', name: 'Slate', bg: '#e8eaf0', fg: '#1e2440' },
];

export const ACCENTS = [
  { id: 'violet', hex: '#7c6aff' },
  { id: 'green', hex: '#3dd68c' },
  { id: 'pink', hex: '#ff6eb4' },
  { id: 'blue', hex: '#4da6ff' },
  { id: 'amber', hex: '#f5a623' },
  { id: 'teal', hex: '#3dd6d6' },
  { id: 'red', hex: '#ff5f5f' },
  { id: 'purple', hex: '#9b59b6' },
];

export const FONTS = [
  { id: 'Sora', name: 'Sora' },
  { id: 'DM Sans', name: 'DM Sans' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono' },
];
