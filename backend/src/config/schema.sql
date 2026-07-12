-- EcoSphere - Full database schema (users + all ESG master/transactional tables)
-- Owner: dhrumil | Applied automatically on server start (idempotent).

-- ========================= ORGANIZATIONS ==========================
CREATE TABLE IF NOT EXISTS organizations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  created_by  INTEGER,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed a default organization for pre-existing data.
INSERT INTO organizations (id, name, code)
VALUES (1, 'Default Organization', 'DEFAULT')
ON CONFLICT (id) DO NOTHING;

-- ============================== USERS ==============================
CREATE TABLE IF NOT EXISTS users (
  id                      SERIAL PRIMARY KEY,
  full_name               VARCHAR(100)  NOT NULL,
  email                   VARCHAR(255)  NOT NULL UNIQUE,
  password_hash           VARCHAR(100)  NOT NULL,
  phone                   VARCHAR(13)   NOT NULL CHECK (phone ~ '^\+91[0-9]{10}$'),
  role                    VARCHAR(10)   NOT NULL DEFAULT 'employee'
                          CHECK (role IN ('admin', 'manager', 'employee')),
  profile_image_path      VARCHAR(255),
  is_verified             BOOLEAN       NOT NULL DEFAULT FALSE,
  otp_code                VARCHAR(6),
  otp_expires_at          TIMESTAMPTZ,
  reset_token             VARCHAR(64),
  reset_token_expires_at  TIMESTAMPTZ,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Role model migration: exactly three roles remain
-- (organization admin / department manager / employee).
UPDATE users SET role = 'employee' WHERE role = 'client';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'employee';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'employee'));

-- Organization link for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE users SET organization_id = 1 WHERE organization_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_organization ON users (organization_id);

-- ========================== MASTER DATA ============================

CREATE TABLE IF NOT EXISTS departments (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(100) NOT NULL,
  code                  VARCHAR(20)  NOT NULL UNIQUE,
  head_id               INTEGER REFERENCES users(id) ON DELETE SET NULL,
  parent_department_id  INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  employee_count        INTEGER      NOT NULL DEFAULT 0,
  status                VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Organization link for departments
ALTER TABLE departments ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE departments SET organization_id = 1 WHERE organization_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments (organization_id);

-- ESG profile fields on users (department link + diversity data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('csr_activity', 'challenge')),
  status      VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (name, type)
);

