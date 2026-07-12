# EcoSphere — ESG Management Platform

Full-stack ESG (Environmental, Social, Governance) management platform:
measure carbon emissions, run CSR activities and governance compliance, and
drive engagement through gamification — unified in one dashboard.

## Modules

- **Dashboard** — executive overview: E/S/G + overall ESG score, emissions
  trend, department ranking, recent activity, quick actions
- **Environmental** — emission factors, product ESG profiles, carbon
  transactions (auto-calculated from operations), environmental goals
- **Social** — CSR activities, employee participation with proof + approval,
  diversity dashboard
- **Governance** — policies, policy acknowledgements, audits, compliance
  issues (severity, owner, due date)
- **Gamification** — challenges (Draft → Active → Under Review → Completed /
  Archived), XP, auto-awarded badges, reward redemption, leaderboards
- **Reports** — Environmental / Social / Governance / ESG Summary + custom
  report builder with filters and PDF/Excel/CSV export
- **Settings** — departments, categories, ESG configuration (score weights +
  business-rule toggles), notification settings

## Stack

- **Frontend** (`/Frontend`): React 19 + Vite, React Router, Axios, plain
  class-based CSS (all styles under `src/styles/`)
- **Backend** (`/Backend`): Node + Express, PostgreSQL (`pg`), JWT +
  bcryptjs, Nodemailer, Multer

## Run it

```bash
# 1. PostgreSQL — point Backend/.env DB_* at your server (schema
#    auto-applies on boot).

# 2. Backend (http://localhost:5000)
cd Backend && npm install && npm run dev

# 3. Frontend (http://localhost:5173)
cd Frontend && npm install && npm run dev
```

- **Emails/OTP in dev**: with SMTP unset in `Backend/.env`, verification and
  reset codes are printed to the backend console instead of being emailed.
- **Admin account**: signup offers manager/employee/client only — create the
  admin with `npm run seed:admin` (defaults: `admin@example.com` / `Admin@1234`).
- Copy `.env.example` → `.env` in both `Backend/` and `Frontend/` and fill in
  real values (never commit `.env`).

## Team

4 developers / 4 branches — see [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) for the
branch plan, file ownership and git commands, and
[ECOSPHERE-STRUCTURE.md](ECOSPHERE-STRUCTURE.md) for the full file tree.

| Developer | Branch                 |
| --------- | ---------------------- |
| Dhrumil   | `auth`                 |
| Neel      | `environmental`        |
| Kavya     | `social-governance`    |
| Yagna     | `gamification-reports` |
