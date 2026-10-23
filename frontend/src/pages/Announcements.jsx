import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Empty, Loader, Modal, fmtDate } from '../utils';

export default function Announcements() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null);

  const load = () => api.get('/announcements').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (form._id) await api.put(`/announcements/${form._id}`, form); else await api.post('/announcements', form);
      toast.success('Saved'); setForm(null); load();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Announcements & News</h4>
        {isHR && <button className="btn btn-primary" onClick={() => setForm({ title: '', content: '' })}><i className="bi bi-plus-lg me-1"></i>New Announcement</button>}
      </div>
      {!list ? <Loader /> : list.length === 0 ? <Empty text="No announcements yet" /> : list.map((a) => (
        <div className="card mb-3" key={a._id}><div className="card-body">
          <div className="d-flex justify-content-between">
            <h5>{a.title}</h5>
            {isHR && <div><button className="btn btn-sm btn-outline-primary me-1" onClick={() => setForm(a)}><i className="bi bi-pencil"></i></button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a._id)}><i className="bi bi-trash"></i></button></div>}
          </div>
          <p className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>{a.content}</p>
          <small className="text-muted">Posted by {a.postedBy?.name} on {fmtDate(a.createdAt)}</small>
        </div></div>
      ))}
      {form && (
        <Modal title={form._id ? 'Edit Announcement' : 'New Announcement'} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div className="mb-3"><label className="form-label">Title</label><input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="mb-3"><label className="form-label">Content</label><textarea rows="5" className="form-control" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}></textarea></div>
            <div className="text-end"><button type="button" className="btn btn-light me-2" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary">Publish</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
