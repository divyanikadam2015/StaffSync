import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

const DEMO = [
  { label: 'HR', email: 'hr@staffsync.com', password: 'Admin@123' },
  { label: 'Manager', email: 'manager@staffsync.com', password: 'Manager@123' },
  { label: 'Employee', email: 'employee@staffsync.com', password: 'Employee@123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); nav('/'); }
    catch (err) { toast.error(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="login-wrap p-3">
      <div className="card p-4 shadow" style={{ width: 420, maxWidth: '100%' }}>
        <div className="text-center mb-3">
          <i className="bi bi-diagram-2-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
          <h3 className="fw-bold mb-0">StaffSync</h3>
          <small className="text-muted">Modern Human Resource Management</small>
        </div>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <hr />
        <small className="text-muted d-block mb-2">Demo accounts (click to fill):</small>
        <div className="d-flex gap-2">
          {DEMO.map((d) => (
            <button key={d.label} type="button" className="btn btn-outline-secondary btn-sm flex-fill" onClick={() => setForm({ email: d.email, password: d.password })}>{d.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
