import { useRef, useCallback, useState } from 'react';
import { Palette, Paintbrush, Image as ImageIcon, LayoutGrid, Settings, Type } from 'lucide-react';
import { useSettings, type WidgetConfig, type Preferences } from '../lib/useSettings';
import { THEMES, ACCENTS, FONTS } from '../constants';

const widgetKeys: { key: keyof WidgetConfig; label: string }[] = [
  { key: 'todayClasses', label: "Today's Classes" },
  { key: 'deadlines', label: 'Deadlines' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'miniCalendar', label: 'Mini Calendar' },
  { key: 'recentNotes', label: 'Recent Notes' },
  { key: 'progressBar', label: 'Progress Bar' },
];

const prefKeys: { key: keyof Preferences; label: string }[] = [
  { key: 'overdueAlerts', label: 'Show overdue alerts on dashboard' },
  { key: 'compactSidebar', label: 'Compact sidebar' },
  { key: 'classColours', label: 'Show class colours in timetable' },
  { key: 'aiTyping', label: 'AI typing animation' },
  { key: 'reduceMotion', label: 'Reduce motion' },
];

export default function CustomisePage() {
  const { theme, setTheme, accent, setAccent, font, setFont, widgets, setWidgets, prefs, setPrefs, setWallpaper } = useSettings();
  const wallpaperRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dominantColours, setDominantColours] = useState<string[]>([]);

  const handleWallpaper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setWallpaper(url);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 50; canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        const buckets: Record<string, number> = {};
        for (let i = 0; i < data.length; i += 16) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }
        const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
        const dominant = sorted.slice(0, 5).map(([color]) => color);
        setDominantColours(dominant);
        setAccent(dominant[0]);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, [setAccent, setWallpaper]);

  function toggleWidget(key: keyof WidgetConfig) {
    setWidgets({ ...widgets, [key]: !widgets[key] });
  }

  function togglePref(key: keyof Preferences) {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  }

  return (
    <div className="panel" key="customise">
      <h1 className="panel-title">Customise</h1>
      <p className="panel-subtitle">Make Lockin yours</p>

      <div className="settings-grid">
        <div className="settings-card">
          <h3><Palette size={16} /> Colour Theme</h3>
          <div className="theme-grid">
            {THEMES.map(t => (
              <div key={t.id} className={`theme-option${theme === t.id ? ' active' : ''}`} onClick={() => setTheme(t.id)}>
                <div className="theme-swatch" style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.fg} 50%)` }} />
                <span className="theme-name">{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3><Paintbrush size={16} /> Accent Colour</h3>
          <div className="accent-dots">
            {ACCENTS.map(a => (
              <div key={a.id} className={`accent-dot${accent === a.hex ? ' active' : ''}`} style={{ background: a.hex }} onClick={() => setAccent(a.hex)} />
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3><ImageIcon size={16} /> Upload Wallpaper / Extract Colours</h3>
          <div className="wallpaper-drop" onClick={() => wallpaperRef.current?.click()}>
            Click to upload an image
            <input ref={wallpaperRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWallpaper} />
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {dominantColours.length > 0 && (
            <div className="color-swatches">
              {dominantColours.map((c, i) => (
                <div key={i} className={`color-swatch${accent === c ? ' active' : ''}`} style={{ background: c }} onClick={() => setAccent(c)} />
              ))}
            </div>
          )}
        </div>

        <div className="settings-card">
          <h3><LayoutGrid size={16} /> Dashboard Widgets</h3>
          <div className="widget-toggles">
            {widgetKeys.map(w => (
              <div key={w.key} className={`widget-toggle${widgets[w.key] ? ' active' : ''}`} onClick={() => toggleWidget(w.key)}>
                <span>{w.label}</span>
                <div className="toggle-check">{widgets[w.key] && '✓'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3><Settings size={16} /> Preferences</h3>
          {prefKeys.map(p => (
            <div key={p.key} className="pref-row">
              <span className="pref-label">{p.label}</span>
              <div className={`toggle-switch${prefs[p.key] ? ' on' : ''}`} onClick={() => togglePref(p.key)}>
                <div className="toggle-knob" />
              </div>
            </div>
          ))}
        </div>

        <div className="settings-card">
          <h3><Type size={16} /> Font Style</h3>
          <div className="font-options">
            {FONTS.map(f => (
              <div key={f.id} className={`font-option${font === f.id ? ' active' : ''}`} onClick={() => setFont(f.id)} style={{ fontFamily: `'${f.id}', sans-serif` }}>
                {f.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
