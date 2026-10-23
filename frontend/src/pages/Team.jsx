import { useEffect, useState } from 'react';
import api from '../api';
import { Empty, Loader, fmtDate } from '../utils';

export default function Team() {
  const [team, setTeam] = useState(null);
  useEffect(() => { api.get('/employees/team').then((r) => setTeam(r.data)); }, []);

  return (
    <>
      <h4 className="mb-3">My Team</h4>
      <div className="card"><div className="table-responsive">
        {!team ? <Loader /> : team.length === 0 ? <Empty text="No employees report to you yet. Ask HR to assign team members." /> : (
          <table className="table table-hover mb-0">
            <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Phone</th><th>Joined</th></tr></thead>
            <tbody>{team.map((u) => (
              <tr key={u._id}><td className="fw-semibold">{u.name}</td><td>{u.email}</td><td>{u.department || '-'}</td><td>{u.designation || '-'}</td><td>{u.phone || '-'}</td><td>{fmtDate(u.joiningDate)}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div></div>
    </>
  );
}
