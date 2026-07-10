# JobConnect Backend

This repository contains the backend API for JobConnect, a learning project that shows students how to build a role-based job marketplace with Node.js, Express, JWT authentication, bcrypt password hashing, MariaDB/MySQL, and Multer file uploads.

The frontend lives in a separate repository named `jobconnect-frontend`.

## What This Backend Teaches

- How to structure an Express project with routes, controllers, middleware, and config files.
- How JWT authentication works in a real API.
- How role-based access control protects admin, professional, and graduate routes.
- How to use bcrypt so plain text passwords are never stored.
- How to query MariaDB/MySQL with `mysql2/promise`.
- How to upload CV files with Multer.
- How to enforce ownership, for example professionals can edit only their own jobs.

## Folder Structure

```text
jobconnect-backend/
  config/
    db.js                  # MySQL connection pool
  controllers/             # Request handlers and database logic
  middleware/              # Auth, role checks, and upload handling
  routes/                  # URL definitions that call controllers
  uploads/                 # CV files are stored here
  database/
    schema.sql             # Tables and relationships
    seed.sql               # Sample learning data
  server.js                # Express app entry point
  package.json
  .env.example
```

## Request Flow

1. A browser sends a request to an endpoint such as `POST /api/jobs`.
2. The route in `routes/jobRoutes.js` decides which middleware and controller should run.
3. `protect` in `middleware/authMiddleware.js` verifies the JWT and loads `req.user`.
4. `authorize` in `middleware/roleMiddleware.js` checks the user's role.
5. The controller validates input, runs SQL queries, and returns JSON.

## Requirements

- Node.js 18 or newer
- MariaDB or MySQL
- npm

## Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jobconnect
DB_PORT=3306
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Create and seed the database:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Default Seed Accounts

Use these accounts after loading `database/seed.sql`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@jobconnect.com` | `password123` |
| Professional | `employer1@jobconnect.com` | `password123` |
| Professional | `employer2@jobconnect.com` | `password123` |
| Graduate | `seeker1@jobconnect.com` | `password123` |
| Graduate | `seeker2@jobconnect.com` | `password123` |

## Main Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Profiles:

- `GET /api/profile`
- `PUT /api/profile/employer`
- `PUT /api/profile/job-seeker`

Jobs:

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/jobs/employer/my-jobs`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`

Applications:

- `POST /api/applications/apply/:jobId`
- `GET /api/applications/my-applications`
- `GET /api/applications/job/:jobId`
- `PUT /api/applications/:id/status`

Admin:

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/jobs`
- `GET /api/admin/applications`
- `PUT /api/admin/users/:id/status`

Tasks ("Submit work" feature):

- `POST /api/tasks` — professional creates a task and assigns a worker (`worker_id`, `title`, `description`, `due_at`)
- `GET /api/tasks/my-tasks` — graduate's assigned tasks, with `seconds_remaining` / `is_overdue`
- `GET /api/tasks/employer/my-tasks` — professional's created tasks
- `GET /api/tasks/:id` — task detail (owner, assigned worker, or admin)
- `POST /api/tasks/:taskId/submissions` — worker submits completed work. Multipart form field `file` for a PNG/PDF, and/or a `canva_link` text field. At least one is required.
- `GET /api/tasks/:taskId/submissions` — list submissions for a task
- `PUT /api/tasks/submissions/:id/status` — professional/admin sets `submitted` / `approved` / `rejected`

To create the tables for this feature:

```bash
mysql -u root -p jobconnect < database/tasks_schema.sql
mysql -u root -p jobconnect < database/tasks_seed.sql   # optional sample task
```

Chat (task-scoped messaging, e.g. "Re: Social media graphics NGO campaign"):

There is no separate "conversations" concept -- each task already has exactly
two participants (`tasks.employer_id` and `tasks.worker_id`), so the task itself
is the thread.

REST (history, sending as a fallback, and read receipts):

- `GET /api/tasks/:taskId/messages?before=<id>&limit=50` — message history, oldest-first
- `POST /api/tasks/:taskId/messages` — send a message (`body`)
- `PUT /api/tasks/:taskId/messages/read` — mark your unread messages in this task as read

Real-time (Socket.io, same host/port as the REST API):

```js
const socket = io(API_URL, { auth: { token: jwtToken } });

socket.emit('chat:join', { taskId }, (res) => {
  // res.otherUserOnline tells you if the other participant is online right now
});

socket.emit('chat:message', { taskId, body }, (res) => { /* res.message or res.error */ });
socket.emit('chat:typing', { taskId, isTyping: true });
socket.emit('chat:read', { taskId });

socket.on('chat:message', (message) => { /* append to the thread */ });
socket.on('chat:typing', ({ userId, isTyping }) => { /* show/hide typing indicator */ });
socket.on('chat:read', ({ taskId, readBy }) => { /* update read receipts */ });
socket.on('presence:update', ({ userId, online }) => { /* "Online Now" indicator */ });
```

A connection without a valid JWT in `auth.token` is rejected before any events
are processed, using the same JWT_SECRET as the REST API.

To create the table for this feature:

```bash
mysql -u root -p jobconnect < database/chat_schema.sql
```

## Student Exercises

- Add validation for stronger passwords during registration.
- Add pagination to job browsing.
- Add an endpoint for admins to create another admin account.
- Store uploaded CVs in cloud storage instead of local disk.
- Add automated API tests for auth and job ownership rules.

## Useful Checks

```bash
node --check server.js
npm audit --omit=dev
```
just fixed corodination of the backend with frontend to make after the updates
