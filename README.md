# EcoSphere — ESG Management Platform

EcoSphere is a premium, full-stack ESG (Environmental, Social, Governance) workspace. It enables organizations to monitor, analyze, and optimize their sustainability metrics, drive employee engagement via gamification challenges, track compliance audits, and generate custom report portfolios—all unified in a modern responsive interface.

---

## 🌟 Architecture & Core Flows

### 1. Authentication & Onboarding Flow
- **Registration & Verification**: Users sign up with role classifications (`employee`, `manager`, `client`). The backend handles secure password hashing with `bcryptjs`.
- **OTP Verification & Password Resets**: One-Time Passwords (OTPs) are generated and sent via SMTP. During local development, if SMTP is not configured, OTPs are printed to the backend console.
- **Organization Onboarding**: Department admins can onboard new users, structure department nodes, and set up the organization profile.
- **Admin Seeding**: Seed the superadmin credentials into the database using:
  ```bash
  npm run seed:admin
  ```

### 2. Environmental Metrics & Carbon Calculation Flow
- **Emission Factors**: Manage emission factors across operations (purchase, manufacturing, fleet, expense) that define $CO_2$ coefficients per unit.
- **Carbon Transactions**: Log resource usage data. The platform automatically calculates total emissions ($CO_2$ in kg) by multiplying the amount against the respective emission factors.
- **Product ESG Profiles**: Profile products, calculate carbon footprint per unit, assign ESG ratings (A/B/C/D/E), and record recyclability tags.
- **SBTi Environmental Goals**: Define department-specific or organization-wide carbon reduction targets with deadline tracking and auto-calculated progress pipelines.

### 3. Social Impact & CSR Flow
- **CSR Activities**: Organize community service, clean energy projects, or volunteering initiatives.
- **Employee Participation**: Employees browse open activities, join with one click, and submit completion evidence.
- **Manager Approval**: Managers review uploaded evidence and approve participations, which triggers gamification rewards.
- **Diversity Dashboard**: Track workforce gender balance (Male, Female, Other, Unspecified) across departments with dynamic breakdown bars.

### 4. Governance & Compliance Flow
- **Corporate Policies**: Publish governance documents, compliance guidelines, and code of conduct policies.
- **Policy Acknowledgements**: Employees view and digitally acknowledge policies. Compliance officers trace acknowledgement rates.
- **Audit Scheduling**: Coordinate internal/external sustainability audits and record critical findings.
- **Compliance Issue Lifecycle**: Flag compliance issues, assign owners, set severities (High, Medium, Low), schedule due dates, and track resolutions. Overdue items are auto-flagged by the system.

### 5. Gamification & Engagement Flow
- **Sustainability Challenges**: Admins configure energy-saving or community challenges through a lifecycle: `Draft` ➔ `Active` ➔ `Under Review` ➔ `Completed/Archived`.
- **XP & Badges**: Completing challenges and CSR activities awards XP points and unlocks achievements.
- **Rewards Store**: Redeem accumulated points for green rewards or charity sponsorships.
- **Leaderboards**: Friendly employee and department leaderboards driven by absolute XP rankings.

### 6. Reports & Custom Query Builder
- **ESG Executive Summary**: Aggregated dashboard reports showing overall organization metrics.
- **Custom Query Builder**: Build tailored data queries filtering by ESG module, department scope, date range, or employee profiles.
- **File Export**: Direct downloads for reports in CSV, Excel (XLSX), or PDF format.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Navigation**: React Router (v6)
- **Networking**: Axios (configured with intercepts for authorization headers)
- **UI Components**: Class-based, custom-styled components with built-in responsive styling.
- **Icons**: Modular inline SVG [Icon](file:///c:/Users/rlintern67/Desktop/EcoSphere/ECOSphere/frontend/src/components/common/Icon/Icon.jsx) component for zero-latency load times.

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL (Client: `pg` package pool)
- **Authentication**: JSON Web Tokens (JWT) + HTTP headers
- **File System**: Multer (profile picture and PDF proof uploads)
- **Email Dispatch**: Nodemailer (via standard SMTP transfer)

---

## 🚀 Installation & Local Setup

### 1. Database Setup
Ensure PostgreSQL is running locally or in your cloud environment. Create a blank database named `eco` (or custom name).

### 2. Backend Configuration
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env` and fill in your values:
   ```ini
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=eco
   JWT_SECRET=your_jwt_signing_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   SMTP_FROM_NAME=EcoSphere
   ```
3. Install dependencies and start the backend development server (database schemas auto-apply on first boot):
   ```bash
   npm install
   npm run dev
   ```
4. Seeding: Generate the super-admin account:
   ```bash
   npm run seed:admin
   ```
   *(Default credentials: `admin@example.com` / `Admin@1234`)*

### 3. Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd ../frontend
   ```
2. Copy `.env.example` to `.env` and map the backend URL:
   ```ini
   VITE_API_URL=http://localhost:5000/api
   ```
3. Install dependencies and start the Vite HMR server:
   ```bash
   npm install
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 👥 Team & Development Workflow

EcoSphere is developed and maintained by a 4-developer engineering team:

| Developer | Core Branch | Feature Modules |
| :--- | :--- | :--- |
| **Dhrumil** | `auth` | Authentication, Sign Up, Verification OTP, Onboarding Wizards |
| **Neel** | `environmental` | Carbon logs, Emission factors, Products, Environmental goals |
| **Kavya** | `social-governance` | CSR Activities, Audits, Policies, Compliance lifecycle |
| **Yagna** | `gamification-reports` | Challenges pipeline, Leaderboards, Custom report builders, Export |

For branch standards, file ownership guides, and merge checklists, see [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md). For the complete codebase file directory layout, see [ECOSPHERE-STRUCTURE.md](ECOSPHERE-STRUCTURE.md).
