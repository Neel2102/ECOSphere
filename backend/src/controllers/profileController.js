const fs = require('fs');
const path = require('path');
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');
const { toPublicUser } = require('./authController');
const { uploadDir } = require('../middlewares/uploadMiddleware');

async function getProfile(req, res) {
  res.json({ success: true, data: { user: toPublicUser(req.user) } });
}

async function updateProfile(req, res, next) {
  try {
    const { fullName, phone } = req.body;
    const updated = await userModel.updateProfile(req.user.id, {
      fullName: fullName !== undefined ? String(fullName).trim() : undefined,
      phone: phone !== undefined ? `+91${phone}` : undefined,
    });
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: toPublicUser(updated) },
    });
  } catch (err) {
    next(err);
  }
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file) throw new ApiError(400, 'No image file was uploaded.');

    // Only the relative path is persisted; the binary lives on disk.
    const relativePath = `uploads/profile-images/${req.file.filename}`;
    const previousPath = req.user.profile_image_path;

    const updated = await userModel.updateProfileImage(req.user.id, relativePath);

    // Remove the replaced file so the uploads folder doesn't accumulate orphans.
    if (previousPath) {
      const oldFile = path.join(uploadDir, path.basename(previousPath));
      fs.promises.unlink(oldFile).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Profile image updated.',
      data: { user: toPublicUser(updated) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, uploadImage };
