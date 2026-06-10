import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { timetable as timetableApi, SUBJECTS, DAYS, TIME_SLOTS, subjectBg } from '../lib/api';
import { TimetableEntry } from '../types';

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState('');
  const [modalSlot, setModalSlot] = useState('');
  const [modalSubject, setModalSubject] = useState('');
  const [modalRoom, setModalRoom] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const d = await timetableApi.list();
      setEntries(d);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const todayIdx = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(new Date().toLocaleDateString('en-NZ', { weekday: 'long' })) - 1;

  function openAdd(day: string, slot: string) {
    setModalDay(day); setModalSlot(slot); setModalSubject(''); setModalRoom(''); setError(''); setModalOpen(true);
  }

  async function handleAdd() {
    if (!modalSubject || !modalRoom) { setError('All fields are required'); return; }
    try {
      await timetableApi.create(modalSubject, modalRoom, modalDay, modalSlot);
      setModalOpen(false);
      load();
    } catch (err) {
      setError((err as Error).message || 'Failed to add class');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this class?')) return;
    try {
      await timetableApi.remove(id);
      load();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete class');
    }
  }

  async function handleClearAll() {
    if (!confirm('Clear your entire timetable?')) return;
    try {
      await timetableApi.clearAll();
      load();
    } catch (err) {
      setError((err as Error).message || 'Failed to clear timetable');
    }
  }

  function getEntry(day: string, slot: string) {
    return entries.find(e => e.day === day && e.time_slot === slot);
  }

  if (loading) return <div className="panel"><div className="empty-state">Loading...</div></div>;

  return (
    <div className="panel" key="timetable">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="panel-title">Timetable</h1>
          <p className="panel-subtitle">Your weekly schedule</p>
        </div>
        <button className="btn-danger" onClick={handleClearAll}><Trash2 size={14} /> Clear all</button>
      </div>

      <div className="timetable-wrapper">
        <div className="timetable-header-row">
          <div className="timetable-corner" />
          {DAYS.map((d, i) => (
            <div key={d} className={`timetable-day-header${i === todayIdx ? ' today' : ''}`}>{d}</div>
          ))}
        </div>
        {TIME_SLOTS.map(slot => (
          <div key={slot} className="timetable-row">
            <div className="timetable-time">{slot}</div>
            {DAYS.map((day) => {
              const entry = getEntry(day, slot);
              return (
                <div key={day + slot} className="timetable-cell">
                  {entry ? (
                    <div className="timetable-pill" style={subjectBg(entry.subject)} onClick={() => handleDelete(entry.id)}>
                      <span className="timetable-pill-subject">{entry.subject}</span>
                      <span className="timetable-pill-room">{entry.room}</span>
                    </div>
                  ) : (
                    <div className="timetable-add-btn" onClick={() => openAdd(day, slot)}><Plus size={16} /></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Add Class</div><button className="btn-icon" onClick={() => setModalOpen(false)}>x</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Subject</label>
                <select className="form-select" value={modalSubject} onChange={e => setModalSubject(e.target.value)}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Room</label>
                <input className="form-input" value={modalRoom} onChange={e => setModalRoom(e.target.value)} placeholder="e.g. Room 12" />
              </div>
              <div className="form-group">
                <label>Day</label>
                <select className="form-select" value={modalDay} onChange={e => setModalDay(e.target.value)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select className="form-select" value={modalSlot} onChange={e => setModalSlot(e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {error && <div className="form-error">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd}>Add Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
