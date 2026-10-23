import { useState } from 'react';
import { toast } from 'react-toastify';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Badge, fmtDate } from '../utils';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try { const { data } = await api.put('/auth/profile', form); setUser({ ...user, ...data }); toast.success('Profile updated'); }
    catch (err) { toast.error(errMsg(err)); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    try { await api.put('/auth/password', pw); toast.success('Password changed'); setPw({ currentPassword: '', newPassword: '' }); }
    catch (err) { toast.error(errMsg(err)); }
  };

  const info = [['Email', user.email], ['Role', <Badge text={user.role} />], ['Department', user.department || '-'], ['Designation', user.designation || '-'], ['Reports to', user.manager?.name || '-'], ['Joined', fmtDate(user.joiningDate)]];

  return (
    <>
      <h4 className="mb-3">My Profile</h4>
      <div className="row g-3">
        <div className="col-lg-4"><div className="card"><div className="card-body">
          <div className="text-center mb-3"><i className="bi bi-person-circle text-primary" style={{ fontSize: '4rem' }}></i><h5 className="mb-0">{user.name}</h5></div>
          {info.map(([k, v]) => <div className="d-flex justify-content-between border-top py-2" key={k}><span className="text-muted">{k}</span><span>{v}</span></div>)}
        </div></div></div>
        <div className="col-lg-8">
          <div className="card mb-3"><div className="card-header bg-white fw-semibold">Edit Details</div>
            <form className="card-body row g-3" onSubmit={saveProfile}>
              <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-12"><button className="btn btn-primary">Save Changes</button></div>
            </form></div>
          <div className="card"><div className="card-header bg-white fw-semibold">Change Password</div>
            <form className="card-body row g-3" onSubmit={savePw}>
              <div className="col-md-6"><label className="form-label">Current Password</label><input type="password" required className="form-control" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">New Password</label><input type="password" minLength={6} required className="form-control" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
              <div className="col-12"><button className="btn btn-warning">Update Password</button></div>
            </form></div>
        </div>
      </div>
    </>
  );
}
