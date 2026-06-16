import { useState, FormEvent } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function Auth() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Username and password are required'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) { setError('Password must contain at least one letter and one number'); return; }
    if (tab === 'register' && password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      if (tab === 'login') await login(username, password);
      else await register(username, password);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Something went wrong');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Lockin</h1>
          <p>lock in your deadlines. lock in your day.</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Log in</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className={`form-input${error ? ' error' : ''}`} value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className={`form-input${error ? ' error' : ''}`} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input className={`form-input${error ? ' error' : ''}`} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password" />
            </div>
          )}
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn-primary full" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
