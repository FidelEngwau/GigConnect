const pool = require('../config/db');

const messageSelect = `
  SELECT messages.*, sender.name AS sender_name, recipient.name AS recipient_name
  FROM messages
  JOIN users sender ON sender.id = messages.sender_id
  JOIN users recipient ON recipient.id = messages.recipient_id
`;

// A task's two participants are always its employer_id (professional) and
// worker_id (graduate). Whoever is NOT the sender is automatically the recipient --
// there is no participant list to manage separately.
const getTaskParticipants = async (taskId) => {
  const [tasks] = await pool.query('SELECT id, employer_id, worker_id FROM tasks WHERE id = ? LIMIT 1', [
    taskId
  ]);
  return tasks[0] || null;
};

const assertParticipant = (task, userId) => {
  if (!task) return false;
  return task.employer_id === userId || task.worker_id === userId;
};

// Shared by the POST /messages route AND the Socket.io "chat:message" event, so a
// message sent through either path is validated and stored the exact same way.
const createMessage = async ({ taskId, senderId, body }) => {
  const trimmed = (body || '').trim();
  if (!trimmed) {
    throw Object.assign(new Error('Message body is required'), { status: 400 });
  }

  const task = await getTaskParticipants(taskId);
  if (!task) {
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  if (!assertParticipant(task, senderId)) {
    throw Object.assign(new Error('You are not a participant in this task conversation'), { status: 403 });
  }

  const recipientId = task.employer_id === senderId ? task.worker_id : task.employer_id;

  const [result] = await pool.query(
    'INSERT INTO messages (task_id, sender_id, recipient_id, body) VALUES (?, ?, ?, ?)',
    [taskId, senderId, recipientId, trimmed]
  );

  const [rows] = await pool.query(`${messageSelect} WHERE messages.id = ? LIMIT 1`, [result.insertId]);
  return rows[0];
};

// POST /api/tasks/:taskId/messages
const sendMessage = async (req, res) => {
  try {
    const message = await createMessage({
      taskId: req.params.taskId,
      senderId: req.user.id,
      body: req.body.body
    });

    // If Socket.io is running (attached in server.js via app.set('io', io)),
    // broadcast to anyone else already viewing this task's chat in real time.
    const io = req.app.get('io');
    if (io) {
      io.to(`task:${req.params.taskId}`).emit('chat:message', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Could not send message' });
  }
};

// GET /api/tasks/:taskId/messages?before=<id>&limit=50
// Simple keyset pagination: pass the oldest message id you already have as `before`
// to load older history above it.
const listMessages = async (req, res) => {
  const taskId = req.params.taskId;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before ? Number(req.query.before) : null;

  try {
    const task = await getTaskParticipants(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin' && !assertParticipant(task, req.user.id)) {
      return res.status(403).json({ message: 'You are not a participant in this task conversation' });
    }

    const params = [taskId];
    let beforeClause = '';
    if (before) {
      beforeClause = 'AND messages.id < ?';
      params.push(before);
    }
    params.push(limit);

    const [rows] = await pool.query(
      `${messageSelect} WHERE messages.task_id = ? ${beforeClause}
       ORDER BY messages.id DESC LIMIT ?`,
      params
    );

    // Return oldest-first so the frontend can render top-to-bottom directly.
    res.json({ messages: rows.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Could not load messages', error: error.message });
  }
};

// PUT /api/tasks/:taskId/messages/read
// Marks every unread message sent TO the current user (for this task) as read.
const markRead = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await getTaskParticipants(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!assertParticipant(task, req.user.id)) {
      return res.status(403).json({ message: 'You are not a participant in this task conversation' });
    }

    await pool.query(
      'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE task_id = ? AND recipient_id = ? AND read_at IS NULL',
      [taskId, req.user.id]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`task:${taskId}`).emit('chat:read', { taskId: Number(taskId), readBy: req.user.id });
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Could not mark messages as read', error: error.message });
  }
};

module.exports = { createMessage, getTaskParticipants, assertParticipant, sendMessage, listMessages, markRead };
