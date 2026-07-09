const pool = require('../config/db');

// Shared SELECT fragment for task views, joining in employer/worker display names.
const taskSelect = `
  SELECT tasks.*, employer.name AS employer_name, worker.name AS worker_name,
         employer_profiles.company_name
  FROM tasks
  JOIN users employer ON employer.id = tasks.employer_id
  JOIN users worker ON worker.id = tasks.worker_id
  LEFT JOIN employer_profiles ON employer_profiles.user_id = tasks.employer_id
`;

// Adds computed fields the frontend needs for the "Due in 4 Hrs" style countdown
// and the "Completed tasks" count, without making the client do date math.
const withComputedFields = async (row) => {
  const dueAt = new Date(row.due_at);
  const msRemaining = dueAt.getTime() - Date.now();

  const [submissions] = await pool.query(
    'SELECT id, status FROM task_submissions WHERE task_id = ? ORDER BY submitted_at DESC',
    [row.id]
  );

  return {
    ...row,
    seconds_remaining: Math.max(0, Math.round(msRemaining / 1000)),
    is_overdue: msRemaining <= 0,
    submission_count: submissions.length,
    latest_submission_status: submissions.length ? submissions[0].status : null
  };
};

const createTask = async (req, res) => {
  const { worker_id, title, description, due_at } = req.body;

  if (!worker_id || !title || !due_at) {
    return res.status(400).json({ message: 'worker_id, title, and due_at are required' });
  }

  try {
    // Only assign tasks to users who actually exist and are job seekers.
    const [workers] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [worker_id]);
    if (!workers.length || workers[0].role !== 'job_seeker') {
      return res.status(400).json({ message: 'worker_id must belong to an existing job seeker' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (employer_id, worker_id, title, description, due_at, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, worker_id, title, description || null, due_at, 'open']
    );

    const [rows] = await pool.query(`${taskSelect} WHERE tasks.id = ? LIMIT 1`, [result.insertId]);
    const task = await withComputedFields(rows[0]);
    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Could not create task', error: error.message });
  }
};

// Tasks assigned to the currently logged-in worker, e.g. for the "Submit work" screen.
const myTasks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `${taskSelect} WHERE tasks.worker_id = ? ORDER BY tasks.due_at ASC`,
      [req.user.id]
    );
    const tasks = await Promise.all(rows.map(withComputedFields));
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Could not load tasks', error: error.message });
  }
};

// Tasks an employer has created, so they can track worker progress.
const employerTasks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `${taskSelect} WHERE tasks.employer_id = ? ORDER BY tasks.due_at ASC`,
      [req.user.id]
    );
    const tasks = await Promise.all(rows.map(withComputedFields));
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Could not load tasks', error: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const [rows] = await pool.query(`${taskSelect} WHERE tasks.id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = rows[0];
    // Only the assigned worker, the owning employer, or an admin may view a task.
    const isOwner = req.user.id === task.employer_id || req.user.id === task.worker_id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    res.json({ task: await withComputedFields(task) });
  } catch (error) {
    res.status(500).json({ message: 'Could not load task', error: error.message });
  }
};

module.exports = { createTask, myTasks, employerTasks, getTask };
