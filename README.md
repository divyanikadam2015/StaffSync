# StaffSync – Modern HR Management Solution (MERN)

Roles: **HR**, **Manager**, **Employee**
Modules: Auth (JWT) · Employee management · Leave · Attendance · Announcements · Training · Dashboard · Profile

## Run locally

### 1. Backend
```bash
cd backend
npm install
npm run seed     # creates demo users (run once)
npm run dev      # http://localhost:5000
```
Needs MongoDB running locally, or put your Atlas URL in `backend/.env` as `MONGO_URI`.

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

## Demo logins
| Role | Email | Password |
|---|---|---|
| HR | hr@staffsync.com | Admin@123 |
| Manager | manager@staffsync.com | Manager@123 |
| Employee | employee@staffsync.com | Employee@123 |

## Tech stack
React (Vite), Bootstrap 5, React Router, Axios, Node.js, Express, MongoDB/Mongoose, JWT, bcrypt.

## API summary
| Module | Endpoints |
|---|---|
| Auth | POST /api/auth/login, GET /api/auth/me, PUT /api/auth/profile, PUT /api/auth/password |
| Employees (HR) | GET/POST /api/employees, GET/PUT/DELETE /api/employees/:id, GET /api/employees/team (manager) |
| Leaves | POST /api/leaves, GET /api/leaves/my, GET /api/leaves/team, PUT /api/leaves/:id/status, DELETE /api/leaves/:id |
| Attendance | POST /api/attendance/checkin, PUT /checkout, GET /today, GET /my, GET / (HR/manager) |
| Announcements | GET (all), POST/PUT/DELETE (HR) |
| Training | GET (role based), POST/PUT/DELETE (manager) |
| Dashboard | GET /api/dashboard |

## Business rules
- One check-in per day; check-out only after check-in; under 4 hours = half-day
- Leave: no past dates, to-date >= from-date, overlapping leaves rejected
- Managers can approve only their own team's leaves; nobody can approve their own
- Managers can add only their own team to trainings
- Passwords hashed with bcrypt and never returned by the API
- Role-based route protection on both backend and frontend

## Deployment
- DB: MongoDB Atlas -> set `MONGO_URI`
- Backend: Render/Railway -> set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL), `TIMEZONE`
- Frontend: Vercel/Netlify -> set `VITE_API_URL=https://your-backend-url/api`
  (Netlify: add a `_redirects` file with `/* /index.html 200`; Vercel: add a rewrite to index.html)
