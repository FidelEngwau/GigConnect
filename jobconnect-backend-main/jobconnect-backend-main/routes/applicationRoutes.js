const express = require('express');
const {
  applyForJob,
  myApplications,
  jobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Job seekers apply to a specific job, optionally uploading a CV for this application.
router.post('/apply/:jobId', protect, authorize('graduate'), upload.single('cv'), applyForJob);

// Job seekers can only list their own applications.
router.get('/my-applications', protect, authorize('graduate'), myApplications);

// Employers can view applicants only for jobs they own; admins can view any job.
router.get('/job/:jobId', protect, authorize('professional', 'admin'), jobApplications);
router.put('/:id/status', protect, authorize('professional', 'admin'), updateApplicationStatus);

module.exports = router;
