import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { errMsg } from '../api';
import { Badge, Empty, Loader, Modal, fmtDate, toInputDate } from '../utils';

const blank = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', salary: '', joiningDate: '', manager: '', isActive: true };

export default function Employees() {
  const [list, setList] = useState(null);
  const [managers, setManagers] = useState([]);
  const [filters, setFilters] = useState({ q: '', role: '', department: '' });
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/employees', { params: filters }).then((r) => setList(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [filters]);
  useEffect(() => { api.get('/employees/managers').then((r) => setManagers(r.data)); }, []);

  const openAdd = () => { setEditId(null); setForm(blank); };
  const openEdit = (u) => { setEditId(u._id); setForm({ ...blank, ...u, password: '', manager: u.manager?._id || '', joiningDate: toInputDate(u.joiningDate), salary: u.salary ?? '' }); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/employees/${editId}`, form);
      else await api.post('/employees', form);
      toast.success(editId ? 'Employee updated' : 'Employee created');
      setForm(null); load();
      api.get('/employees/managers').then((r) => setManagers(r.data));
    } catch (err) { toast.error(errMsg(err)); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try { await api.delete(`/employees/${u._id}`); toast.success('Employee deleted'); load(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Employees</h4>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>Add Employee</button>
      </div>

      <div className="card mb-3"><div className="card-body row g-2">
        <div className="col-md-5"><input className="form-control" placeholder="Search name or email..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /></div>
        <div className="col-md-3"><select className="form-select" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option><option value="hr">HR</option><option value="manager">Manager</option><option value="employee">Employee</option></select></div>
        <div className="col-md-4"><input className="form-control" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} /></div>
      </div></div>

      <div className="card"><div className="table-responsive">
        {!list ? <Loader /> : list.length === 0 ? <Empty /> : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th>Name</th><th>Role</th><th>Department</th><th>Designation</th><th>Manager</th><th>Joined</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id}>
                  <td><div className="fw-semibold">{u.name}</div><small className="text-muted">{u.email}</small></td>
                  <td><Badge text={u.role} /></td>
                  <td>{u.department || '-'}</td><td>{u.designation || '-'}</td><td>{u.manager?.name || '-'}</td><td>{fmtDate(u.joiningDate)}</td>
                  <td>{u.isActive ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div></div>

      {form && (
        <Modal title={editId ? 'Edit Employee' : 'Add Employee'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="row g-3">
            <div className="col-md-6"><label className="form-label">Name *</label><input className="form-control" required value={form.name} onChange={set('name')} /></div>
            <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" required value={form.email} onChange={set('email')} /></div>
            <div className="col-md-6"><label className="form-label">Password {editId ? '(leave blank to keep)' : '*'}</label>
              <input type="password" className="form-control" minLength={6} required={!editId} value={form.password} onChange={set('password')} /></div>
            <div className="col-md-6"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={set('role')}>
              <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option></select></div>
            <div className="col-md-6"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={set('department')} /></div>
            <div className="col-md-6"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={set('designation')} /></div>
            <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={set('phone')} /></div>
            <div className="col-md-6"><label className="form-label">Salary</label><input type="number" min="0" className="form-control" value={form.salary} onChange={set('salary')} /></div>
            <div className="col-md-6"><label className="form-label">Joining Date</label><input type="date" className="form-control" value={form.joiningDate} onChange={set('joiningDate')} /></div>
            <div className="col-md-6"><label className="form-label">Reports To (Manager)</label><select className="form-select" value={form.manager} onChange={set('manager')}>
              <option value="">— None —</option>{managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}</select></div>
            <div className="col-12 form-check ms-2"><input type="checkbox" className="form-check-input" id="act" checked={form.isActive} onChange={set('isActive')} /><label htmlFor="act" className="form-check-label">Active account</label></div>
            <div className="col-12 text-end"><button type="button" className="btn btn-light me-2" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary">Save</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
