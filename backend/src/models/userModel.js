const { query } = require('../config/db');

// Columns safe to expose to clients (never the hash, OTP or reset token).
const PUBLIC_COLUMNS =
  'id, full_name, email, phone, role, profile_image_path, is_verified, department_id, gender, created_at, updated_at';

async function create({ fullName, email, passwordHash, phone, role, otpCode, otpExpiresAt }) {
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, otp_code, otp_expires_at)
     VALUES ($1, LOWER($2), $3, $4, $5, $6, $7)
     RETURNING ${PUBLIC_COLUMNS}`,
    [fullName, email, passwordHash, phone, role, otpCode, otpExpiresAt]
  );
  return rows[0];
}

// Admin onboarding: account is created verified and department-assigned,
// so the new team member can log in immediately.
async function createOnboarded({ fullName, email, passwordHash, phone, role, departmentId, gender }) {
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, department_id, gender, is_verified)
     VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, TRUE)
     RETURNING ${PUBLIC_COLUMNS}`,
    [fullName, email, passwordHash, phone, role, departmentId, gender]
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
  const { rows } = await query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.profile_image_path,
            u.is_verified, u.department_id, u.gender, u.created_at, u.updated_at,
            d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

// Admin-only assignment of role / department / diversity data.
async function adminUpdate(id, { role, departmentId, gender }) {
  const { rows } = await query(
    `UPDATE users
     SET role = COALESCE($2, role),
         department_id = COALESCE($3, department_id),
         gender = COALESCE($4, gender),
         updated_at = NOW()
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, role ?? null, departmentId ?? null, gender ?? null]
  );
  return rows[0] || null;
}

// Gender counts per department (diversity dashboard).
async function diversityByDepartment() {
  const { rows } = await query(
    `SELECT d.id AS department_id, d.name AS department_name,
            COUNT(u.id)::int AS total,
            COUNT(*) FILTER (WHERE u.gender = 'male')::int AS male,
            COUNT(*) FILTER (WHERE u.gender = 'female')::int AS female,
            COUNT(*) FILTER (WHERE u.gender = 'other')::int AS other,
            COUNT(*) FILTER (WHERE u.gender IS NULL)::int AS unspecified
     FROM departments d
     LEFT JOIN users u ON u.department_id = d.id AND u.is_verified
     WHERE d.status = 'active'
     GROUP BY d.id, d.name
     ORDER BY d.name`
  );
  return rows;
}

module.exports = {
  create,
  createOnboarded,
  findByEmail,
  findById,
  setOtp,
  markVerified,
  setResetToken,
  updatePassword,
  updateProfile,
  updateProfileImage,
  listAll,
  adminUpdate,
  diversityByDepartment,
};
