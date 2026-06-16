import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, FileText, Clock, AlertTriangle } from 'lucide-react';
import { dashboard, subjectDotBg } from '../lib/api';
import { useSettings } from '../lib/useSettings';
import { DashboardMetrics, TimetableEntry, Assignment, DashboardData } from '../types';

function urgencyInfo(due: string, completed: number) {
  if (completed) return { text: 'Done', cls: 'badge-green' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(due + 'T00:00:00'); d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: 'Overdue', cls: 'badge-red' };
  if (diff === 0) return { text: 'Due today', cls: 'badge-red' };
  if (diff <= 2) return { text: `${diff} day${diff > 1 ? 's' : ''} left`, cls: 'badge-amber' };
  return { text: new Date(due).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' }), cls: 'badge-green' };
}

export default function Dashboard() {
  const { widgets } = useSettings();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [classes, setClasses] = useState<TimetableEntry[]>([]);
  const [deadlines, setDeadlines] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data: DashboardData = await dashboard.get();
        setMetrics(data.metrics);
        setClasses(data.todayClasses);
        setDeadlines(data.upcomingDeadlines);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="panel"><div className="empty-state">Loading...</div></div>;

  // ... rest of the component remains the same

  return (
    <div className="panel" key="dashboard">
      <h1 className="panel-title">Dashboard</h1>
      <p className="panel-subtitle">Your day at a glance</p>

      {widgets.metrics && metrics && (
        <div className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(245,166,35,0.15)' }}><AlertTriangle size={20} style={{ color: '#f5a623' }} /></div>
            <div><div className="metric-value">{metrics.dueThisWeek}</div><div className="metric-label">Due this week</div></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(61,214,140,0.15)' }}><CheckCircle size={20} style={{ color: '#3dd68c' }} /></div>
            <div><div className="metric-value">{metrics.completed}/{metrics.total}</div><div className="metric-label">Completed</div></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(77,166,255,0.15)' }}><FileText size={20} style={{ color: '#4da6ff' }} /></div>
            <div><div className="metric-value">{metrics.notesSaved}</div><div className="metric-label">Notes saved</div></div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {widgets.todayClasses && (
          <div className="dash-widget">
            <div className="dash-widget-header">
              <div className="dash-widget-title"><Clock size={14} /> Today's Classes</div>
            </div>
            <div className="dash-widget-body">
              {classes.length === 0 ? <div className="empty-state">No classes today</div> :
                classes.map(c => (
                  <div key={c.id} className="class-row">
                    <div className="subject-dot" style={subjectDotBg(c.subject)} />
                    <span className="class-time">{c.time_slot}</span>
                    <span className="class-name">{c.subject}</span>
                    <span className="class-room">{c.room}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
        {widgets.deadlines && (
          <div className="dash-widget">
            <div className="dash-widget-header">
              <div className="dash-widget-title"><Calendar size={14} /> Upcoming Deadlines</div>
            </div>
            <div className="dash-widget-body">
              {deadlines.length === 0 ? <div className="empty-state">No upcoming deadlines</div> :
                deadlines.map(a => {
                  const u = urgencyInfo(a.due_date, a.completed);
                  return (
                    <div key={a.id} className="deadline-row">
                      <div className="subject-dot" style={subjectDotBg(a.subject)} />
                      <span className="deadline-name">{a.name}</span>
                      <span className={`urgency-badge ${u.cls}`}>{u.text}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
