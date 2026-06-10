import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSettings } from '../lib/useSettings';

export default function Layout() {
  const { prefs } = useSettings();
  const compact = prefs.compactSidebar;
  return (
    <div className="app-shell">
      <Sidebar compact={compact} />
      <Topbar compact={compact} />
      <main className={`main-content${compact ? ' compact' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
