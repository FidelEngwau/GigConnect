const path = require('path');
const multer = require('multer');

// diskStorage tells Multer where to save completed-work uploads and how to name them.
// These are kept in their own uploads/tasks folder, separate from CV uploads.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'tasks'));
  },
  filename: (req, file, cb) => {
    // Prefix the original extension with a random timestamp-based name to avoid collisions.
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  }
});

// The "Submit work" screen accepts PNG or PDF files (a Canva link is handled
// separately as a plain text field, not a file upload).
const allowedExtensions = new Set(['.png', '.pdf']);
const allowedMimeTypes = new Set(['image/png', 'application/pdf']);

// File filtering is a basic safety check so users cannot upload arbitrary file types.
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only PNG and PDF files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  // Limit task submissions to 10 MB. Adjust if graphics files run larger.
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
