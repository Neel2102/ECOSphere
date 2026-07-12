const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const uploadDir = path.resolve(path.join(__dirname, '..', '..'), env.upload.dir);
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Extension comes from the validated MIME type, never from the client name.
    const ext = ALLOWED_TYPES[file.mimetype];
    cb(null, `user-${req.user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const uploadProfileImage = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(new ApiError(400, 'Only JPG, PNG or WEBP images are allowed.'));
    }
    cb(null, true);
  },
}).single('image');

module.exports = { uploadProfileImage, uploadDir };
