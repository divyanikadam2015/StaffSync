import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Empty, Loader, Modal, fmtDate, toInputDate } from '../utils';

const blank = { title: '', description: '', startDate: '', endDate: '', participants: [] };

export default function Training() {
  const { user } = useAuth();
  const isMgr = user.role === 'manager';
  const [list, setList] = useState(null);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(null);

  const load = () => api.get('/trainings').then((r) => setList(r.data));
  useEffect(() => { load(); if (isMgr) api.get('/employees/team').then((r) => setTeam(r.data)); }, []);

  const openEdit = (t) => setForm({ _id: t._id, title: t.title, description: t.description || '', startDate: toInputDate(t.startDate), endDate: toInputDate(t.endDate), participants: t.participants.map((p) => p._id) });
  const toggle = (id) => setForm({ ...form, participants: form.participants.includes(id) ? form.participants.filter((x) => x !== id) : [...form.participants, id] });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (form._id) await api.put(`/trainings/${form._id}`, form); else await api.post('/trainings', form);
      toast.success('Training saved'); setForm(null); load();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this training?')) return;
    try { await api.delete(`/trainings/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Training & Development</h4>
        {isMgr && <button className="btn btn-primary" onClick={() => setForm(blank)}><i className="bi bi-plus-lg me-1"></i>Create Training</button>}
      </div>
      {!list ? <Loader /> : list.length === 0 ? <Empty text={isMgr ? 'No trainings created yet' : 'No trainings assigned to you'} /> : (
        <div className="row g-3">{list.map((t) => (
          <div className="col-md-6" key={t._id}><div className="card h-100"><div className="card-body">
            <div className="d-flex justify-content-between"><h5>{t.title}</h5>
              {isMgr && <div><button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(t)}><i className="bi bi-pencil"></i></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}><i className="bi bi-trash"></i></button></div>}
            </div>
            <p className="text-muted">{t.description || 'No description'}</p>
            <div className="mb-2"><i className="bi bi-calendar-event me-1"></i>{fmtDate(t.startDate)} – {fmtDate(t.endDate)}</div>
            <div className="small text-muted mb-2">By {t.createdBy?.name}</div>
            <div>{t.participants.map((p) => <span key={p._id} className="badge bg-light text-dark border me-1">{p.name}</span>)}</div>
          </div></div></div>
        ))}</div>
      )}
      {form && (
        <Modal title={form._id ? 'Edit Training' : 'Create Training'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="row g-3">
            <div className="col-12"><label className="form-label">Title</label><input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="col-12"><label className="form-label">Description</label><textarea rows="2" className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea></div>
            <div className="col-md-6"><label className="form-label">Start</label><input type="date" required className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="col-md-6"><label className="form-label">End</label><input type="date" required min={form.startDate} className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="col-12"><label className="form-label">Participants (your team)</label>
              {team.length === 0 && <div className="text-muted small">No team members assigned to you yet.</div>}
              {team.map((m) => (
                <div className="form-check" key={m._id}><input className="form-check-input" type="checkbox" id={m._id} checked={form.participants.includes(m._id)} onChange={() => toggle(m._id)} />
                  <label className="form-check-label" htmlFor={m._id}>{m.name} <small className="text-muted">({m.designation || m.department || 'Employee'})</small></label></div>
              ))}
            </div>
            <div className="col-12 text-end"><button type="button" className="btn btn-light me-2" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary">Save</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
