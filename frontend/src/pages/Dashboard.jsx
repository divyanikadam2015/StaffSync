import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Loader, fmtDate } from '../utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [cards, setCards] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/dashboard').then((r) => setCards(r.data.cards));
    api.get('/announcements').then((r) => setNews(r.data.slice(0, 3)));
  }, []);

  if (!cards) return <Loader />;

  return (
    <>
      <h4 className="mb-1">Hello, {user.name} 👋</h4>
      <p className="text-muted">Here is your {user.role === 'hr' ? 'organization' : user.role === 'manager' ? 'team' : 'personal'} overview.</p>
      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-12 col-sm-6 col-xl-4" key={c.label}>
            <div className="card stat-card"><div className="card-body d-flex align-items-center gap-3">
              <div className={`stat-icon bg-${c.color} bg-opacity-10 text-${c.color}`}><i className={`bi bi-${c.icon}`}></i></div>
              <div><div className="text-muted small">{c.label}</div><div className="fs-3 fw-bold">{c.value}</div></div>
            </div></div>
          </div>
        ))}
      </div>
      <div className="card"><div className="card-header bg-white fw-semibold"><i className="bi bi-megaphone me-2"></i>Latest Announcements</div>
        <ul className="list-group list-group-flush">
          {news.length === 0 && <li className="list-group-item text-muted">No announcements yet</li>}
          {news.map((n) => (
            <li className="list-group-item" key={n._id}>
              <div className="fw-semibold">{n.title} <small className="text-muted fw-normal">· {fmtDate(n.createdAt)}</small></div>
              <div className="text-muted">{n.content}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
