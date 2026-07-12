// EcoSphere - Proof/evidence file upload for CSR + challenge participation
// Owner: kavya
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const evidenceDir = path.resolve(path.join(__dirname, '..', '..'), 'src/uploads/evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

// Photos + documents are accepted as proof.
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, evidenceDir),
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype];
    cb(null, `proof-${req.user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const uploadEvidence = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(new ApiError(400, 'Proof must be a JPG, PNG, WEBP image or a PDF.'));
    }
    cb(null, true);
  },
}).single('proof');

module.exports = { uploadEvidence, evidenceDir };
