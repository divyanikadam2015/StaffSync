import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../utils';

const MENU = [
  { to: '/', label: 'Dashboard', icon: 'speedometer2', roles: ['hr', 'manager', 'employee'] },
  { to: '/employees', label: 'Employees', icon: 'people', roles: ['hr'] },
  { to: '/team', label: 'My Team', icon: 'diagram-3', roles: ['manager'] },
  { to: '/leaves', label: 'Leaves', icon: 'calendar2-x', roles: ['hr', 'manager', 'employee'] },
  { to: '/attendance', label: 'Attendance', icon: 'clock-history', roles: ['hr', 'manager', 'employee'] },
  { to: '/announcements', label: 'Announcements', icon: 'megaphone', roles: ['hr', 'manager', 'employee'] },
  { to: '/training', label: 'Training', icon: 'mortarboard', roles: ['hr', 'manager', 'employee'] },
  { to: '/profile', label: 'My Profile', icon: 'person-circle', roles: ['hr', 'manager', 'employee'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><i className="bi bi-diagram-2-fill me-2"></i>StaffSync</div>
        <nav className="nav flex-column mt-2" onClick={() => setOpen(false)}>
          {MENU.filter((m) => m.roles.includes(user.role)).map((m) => (
            <NavLink key={m.to} to={m.to} end={m.to === '/'} className="nav-link">
              <i className={`bi bi-${m.icon}`}></i>{m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area">
        <div className="topbar d-flex justify-content-between align-items-center">
          <button className="btn btn-light d-md-none" onClick={() => setOpen(!open)}><i className="bi bi-list"></i></button>
          <div className="ms-auto d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user.name}</div>
              <Badge text={user.role} />
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={() => { logout(); nav('/login'); }}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </>
  );
}
