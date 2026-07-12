-- Users table: single table covering identity, role, verification, OTP and password reset state.
CREATE TABLE IF NOT EXISTS users (
  id                      SERIAL PRIMARY KEY,
  full_name               VARCHAR(100)  NOT NULL,
  email                   VARCHAR(255)  NOT NULL UNIQUE,
  password_hash           VARCHAR(100)  NOT NULL,
  phone                   VARCHAR(13)   NOT NULL CHECK (phone ~ '^\+91[0-9]{10}$'),
  role                    VARCHAR(10)   NOT NULL DEFAULT 'client'
                          CHECK (role IN ('admin', 'manager', 'employee', 'client')),
  profile_image_path      VARCHAR(255),
  is_verified             BOOLEAN       NOT NULL DEFAULT FALSE,
  otp_code                VARCHAR(6),
  otp_expires_at          TIMESTAMPTZ,
  reset_token             VARCHAR(64),
  reset_token_expires_at  TIMESTAMPTZ,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Emails are stored lowercased; this index makes login/signup lookups fast and case-safe.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
