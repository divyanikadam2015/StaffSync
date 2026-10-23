import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Badge, Empty, Loader, Modal, fmtDate } from '../utils';

const today = () => new Date().toISOString().slice(0, 10);

export default function Leaves() {
  const { user } = useAuth();
  const canApply = user.role !== 'hr';
  const canReview = user.role !== 'employee';
  const [tab, setTab] = useState(canApply ? 'my' : 'review');
  const [mine, setMine] = useState(null);
  const [team, setTeam] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ type: 'casual', fromDate: '', toDate: '', reason: '' });
  const [review, setReview] = useState(null);

  const loadMine = () => canApply && api.get('/leaves/my').then((r) => setMine(r.data));
  const loadTeam = () => canReview && api.get('/leaves/team', { params: { status: statusFilter } }).then((r) => setTeam(r.data));
  useEffect(() => { loadMine(); }, []);
  useEffect(() => { loadTeam(); }, [statusFilter]);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted');
      setForm({ type: 'casual', fromDate: '', toDate: '', reason: '' });
      loadMine();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try { await api.delete(`/leaves/${id}`); toast.success('Cancelled'); loadMine(); } catch (err) { toast.error(errMsg(err)); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/leaves/${review.leave._id}/status`, { status: review.status, remarks: review.remarks });
      toast.success(`Leave ${review.status}`);
      setReview(null); loadTeam();
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <>
      <h4 className="mb-3">Leave Management</h4>
      <ul className="nav nav-tabs mb-3">
        {canApply && <li className="nav-item"><button className={`nav-link ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Leaves</button></li>}
        {canReview && <li className="nav-item"><button className={`nav-link ${tab === 'review' ? 'active' : ''}`} onClick={() => setTab('review')}>{user.role === 'hr' ? 'All Requests' : 'Team Requests'}</button></li>}
      </ul>

      {tab === 'my' && canApply && (
        <>
          <div className="card mb-3"><div className="card-header bg-white fw-semibold">Apply for Leave</div>
            <form className="card-body row g-3" onSubmit={apply}>
              <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="casual">Casual</option><option value="sick">Sick</option><option value="paid">Paid</option></select></div>
              <div className="col-md-3"><label className="form-label">From</label><input type="date" min={today()} required className="form-control" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value, toDate: form.toDate < e.target.value ? e.target.value : form.toDate })} /></div>
              <div className="col-md-3"><label className="form-label">To</label><input type="date" min={form.fromDate || today()} required className="form-control" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} /></div>
              <div className="col-md-12"><label className="form-label">Reason</label><textarea rows="2" required className="form-control" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}></textarea></div>
              <div className="col-12"><button className="btn btn-primary">Submit Request</button></div>
            </form>
          </div>
          <div className="card"><div className="table-responsive">
            {!mine ? <Loader /> : mine.length === 0 ? <Empty text="You have not applied for any leave yet" /> : (
              <table className="table align-middle mb-0">
                <thead className="table-light"><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Remarks</th><th></th></tr></thead>
                <tbody>{mine.map((l) => (
                  <tr key={l._id}><td className="text-capitalize">{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                    <td><Badge text={l.status} /></td><td>{l.remarks ? `${l.remarks} (${l.reviewedBy?.name})` : '-'}</td>
                    <td>{l.status === 'pending' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(l._id)}>Cancel</button>}</td></tr>
                ))}</tbody>
              </table>
            )}
          </div></div>
        </>
      )}

      {tab === 'review' && canReview && (
        <>
          <div className="mb-3"><select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
          <div className="card"><div className="table-responsive">
            {!team ? <Loader /> : team.length === 0 ? <Empty /> : (
              <table className="table align-middle mb-0">
                <thead className="table-light"><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
                <tbody>{team.map((l) => (
                  <tr key={l._id}><td><div className="fw-semibold">{l.employee?.name}</div><small className="text-muted">{l.employee?.department}</small></td>
                    <td className="text-capitalize">{l.type}</td><td>{fmtDate(l.fromDate)} – {fmtDate(l.toDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                    <td><Badge text={l.status} />{l.reviewedBy && <div><small className="text-muted">by {l.reviewedBy.name}</small></div>}</td>
                    <td className="text-nowrap">{l.status === 'pending' && l.employee?._id !== user._id && <>
                      <button className="btn btn-sm btn-success me-1" onClick={() => setReview({ leave: l, status: 'approved', remarks: '' })}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setReview({ leave: l, status: 'rejected', remarks: '' })}>Reject</button></>}</td></tr>
                ))}</tbody>
              </table>
            )}
          </div></div>
        </>
      )}

      {review && (
        <Modal title={`${review.status === 'approved' ? 'Approve' : 'Reject'} leave — ${review.leave.employee?.name}`} onClose={() => setReview(null)}>
          <form onSubmit={submitReview}>
            <label className="form-label">Remarks (optional)</label>
            <textarea className="form-control mb-3" rows="3" value={review.remarks} onChange={(e) => setReview({ ...review, remarks: e.target.value })}></textarea>
            <div className="text-end"><button type="button" className="btn btn-light me-2" onClick={() => setReview(null)}>Cancel</button>
              <button className={`btn btn-${review.status === 'approved' ? 'success' : 'danger'}`}>Confirm {review.status === 'approved' ? 'Approval' : 'Rejection'}</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
