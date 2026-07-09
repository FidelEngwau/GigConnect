const express = require('express');
const { sendMessage, listMessages, markRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// These routes are nested under a task, e.g. GET /api/tasks/5/messages.
// Any authenticated user can call them -- the controller itself checks that the
// caller is actually one of the task's two participants (or an admin).
router.get('/:taskId/messages', protect, listMessages);
router.post('/:taskId/messages', protect, sendMessage);
router.put('/:taskId/messages/read', protect, markRead);

module.exports = router;
