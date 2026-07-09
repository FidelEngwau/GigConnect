const express = require('express');
const { createTask, myTasks, employerTasks, getTask } = require('../controllers/taskController');
const {
  submitWork,
  listSubmissions,
  updateSubmissionStatus
} = require('../controllers/taskSubmissionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/taskUploadMiddleware');

const router = express.Router();

// Employers (acting as the client/NGO) create tasks and assign them to a worker.
router.post('/', protect, authorize('professional'), createTask);

// Must be declared before /:id so these fixed paths aren't treated as a task id.
router.get('/my-tasks', protect, authorize('graduate'), myTasks);
router.get('/employer/my-tasks', protect, authorize('professional'), employerTasks);

// Employers/admins approve or reject a specific submission.
router.put('/submissions/:id/status', protect, authorize('professional', 'admin'), updateSubmissionStatus);

router.get('/:id', protect, getTask);

// The "Submit work" screen: upload.single('file') accepts one PNG/PDF; a Canva
// link can be sent alongside (or instead) as req.body.canva_link.
router.post(
  '/:taskId/submissions',
  protect,
  authorize('graduate'),
  upload.single('file'),
  submitWork
);
router.get('/:taskId/submissions', protect, authorize('professional', 'admin', 'graduate'), listSubmissions);

module.exports = router;
