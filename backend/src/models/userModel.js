const { query } = require('../config/db');

// Columns safe to expose to clients (never the hash, OTP or reset token).
const PUBLIC_COLUMNS =
  'id, full_name, email, phone, role, profile_image_path, is_verified, created_at, updated_at';

async function create({ fullName, email, passwordHash, phone, role, otpCode, otpExpiresAt }) {
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, otp_code, otp_expires_at)
     VALUES ($1, LOWER($2), $3, $4, $5, $6, $7)
     RETURNING ${PUBLIC_COLUMNS}`,
    [fullName, email, passwordHash, phone, role, otpCode, otpExpiresAt]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function setOtp(id, otpCode, otpExpiresAt) {
  await query(
    'UPDATE users SET otp_code = $2, otp_expires_at = $3, updated_at = NOW() WHERE id = $1',
    [id, otpCode, otpExpiresAt]
  );
}

async function markVerified(id) {
  const { rows } = await query(
    `UPDATE users
     SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL, updated_at = NOW()
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id]
  );
  return rows[0];
}

async function setResetToken(id, resetToken, resetTokenExpiresAt) {
  await query(
    `UPDATE users
     SET reset_token = $2, reset_token_expires_at = $3,
         otp_code = NULL, otp_expires_at = NULL, updated_at = NOW()
     WHERE id = $1`,
    [id, resetToken, resetTokenExpiresAt]
  );
}

async function updatePassword(id, passwordHash) {
  await query(
    `UPDATE users
     SET password_hash = $2, reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW()
     WHERE id = $1`,
    [id, passwordHash]
  );
}

async function updateProfile(id, { fullName, phone }) {
  const { rows } = await query(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         phone = COALESCE($3, phone),
         updated_at = NOW()
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, fullName ?? null, phone ?? null]
  );
  return rows[0];
}

async function updateProfileImage(id, imagePath) {
  const { rows } = await query(
    `UPDATE users SET profile_image_path = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, imagePath]
  );
  return rows[0];
}

async function listAll() {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC`);
  return rows;
}

module.exports = {
  create,
  findByEmail,
  findById,
  setOtp,
  markVerified,
  setResetToken,
  updatePassword,
  updateProfile,
  updateProfileImage,
  listAll,
};
