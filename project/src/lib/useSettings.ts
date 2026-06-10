import { useState, useCallback, useEffect } from 'react';

export interface WidgetConfig {
  todayClasses: boolean;
  deadlines: boolean;
  metrics: boolean;
  miniCalendar: boolean;
  recentNotes: boolean;
  progressBar: boolean;
}

export interface Preferences {
  overdueAlerts: boolean;
  compactSidebar: boolean;
  classColours: boolean;
  aiTyping: boolean;
  reduceMotion: boolean;
}

const defaultWidgets: WidgetConfig = { todayClasses: true, deadlines: true, metrics: true, miniCalendar: false, recentNotes: false, progressBar: true };
const defaultPrefs: Preferences = { overdueAlerts: true, compactSidebar: false, classColours: true, aiTyping: true, reduceMotion: false };

function loadJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function useSettings() {
  const [theme, setThemeState] = useState(() => loadJSON('lockin-theme', 'dark'));
  const [accent, setAccentState] = useState(() => loadJSON('lockin-accent', '#7c6aff'));
  const [font, setFontState] = useState(() => loadJSON('lockin-font', 'Sora'));
  const [widgets, setWidgetsState] = useState<WidgetConfig>(() => loadJSON('lockin-widgets', defaultWidgets));
  const [prefs, setPrefsState] = useState<Preferences>(() => loadJSON('lockin-prefs', defaultPrefs));
  const [wallpaper, setWallpaperState] = useState<string | null>(() => localStorage.getItem('lockin-wallpaper'));

  const applyTheme = useCallback((t: string) => {
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, '').trim();
    if (t !== 'dark') root.classList.add(`theme-${t}`);
    localStorage.setItem('lockin-theme', JSON.stringify(t));
    setThemeState(t);
  }, []);

  const applyAccent = useCallback((hex: string) => {
    const root = document.documentElement;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const lighten = (amt: number) => {
      const nr = Math.min(255, r + amt), ng = Math.min(255, g + amt), nb = Math.min(255, b + amt);
      return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    };
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent2', lighten(40));
    root.style.setProperty('--accent-light', `rgba(${r},${g},${b},0.12)`);
    root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.3)`);
    localStorage.setItem('lockin-accent', JSON.stringify(hex));
    setAccentState(hex);
  }, []);

  const applyFont = useCallback((f: string) => {
    document.body.style.fontFamily = f === 'JetBrains Mono' ? "'JetBrains Mono', monospace" : f === 'DM Sans' ? "'DM Sans', sans-serif" : "'Sora', sans-serif";
    document.documentElement.style.setProperty('--font', `'${f}', sans-serif`);
    localStorage.setItem('lockin-font', JSON.stringify(f));
    setFontState(f);
  }, []);

  const setWidgets = useCallback((w: WidgetConfig) => {
    localStorage.setItem('lockin-widgets', JSON.stringify(w));
    setWidgetsState(w);
  }, []);

  const setPrefs = useCallback((p: Preferences) => {
    localStorage.setItem('lockin-prefs', JSON.stringify(p));
    setPrefsState(p);
  }, []);

  const setWallpaper = useCallback((url: string | null) => {
    if (url) localStorage.setItem('lockin-wallpaper', url);
    else localStorage.removeItem('lockin-wallpaper');
    setWallpaperState(url);
  }, []);

  useEffect(() => { applyTheme(theme); }, [theme, applyTheme]);
  useEffect(() => { applyAccent(accent); }, [accent, applyAccent]);
  useEffect(() => { applyFont(font); }, [font, applyFont]);

  return { theme, setTheme: applyTheme, accent, setAccent: applyAccent, font, setFont: applyFont, widgets, setWidgets, prefs, setPrefs, wallpaper, setWallpaper };
}
