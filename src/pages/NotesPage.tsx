import { useState, useEffect, useRef } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { notesApi, subjectDotBg } from '../lib/api';
import { Note } from '../types';
import { SUBJECTS } from '../constants';

export default function NotesPage() {
  const [activeSubject, setActiveSubject] = useState('Digital Tech');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await notesApi.list(activeSubject);
      setNotes(d);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [activeSubject]);

  async function handleAdd() {
    if (!title.trim()) { setError('Title is required'); return; }
    try {
      await notesApi.create(activeSubject, title.trim(), content, image);
      setTitle(''); setContent(''); setImage(null); setImageName(''); setError('');
      load();
    } catch (err) {
      setError((err as Error).message || 'Failed to create note');
    }
  }

  async function handleDelete(id: number) {
    try {
      await notesApi.remove(id);
      load();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete note');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setImage(f); setImageName(f.name); }
  }

  const count = notes.length;

  return (
    <div className="panel" key="notes">
      <h1 className="panel-title">Notes</h1>
      <p className="panel-subtitle">Subject notes and study materials</p>

      <div className="notes-layout">
        <div className="notes-sidebar">
          {SUBJECTS.map(s => (
            <button key={s} className={`notes-subject-item${s === activeSubject ? ' active' : ''}`} onClick={() => setActiveSubject(s)}>
              <div className="subject-dot" style={subjectDotBg(s)} />
              {s}
            </button>
          ))}
        </div>
        <div className="notes-panel">
          <div className="notes-panel-header">
            <h3>{activeSubject}</h3>
            <span className="notes-count">{count} note{count !== 1 ? 's' : ''}</span>
          </div>
          <div className="notes-list">
            {loading ? <div className="empty-state">Loading...</div> :
              notes.length === 0 ? <div className="empty-state">No notes for {activeSubject} yet</div> :
              notes.map(n => (
                <div key={n.id} className="note-card">
                  <div className="note-card-header">
                    <span className="note-title">{n.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="note-date">{new Date(n.created_at || '').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</span>
                      <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => handleDelete(n.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                  {n.image_path && <img src={n.image_path} alt="" className="note-image" />}
                  {n.content && <div className="note-body">{n.content}</div>}
                </div>
              ))
            }
          </div>
          <div className="notes-compose">
            <div className="notes-compose-inputs">
              <input className={`form-input${error ? ' error' : ''}`} placeholder="Note title" value={title} onChange={e => { setTitle(e.target.value); setError(''); }} />
              <textarea className="form-textarea" placeholder="Write your note..." value={content} onChange={e => setContent(e.target.value)} rows={3} />
            </div>
            <div className="notes-compose-actions">
              <label className="btn-attach" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={14} /> Attach image
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
              <span className="attach-preview">{imageName || ''}</span>
              <div style={{ flex: 1 }} />
              {error && <div className="form-error">{error}</div>}
              <button className="btn-primary" onClick={handleAdd}>Add note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
