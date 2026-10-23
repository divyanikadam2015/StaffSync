import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Badge, Empty, Loader, fmtDate, fmtTime } from '../utils';

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user.role !== 'employee';
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState(null);
  const [report, setReport] = useState(null);
  const [date, setDate] = useState('');
  const [tab, setTab] = useState('mine');

  const loadMine = () => {
    api.get('/attendance/today').then((r) => setToday(r.data));
    api.get('/attendance/my').then((r) => setHistory(r.data));
  };
  const loadReport = () => isAdmin && api.get('/attendance', { params: { date } }).then((r) => setReport(r.data));

  useEffect(() => { loadMine(); }, []);
  useEffect(() => { loadReport(); }, [date]);

  const act = async (kind) => {
    try {
      if (kind === 'in') await api.post('/attendance/checkin'); else await api.put('/attendance/checkout');
      toast.success(kind === 'in' ? 'Checked in' : 'Checked out');
      loadMine(); loadReport();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <h4 className="mb-3">Attendance</h4>
      {isAdmin && (
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item"><button className={`nav-link ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My Attendance</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>{user.role === 'hr' ? 'Company Report' : 'Team Report'}</button></li>
        </ul>
      )}

      {tab === 'mine' && (
        <>
          <div className="card mb-3"><div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="text-muted small">{new Date().toDateString()}</div>
              <div className="fs-5">
                {!today ? 'You have not checked in yet' : <>In: <b>{fmtTime(today.checkIn)}</b> {today.checkOut && <>· Out: <b>{fmtTime(today.checkOut)}</b> · {today.hours}h</>}</>}
              </div>
            </div>
            <div>
              <button className="btn btn-success me-2" disabled={!!today} onClick={() => act('in')}><i className="bi bi-box-arrow-in-right me-1"></i>Check In</button>
              <button className="btn btn-danger" disabled={!today || !!today?.checkOut} onClick={() => act('out')}><i className="bi bi-box-arrow-right me-1"></i>Check Out</button>
            </div>
          </div></div>
          <div className="card"><div className="card-header bg-white fw-semibold">History (last 60 days)</div><div className="table-responsive">
            {!history ? <Loader /> : history.length === 0 ? <Empty /> : (
              <table className="table mb-0"><thead className="table-light"><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>{history.map((a) => <tr key={a._id}><td>{fmtDate(a.date)}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td>{a.hours ?? '-'}</td><td><Badge text={a.status} /></td></tr>)}</tbody></table>
            )}
          </div></div>
        </>
      )}

      {tab === 'report' && isAdmin && (
        <>
          <div className="mb-3 d-flex gap-2"><input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
            {date && <button className="btn btn-light" onClick={() => setDate('')}>Clear</button>}</div>
          <div className="card"><div className="table-responsive">
            {!report ? <Loader /> : report.length === 0 ? <Empty /> : (
              <table className="table mb-0"><thead className="table-light"><tr><th>Employee</th><th>Department</th><th>Date</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>{report.map((a) => <tr key={a._id}><td className="fw-semibold">{a.employee?.name}</td><td>{a.employee?.department || '-'}</td><td>{fmtDate(a.date)}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td>{a.hours ?? '-'}</td><td><Badge text={a.status} /></td></tr>)}</tbody></table>
            )}
          </div></div>
        </>
      )}
    </>
  );
}
