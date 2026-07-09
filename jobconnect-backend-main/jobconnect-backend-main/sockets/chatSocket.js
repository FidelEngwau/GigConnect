const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { createMessage, getTaskParticipants, assertParticipant, markRead } = require('../controllers/messageController');

// onlineUsers maps userId -> Set of socket ids. A user can have more than one
// socket connected (e.g. two browser tabs), so we only announce "offline" once
// their very last socket disconnects.
const onlineUsers = new Map();

const addOnlineSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return true; // already fully offline
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true; // this was their last connection
  }
  return false;
};

const isOnline = (userId) => onlineUsers.has(userId);

// Socket.io connections carry a JWT the same way HTTP requests do, just passed
// via `socket.handshake.auth.token` instead of an Authorization header.
// The frontend connects with: io(URL, { auth: { token: '<jwt>' } })
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT id, name, role, status FROM users WHERE id = ? LIMIT 1', [
      decoded.id
    ]);

    if (!users.length || users[0].status !== 'active') {
      return next(new Error('Invalid or inactive user'));
    }

    socket.user = users[0];
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

// initChatSocket wires up all chat-related Socket.io behaviour. Called once
// from server.js with the shared io instance: initChatSocket(io).
const initChatSocket = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    addOnlineSocket(userId, socket.id);

    // Let anyone in a shared task room know this user just came online.
    // (Scoped broadcast, not global, so unrelated users never see this.)
    const broadcastPresence = (online) => {
      socket.rooms.forEach((room) => {
        if (room.startsWith('task:')) {
          socket.to(room).emit('presence:update', { userId, online });
        }
      });
    };

    // "chat:join" -- the frontend calls this right after opening a task's chat
    // screen, e.g. socket.emit('chat:join', { taskId }).
    socket.on('chat:join', async ({ taskId }, callback) => {
      try {
        const task = await getTaskParticipants(taskId);
        if (!task || (!assertParticipant(task, userId) && socket.user.role !== 'admin')) {
          if (callback) callback({ error: 'You are not a participant in this task conversation' });
          return;
        }

        socket.join(`task:${taskId}`);

        // Tell the joining user whether the other participant is currently online,
        // and tell the other participant this user just showed up.
        const otherId = task.employer_id === userId ? task.worker_id : task.employer_id;
        if (callback) callback({ ok: true, otherUserOnline: isOnline(otherId) });
        socket.to(`task:${taskId}`).emit('presence:update', { userId, online: true });
      } catch (error) {
        if (callback) callback({ error: 'Could not join conversation' });
      }
    });

    socket.on('chat:leave', ({ taskId }) => {
      socket.leave(`task:${taskId}`);
    });

    // "chat:message" -- send a message. Persists through the same createMessage
    // function the REST POST route uses, so validation/storage never diverges.
    socket.on('chat:message', async ({ taskId, body }, callback) => {
      try {
        const message = await createMessage({ taskId, senderId: userId, body });
        io.to(`task:${taskId}`).emit('chat:message', message);
        if (callback) callback({ ok: true, message });
      } catch (error) {
        if (callback) callback({ error: error.message || 'Could not send message' });
      }
    });

    // "chat:read" -- mark this user's unread messages in the task as read, and
    // let the sender's screen update its read receipts live.
    socket.on('chat:read', async ({ taskId }) => {
      try {
        const task = await getTaskParticipants(taskId);
        if (!task || !assertParticipant(task, userId)) return;

        await pool.query(
          'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE task_id = ? AND recipient_id = ? AND read_at IS NULL',
          [taskId, userId]
        );
        io.to(`task:${taskId}`).emit('chat:read', { taskId: Number(taskId), readBy: userId });
      } catch (error) {
        // Read receipts are a nice-to-have; a failure here should never crash the socket.
      }
    });

    // "chat:typing" -- ephemeral, not persisted. Just relayed to the other participant.
    socket.on('chat:typing', ({ taskId, isTyping }) => {
      socket.to(`task:${taskId}`).emit('chat:typing', { userId, isTyping: !!isTyping });
    });

    socket.on('disconnect', () => {
      const wasLastSocket = removeOnlineSocket(userId, socket.id);
      if (wasLastSocket) {
        broadcastPresence(false);
      }
    });
  });
};

module.exports = { initChatSocket, isOnline };
