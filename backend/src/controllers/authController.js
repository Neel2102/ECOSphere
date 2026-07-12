const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const { verificationEmail, passwordResetEmail } = require('../utils/emailTemplates');
const { generateOtp, otpExpiry } = require('../utils/otpGenerator');
const { signJwt, generateResetToken, resetTokenExpiry } = require('../utils/tokenGenerator');
const env = require('../config/env');
const { query } = require('../config/db');

const BCRYPT_ROUNDS = 10;

const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImagePath: user.profile_image_path,
  isVerified: user.is_verified,
  departmentId: user.department_id ?? null,
  departmentName: user.department_name ?? null,
  gender: user.gender ?? null,
  organizationId: user.organization_id ?? null,
  organizationName: user.organization_name ?? null,
  organizationCode: user.organization_code ?? null,
  createdAt: user.created_at,
});

// Resend cooldown is derived from the stored expiry: the OTP was issued at
// (expires_at - expiryMinutes), so no extra column is needed.
function assertResendAllowed(user) {
  if (!user.otp_expires_at) return;
  const issuedAt = new Date(user.otp_expires_at).getTime() - env.otp.expiryMinutes * 60 * 1000;
  const waitMs = issuedAt + env.otp.resendCooldownSeconds * 1000 - Date.now();
  if (waitMs > 0) {
    throw new ApiError(
      429,
      `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting a new code.`
    );
  }
}

async function signup(req, res, next) {
  try {
    const { fullName, email, password, phone, role, organizationName, organizationCode } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) throw new ApiError(409, 'That email is already registered.');

    let orgId;
    if (role === 'admin') {
      if (!organizationName || !organizationName.trim()) {
        throw new ApiError(400, 'Organization name is required for admin signup.');
      }
      let isUnique = false;
      let code = '';
      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { rows: existingOrg } = await query('SELECT id FROM organizations WHERE code = $1', [code]);
        if (existingOrg.length === 0) {
          isUnique = true;
        }
      }
      const { rows: newOrg } = await query(
        'INSERT INTO organizations (name, code) VALUES ($1, $2) RETURNING id',
        [organizationName.trim(), code]
      );
      orgId = newOrg[0].id;
    } else {
      if (!organizationCode || !organizationCode.trim()) {
        throw new ApiError(400, 'Organization code is required.');
      }
      const { rows: existingOrg } = await query(
        'SELECT id FROM organizations WHERE LOWER(code) = LOWER($1)',
        [organizationCode.trim()]
      );
      if (existingOrg.length === 0) {
        throw new ApiError(404, 'Invalid organization code. Please contact your admin.');
      }
      orgId = existingOrg[0].id;
    }

    const otp = generateOtp();
    const user = await userModel.create({
      fullName: fullName.trim(),
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      phone: `+91${phone}`,
      role,
      otpCode: otp,
      otpExpiresAt: otpExpiry(),
      organizationId: orgId,
    });

    if (role === 'admin') {
      await query('UPDATE organizations SET created_by = $1 WHERE id = $2', [user.id, orgId]);
    }

    await sendEmail(user.email, verificationEmail(user.full_name, otp));

    res.status(201).json({
      success: true,
      message: 'Account created. A verification code has been sent to your email.',
      data: { email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) throw new ApiError(404, 'No account found with that email.');
    if (user.is_verified) throw new ApiError(400, 'This account is already verified. Please log in.');
    if (!user.otp_code || user.otp_code !== otp) throw new ApiError(400, 'Invalid verification code.');
    if (new Date(user.otp_expires_at) < new Date()) {
      throw new ApiError(400, 'This code has expired. Please request a new one.');
    }

    const verified = await userModel.markVerified(user.id);

    res.json({
      success: true,
      message: 'Email verified successfully. You are now logged in.',
      data: { token: signJwt(verified), user: toPublicUser(verified) },
    });
  } catch (err) {
    next(err);
  }
}

async function resendOtp(req, res, next) {
  try {
    const user = await userModel.findByEmail(req.body.email);
    if (!user) throw new ApiError(404, 'No account found with that email.');
    if (user.is_verified) throw new ApiError(400, 'This account is already verified. Please log in.');
    assertResendAllowed(user);

    const otp = generateOtp();
    await userModel.setOtp(user.id, otp, otpExpiry());
    await sendEmail(user.email, verificationEmail(user.full_name, otp));

    res.json({ success: true, message: 'A new verification code has been sent to your email.' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    const user = await userModel.findByEmail(email);
    // Same message for unknown email and wrong password: don't leak which one failed.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new ApiError(401, 'Invalid email or password.');
    }
    if (user.role !== role) {
      throw new ApiError(403, 'The selected role does not match this account.');
    }
    if (!user.is_verified) {
      throw new ApiError(403, 'Your email is not verified yet. Please verify to continue.', 'NOT_VERIFIED');
    }

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: { token: signJwt(user), user: toPublicUser(user) },
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const user = await userModel.findByEmail(req.body.email);
    // Always answer 200 so the endpoint can't be used to probe registered emails.
    if (user) {
      assertResendAllowed(user);
      const otp = generateOtp();
      await userModel.setOtp(user.id, otp, otpExpiry());
      await sendEmail(user.email, passwordResetEmail(user.full_name, otp));
    }
    res.json({
      success: true,
      message: 'If that email is registered, a reset code has been sent to it.',
    });
  } catch (err) {
    next(err);
  }
}

async function verifyResetOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user || !user.otp_code || user.otp_code !== otp) {
      throw new ApiError(400, 'Invalid reset code.');
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      throw new ApiError(400, 'This code has expired. Please request a new one.');
    }

    const resetToken = generateResetToken();
    await userModel.setResetToken(user.id, resetToken, resetTokenExpiry());

    res.json({
      success: true,
      message: 'Code verified. You can now set a new password.',
      data: { resetToken },
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, resetToken, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user || !user.reset_token || user.reset_token !== resetToken) {
      throw new ApiError(400, 'Invalid or expired reset request. Please start over.');
    }
    if (new Date(user.reset_token_expires_at) < new Date()) {
      throw new ApiError(400, 'This reset request has expired. Please start over.');
    }

    await userModel.updatePassword(user.id, await bcrypt.hash(password, BCRYPT_ROUNDS));

    res.json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ success: true, data: { user: toPublicUser(req.user) } });
}

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  me,
  toPublicUser,
};
