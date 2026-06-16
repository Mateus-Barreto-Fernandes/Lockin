import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/calendar': 'Calendar',
  '/timetable': 'Timetable',
  '/assignments': 'Assignments',
  '/notes': 'Notes',
  '/ai': 'AI Assistant',
  '/customise': 'Customise',
};

export default function Topbar({ compact }: { compact: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const title = titles[location.pathname] || 'Lockin';
  const today = new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <header className={`topbar${compact ? ' compact' : ''}`}>
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <span className="topbar-date">{today}</span>
        <button className="btn-ask-ai" onClick={() => navigate('/ai')}>
          <Sparkles size={14} /> Ask AI
        </button>
      </div>
    </header>
  );
}
