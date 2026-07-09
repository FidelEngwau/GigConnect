const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// A Canva share link is just a normal URL. This basic check catches obvious
// typos/garbage input without being overly strict about Canva's own URL format.
const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const submissionSelect = `
  SELECT task_submissions.*, users.name AS worker_name
  FROM task_submissions
  JOIN users ON users.id = task_submissions.worker_id
`;

// POST /api/tasks/:taskId/submissions
// Accepts either an uploaded PNG/PDF (req.file, field name "file") or a
// Canva link (req.body.canva_link) -- at least one is required.
const submitWork = async (req, res) => {
  const { canva_link } = req.body;
  const taskId = req.params.taskId;

  // Clean up an uploaded file if validation fails past this point, so we don't
  // leave orphaned files on disk for a submission that was never recorded.
  const cleanupUploadedFile = () => {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  };

  if (!req.file && !canva_link) {
    cleanupUploadedFile();
    return res.status(400).json({ message: 'Upload a PNG/PDF file or provide a Canva link' });
  }

  if (canva_link && !isValidUrl(canva_link)) {
    cleanupUploadedFile();
    return res.status(400).json({ message: 'canva_link must be a valid URL' });
  }

  try {
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ? LIMIT 1', [taskId]);
    if (!tasks.length) {
      cleanupUploadedFile();
      return res.status(404).json({ message: 'Task not found' });
    }
    const task = tasks[0];

    // Only the assigned worker can submit work for their own task.
    if (task.worker_id !== req.user.id) {
      cleanupUploadedFile();
      return res.status(403).json({ message: 'You can only submit work for tasks assigned to you' });
    }

    if (task.status === 'closed') {
      cleanupUploadedFile();
      return res.status(400).json({ message: 'This task is closed and no longer accepts submissions' });
    }

    // Submissions after the deadline are still recorded (so nothing is silently
    // lost) but flagged as late for the employer to see.
    const isLate = new Date(task.due_at).getTime() < Date.now();

    const filePath = req.file ? path.join('tasks', req.file.filename) : null;
    const originalName = req.file ? req.file.originalname : null;

    const [result] = await pool.query(
      `INSERT INTO task_submissions
        (task_id, worker_id, file_path, original_name, canva_link, is_late, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, req.user.id, filePath, originalName, canva_link || null, isLate, 'submitted']
    );

    const [rows] = await pool.query(`${submissionSelect} WHERE task_submissions.id = ? LIMIT 1`, [
      result.insertId
    ]);

    res.status(201).json({ message: 'Work submitted', submission: rows[0] });
  } catch (error) {
    cleanupUploadedFile();
    res.status(500).json({ message: 'Could not submit work', error: error.message });
  }
};

// GET /api/tasks/:taskId/submissions
// The owning employer, the assigned worker, or an admin can view submissions.
const listSubmissions = async (req, res) => {
  try {
    const [tasks] = await pool.query('SELECT employer_id, worker_id FROM tasks WHERE id = ? LIMIT 1', [
      req.params.taskId
    ]);
    if (!tasks.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = tasks[0];
    const isOwner = req.user.id === task.employer_id || req.user.id === task.worker_id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    const [rows] = await pool.query(
      `${submissionSelect} WHERE task_submissions.task_id = ? ORDER BY task_submissions.submitted_at DESC`,
      [req.params.taskId]
    );
    res.json({ submissions: rows });
  } catch (error) {
    res.status(500).json({ message: 'Could not load submissions', error: error.message });
  }
};

// PUT /api/tasks/submissions/:id/status
// Employers (or admins) approve or reject a piece of submitted work.
const updateSubmissionStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['submitted', 'approved', 'rejected'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid submission status' });
  }

  try {
    // A dedicated query (rather than submissionSelect) so we can pull in
    // tasks.employer_id, which is needed for the ownership check below.
    const [rows] = await pool.query(
      `SELECT task_submissions.*, tasks.employer_id
       FROM task_submissions
       JOIN tasks ON tasks.id = task_submissions.task_id
       WHERE task_submissions.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Employers can only review submissions for tasks they created; admins can review any.
    if (req.user.role !== 'admin' && rows[0].employer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only review submissions for your own tasks' });
    }

    await pool.query('UPDATE task_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await pool.query(`${submissionSelect} WHERE task_submissions.id = ? LIMIT 1`, [
      req.params.id
    ]);
    res.json({ message: 'Submission status updated', submission: updated[0] });
  } catch (error) {
    res.status(500).json({ message: 'Could not update submission status', error: error.message });
  }
};

module.exports = { submitWork, listSubmissions, updateSubmissionStatus };