-- Organization link for categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE categories SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS emission_factors (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  source_type  VARCHAR(20)  NOT NULL CHECK (source_type IN ('purchase', 'manufacturing', 'fleet', 'expense')),
  unit         VARCHAR(30)  NOT NULL,            -- e.g. litre, kWh, km, unit
  factor_value NUMERIC(12,4) NOT NULL CHECK (factor_value >= 0),  -- kg CO2 per unit
  status       VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Organization link for emission_factors
ALTER TABLE emission_factors ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE emission_factors SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS product_esg_profiles (
  id              SERIAL PRIMARY KEY,
  product_name    VARCHAR(120) NOT NULL,
  sku             VARCHAR(50),
  carbon_per_unit NUMERIC(12,4) NOT NULL DEFAULT 0 CHECK (carbon_per_unit >= 0),
  recyclable      BOOLEAN      NOT NULL DEFAULT FALSE,
  esg_rating      VARCHAR(2)   CHECK (esg_rating IN ('A', 'B', 'C', 'D', 'E')),
  notes           TEXT,
  status          VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Organization link for product_esg_profiles
ALTER TABLE product_esg_profiles ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE product_esg_profiles SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS environmental_goals (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  target_co2    NUMERIC(12,2) NOT NULL CHECK (target_co2 >= 0),   -- tonnes
  current_co2   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_co2 >= 0),
  deadline      DATE         NOT NULL,
  status        VARCHAR(12)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'on_track', 'completed', 'missed')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Organization link for environmental_goals
ALTER TABLE environmental_goals ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE environmental_goals SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS esg_policies (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(150) NOT NULL,
  description    TEXT,
  version        VARCHAR(15)  NOT NULL DEFAULT '1.0',
  effective_date DATE,
  status         VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Organization link for esg_policies
ALTER TABLE esg_policies ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE esg_policies SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS badges (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(100) NOT NULL UNIQUE,
  description       TEXT,
  icon              VARCHAR(40)  NOT NULL DEFAULT 'award',
  unlock_rule_type  VARCHAR(25)  NOT NULL CHECK (unlock_rule_type IN ('xp', 'challenges_completed')),
  unlock_rule_value INTEGER      NOT NULL CHECK (unlock_rule_value > 0),
  status            VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Organization link for badges
ALTER TABLE badges ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE badges SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS rewards (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  points_required INTEGER     NOT NULL CHECK (points_required > 0),
  stock           INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status          VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization link for rewards
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE rewards SET organization_id = 1 WHERE organization_id IS NULL;

-- Per-organization ESG configuration (weights + business-rule toggles)
CREATE TABLE IF NOT EXISTS esg_settings (
  id                        INTEGER PRIMARY KEY DEFAULT 1 CHECK (id >= 1),
  organization_id           INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  weight_environmental      INTEGER NOT NULL DEFAULT 40 CHECK (weight_environmental BETWEEN 0 AND 100),
  weight_social             INTEGER NOT NULL DEFAULT 30 CHECK (weight_social BETWEEN 0 AND 100),
  weight_governance         INTEGER NOT NULL DEFAULT 30 CHECK (weight_governance BETWEEN 0 AND 100),
  auto_emission_calculation BOOLEAN NOT NULL DEFAULT TRUE,
  evidence_requirement      BOOLEAN NOT NULL DEFAULT TRUE,
  badge_auto_award          BOOLEAN NOT NULL DEFAULT TRUE,
  notify_in_app             BOOLEAN NOT NULL DEFAULT TRUE,
  notify_email              BOOLEAN NOT NULL DEFAULT FALSE,
  notify_compliance         BOOLEAN NOT NULL DEFAULT TRUE,
  notify_approvals          BOOLEAN NOT NULL DEFAULT TRUE,
  notify_policy_reminders   BOOLEAN NOT NULL DEFAULT TRUE,
  notify_badge_unlocks      BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Remove old single-row constraint if it exists, add org column
ALTER TABLE esg_settings DROP CONSTRAINT IF EXISTS esg_settings_id_check;
ALTER TABLE esg_settings ADD CONSTRAINT esg_settings_id_check CHECK (id >= 1);
-- Add organization_id if not present (for existing installations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esg_settings' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE esg_settings ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;
UPDATE esg_settings SET organization_id = 1 WHERE organization_id IS NULL;

INSERT INTO esg_settings (id, organization_id) VALUES (1, 1) ON CONFLICT (id) DO NOTHING;

-- ======================= TRANSACTIONAL DATA ========================

CREATE TABLE IF NOT EXISTS carbon_transactions (
  id                 SERIAL PRIMARY KEY,
  source_type        VARCHAR(20) NOT NULL
                     CHECK (source_type IN ('purchase', 'manufacturing', 'fleet', 'expense', 'manual')),
  reference          VARCHAR(80),                 -- source document / note
  emission_factor_id INTEGER REFERENCES emission_factors(id) ON DELETE SET NULL,
  department_id      INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  quantity           NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit               VARCHAR(30),
  co2_amount         NUMERIC(14,4) NOT NULL CHECK (co2_amount >= 0),  -- kg CO2
  transaction_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
  auto_calculated    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_by         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carbon_tx_date ON carbon_transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_carbon_tx_department ON carbon_transactions (department_id);

-- Organization link for carbon_transactions
ALTER TABLE carbon_transactions ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE carbon_transactions SET organization_id = 1 WHERE organization_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_carbon_tx_organization ON carbon_transactions (organization_id);

CREATE TABLE IF NOT EXISTS csr_activities (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(150) NOT NULL,
  category_id       INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description       TEXT,
  activity_date     DATE,
  location          VARCHAR(120),
  points            INTEGER     NOT NULL DEFAULT 0 CHECK (points >= 0),
  evidence_required BOOLEAN     NOT NULL DEFAULT FALSE,
  status            VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization link for csr_activities
ALTER TABLE csr_activities ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE csr_activities SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS employee_participations (
  id              SERIAL PRIMARY KEY,
  activity_id     INTEGER NOT NULL REFERENCES csr_activities(id) ON DELETE CASCADE,
  employee_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proof_path      VARCHAR(255),
  approval_status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  points_earned   INTEGER     NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  completion_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (activity_id, employee_id)
);

CREATE TABLE IF NOT EXISTS challenges (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(150) NOT NULL,
  category_id       INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description       TEXT,
  xp                INTEGER     NOT NULL DEFAULT 0 CHECK (xp >= 0),
  difficulty        VARCHAR(10) NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  evidence_required BOOLEAN     NOT NULL DEFAULT FALSE,
  deadline          DATE,
  status            VARCHAR(15) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'under_review', 'completed', 'archived')),
  created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization link for challenges
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE challenges SET organization_id = 1 WHERE organization_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_challenges_organization ON challenges (organization_id);

CREATE TABLE IF NOT EXISTS challenge_participations (
  id              SERIAL PRIMARY KEY,
  challenge_id    INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  employee_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress        INTEGER     NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  proof_path      VARCHAR(255),
  employee_notes  TEXT,
  approval_status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  xp_awarded      INTEGER     NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_id, employee_id)
);

CREATE TABLE IF NOT EXISTS policy_acknowledgements (
  id              SERIAL PRIMARY KEY,
  policy_id       INTEGER NOT NULL REFERENCES esg_policies(id) ON DELETE CASCADE,
  employee_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (policy_id, employee_id)
);

CREATE TABLE IF NOT EXISTS audits (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(150) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  auditor_name  VARCHAR(100),
  audit_date    DATE,
  findings      TEXT,
  status        VARCHAR(15) NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned', 'in_progress', 'under_review', 'completed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization link for audits
ALTER TABLE audits ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE audits SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS compliance_issues (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(150) NOT NULL,
  description   TEXT,
  audit_id      INTEGER REFERENCES audits(id) ON DELETE SET NULL,
  severity      VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,  -- ownership is mandatory
  due_date      DATE    NOT NULL,
  status        VARCHAR(12) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  resolved_at   TIMESTAMPTZ,
  overdue_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_due ON compliance_issues (status, due_date);

-- Organization link for compliance_issues
ALTER TABLE compliance_issues ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE compliance_issues SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS employee_badges (
  id          SERIAL PRIMARY KEY,
  badge_id    INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (badge_id, employee_id)
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id           SERIAL PRIMARY KEY,
  reward_id    INTEGER NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  employee_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL CHECK (points_spent > 0),
  status       VARCHAR(10) NOT NULL DEFAULT 'fulfilled' CHECK (status IN ('fulfilled', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS department_scores (
  id                  SERIAL PRIMARY KEY,
  department_id       INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  period              VARCHAR(7) NOT NULL,        -- 'YYYY-MM'
  environmental_score NUMERIC(5,1) NOT NULL DEFAULT 0,
  social_score        NUMERIC(5,1) NOT NULL DEFAULT 0,
  governance_score    NUMERIC(5,1) NOT NULL DEFAULT 0,
  total_score         NUMERIC(5,1) NOT NULL DEFAULT 0,
  calculated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (department_id, period)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL,   -- compliance | approval | policy_reminder | badge | general
  title      VARCHAR(150) NOT NULL,
  message    TEXT,
  link       VARCHAR(150),
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- ========================== TRAINING ============================
CREATE TABLE IF NOT EXISTS training_courses (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(150) NOT NULL,
  description     TEXT,
  duration_hours  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (duration_hours >= 0),
  category        VARCHAR(100),
  status          VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization link for training_courses
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
UPDATE training_courses SET organization_id = 1 WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS training_records (
  id              SERIAL PRIMARY KEY,
  course_id       INTEGER NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  employee_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score           INTEGER CHECK (score BETWEEN 0 AND 100),
  status          VARCHAR(15) NOT NULL DEFAULT 'completed' CHECK (status IN ('enrolled', 'completed', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, employee_id)
);

ALTER TABLE challenge_participations ADD COLUMN IF NOT EXISTS employee_notes TEXT;
