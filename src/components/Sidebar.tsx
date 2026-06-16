import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, ClipboardList, StickyNote, Bot, Palette, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
  { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
  { to: '/customise', icon: Palette, label: 'Customise' },
];

export default function Sidebar({ compact }: { compact: boolean }) {
  const { username, logout } = useAuth();
  return (
    <nav className={`sidebar${compact ? ' compact' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">Lockin</div>
        <div className="sidebar-user">{username}</div>
      </div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <item.icon size={18} />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={logout}>
          <LogOut size={18} />
          <span className="nav-label">Log out</span>
        </button>
      </div>
    </nav>
  );
}
