import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { assignments as api, SUBJECTS, subjectBg } from '../lib/api';
import { Assignment } from '../types';

function dueLabel(due: string, completed: number) {
  if (completed) return { text: 'Done', cls: 'due-done' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(due + 'T00:00:00'); d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: 'Overdue', cls: 'due-overdue' };
  if (diff === 0) return { text: 'Due today', cls: 'due-today' };
  if (diff === 1) return { text: 'Tomorrow', cls: 'due-soon' };
  if (diff <= 2) return { text: `${diff} days left`, cls: 'due-soon' };
  return { text: new Date(due).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' }), cls: 'due-ok' };
}

export default function AssignmentsPage() {
  const [list, setList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSubject, setAddSubject] = useState('Mathematics');
  const [addDue, setAddDue] = useState(new Date().toISOString().split('T')[0]);
  const [addError, setAddError] = useState('');
  const [pageError, setPageError] = useState('');

  const load = async () => {
    try {
      const d = await api.list();
      setList(d);
    } catch (err) {
      setPageError((err as Error).message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  async function toggleComplete(a: Assignment) {
    try { await api.update(a.id, { completed: !a.completed }); load(); } catch (err) {
      setPageError((err as Error).message || 'Failed to update assignment');
    }
  }

  async function handleAdd() {
    if (!addName.trim()) { setAddError('Assignment name is required'); return; }
    try {
      await api.create(addName.trim(), addSubject, addDue);
      setShowAdd(false); setAddName(''); setAddError('');
      load();
    } catch (err) {
      setAddError((err as Error).message || 'Failed to create assignment');
    }
  }

  let filtered = [...list];
  if (subjectFilter) filtered = filtered.filter(a => a.subject === subjectFilter);
  if (statusFilter === 'pending') filtered = filtered.filter(a => !a.completed);
  else if (statusFilter === 'completed') filtered = filtered.filter(a => a.completed);

  const pending = filtered.filter(a => !a.completed).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const completed = filtered.filter(a => a.completed).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const sorted = [...pending, ...completed];
  const total = list.length;
  const done = list.filter(a => a.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (loading) return <div className="panel"><div className="empty-state">Loading...</div></div>;

  return (
    <div className="panel" key="assignments">
      <h1 className="panel-title">Assignments</h1>
      <p className="panel-subtitle">Track your deadlines</p>

      <div className="assignments-toolbar">
        <select className="form-select" style={{ width: 160 }} value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
          <option value="">All subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <div className="assignments-spacer" />
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Add assignment
        </button>
      </div>

      {showAdd && (
        <div className="add-form">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input className={`form-input${addError ? ' error' : ''}`} placeholder="Assignment name" value={addName} onChange={e => { setAddName(e.target.value); setAddError(''); }} />
            {addError && <div className="form-error">{addError}</div>}
          </div>
          <select className="form-select" style={{ width: 140 }} value={addSubject} onChange={e => setAddSubject(e.target.value)}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="form-input" type="date" style={{ width: 150 }} value={addDue} onChange={e => setAddDue(e.target.value)} />
          <button className="btn-primary" onClick={handleAdd}>Save</button>
          <button className="btn-secondary" onClick={() => { setShowAdd(false); setAddError(''); }}>Cancel</button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="empty-state">No assignments yet. Click "Add assignment" to get started.</div>
      ) : (
        <div className="assignment-list">
          {sorted.map(a => {
            const dl = dueLabel(a.due_date, a.completed);
            return (
              <div key={a.id} className={`assignment-row${a.completed ? ' completed' : ''}`}>
                <button className={`assignment-checkbox${a.completed ? ' checked' : ''}`} onClick={() => toggleComplete(a)}>
                  {a.completed && <Check size={12} color="#fff" />}
                </button>
                <span className="assignment-name">{a.name}</span>
                <span className="subject-tag" style={subjectBg(a.subject)}>{a.subject}</span>
                <span className={`due-date-label ${dl.cls}`}>{dl.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <div className="progress-section">
          <div className="progress-label"><span>{done} of {total} completed</span><span>{pct}%</span></div>
          <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      )}
    </div>
  );
}
