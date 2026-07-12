# Dhrumil - branch `auth`

Authentication, users/profile, Settings module (departments, categories, ESG configuration, notification settings), notification system, and the shared integration files (app.js, schema.sql, AppRoutes.jsx, Sidebar.jsx).

Work ONLY in the files below (each stub's first line also names you as owner).
Push to branch `auth` - see ../TEAM-WORKFLOW.md for the git commands.

## Backend files (Phase 2)

- `Backend/src/config/env.js` - Environment variable loader (exists)
- `Backend/src/config/db.js` - PostgreSQL pool + schema bootstrap (exists)
- `Backend/src/config/mailer.js` - Nodemailer SMTP transport (exists)
- `Backend/src/config/schema.sql` - Full database schema - users + all ESG master/transactional tables
- `Backend/src/models/userModel.js` - User data access (exists)
- `Backend/src/models/departmentModel.js` - Department master data access
- `Backend/src/models/categoryModel.js` - Category master (CSR Activity / Challenge types)
- `Backend/src/models/esgSettingsModel.js` - ESG configuration (weights, toggles) data access
- `Backend/src/models/notificationModel.js` - In-app notification data access
- `Backend/src/controllers/authController.js` - Signup/OTP/login/password reset (exists)
- `Backend/src/controllers/profileController.js` - Profile get/update + image upload (exists)
- `Backend/src/controllers/userController.js` - User listing for admins (exists)
- `Backend/src/controllers/departmentController.js` - Department CRUD
- `Backend/src/controllers/categoryController.js` - Category CRUD
- `Backend/src/controllers/esgSettingsController.js` - ESG configuration + notification settings endpoints
- `Backend/src/controllers/notificationController.js` - List/mark-read notifications
- `Backend/src/routes/authRoutes.js` - Auth endpoints (exists)
- `Backend/src/routes/profileRoutes.js` - Profile endpoints (exists)
- `Backend/src/routes/userRoutes.js` - User admin endpoints (exists)
- `Backend/src/routes/settingsRoutes.js` - Departments, categories, ESG config, notification settings
- `Backend/src/routes/notificationRoutes.js` - Notification endpoints
- `Backend/src/middlewares/authMiddleware.js` - JWT guard (exists)
- `Backend/src/middlewares/roleMiddleware.js` - Role-based access guard (exists)
- `Backend/src/middlewares/uploadMiddleware.js` - Profile image upload (exists)
- `Backend/src/middlewares/errorMiddleware.js` - Central error handler (exists)
- `Backend/src/validators/validate.js` - Validation helpers (exists)
- `Backend/src/validators/authValidators.js` - Auth request validation (exists)
- `Backend/src/validators/profileValidators.js` - Profile request validation (exists)
- `Backend/src/validators/settingsValidators.js` - Department/category/ESG-config validation
- `Backend/src/utils/apiError.js` - Operational error class (exists)
- `Backend/src/utils/otpGenerator.js` - OTP generation (exists)
- `Backend/src/utils/tokenGenerator.js` - JWT + reset tokens (exists)
- `Backend/src/utils/sendEmail.js` - Email dispatch with console fallback (exists)
- `Backend/src/utils/emailTemplates.js` - Email HTML templates - extend with notification templates
- `Backend/src/utils/notificationService.js` - Creates in-app notifications + email fan-out per settings
- `Backend/scripts/seed-admin.js` - Admin account seeder (exists)
- `Backend/scripts/seed-demo.js` - Demo data seeder - departments, factors, challenges, policies

## Frontend files (Phase 3)

- `Frontend/src/context/AuthContext.jsx` - Auth session context (exists)
- `Frontend/src/context/NotificationContext.jsx` - In-app notification state + polling
- `Frontend/src/services/api.js` - Axios instance (exists)
- `Frontend/src/services/authService.js` - Auth API calls (exists)
- `Frontend/src/services/userService.js` - Profile/user API calls (exists)
- `Frontend/src/services/settingsService.js` - Departments/categories/ESG-config API calls
- `Frontend/src/services/notificationService.js` - Notification API calls
- `Frontend/src/routes/AppRoutes.jsx` - Route table - extended with all ESG module routes (exists)
- `Frontend/src/routes/PrivateRoute.jsx` - Auth route guard (exists)
- `Frontend/src/routes/RoleBasedRoute.jsx` - Role route guard (exists)
- `Frontend/src/components/layout/Header.jsx` - Top bar (exists) - add notification bell
- `Frontend/src/components/layout/Sidebar.jsx` - Nav (exists) - rewire to ESG modules with sub-items
- `Frontend/src/components/layout/MainLayout.jsx` - Dashboard shell (exists)
- `Frontend/src/components/layout/AuthLayout.jsx` - Auth shell (exists)
- `Frontend/src/components/layout/NotificationsPanel.jsx` - Bell dropdown listing notifications
- `Frontend/src/pages/dashboard/Profile.jsx` - Profile page (exists)
- `Frontend/src/pages/settings/Settings.jsx` - Settings module shell with sub-tabs
- `Frontend/src/pages/settings/Departments.jsx` - Departments management tab
- `Frontend/src/pages/settings/Categories.jsx` - Categories management tab
- `Frontend/src/pages/settings/EsgConfiguration.jsx` - ESG weights + business-rule toggles tab
- `Frontend/src/pages/settings/NotificationSettings.jsx` - Notification preferences tab
- `Frontend/src/styles/dashboard/notifications-panel.css` - NotificationsPanel styles
- `Frontend/src/styles/settings/settings.css` - Settings shell styles
- `Frontend/src/styles/settings/departments.css` - Departments page styles
- `Frontend/src/styles/settings/categories.css` - Categories page styles
- `Frontend/src/styles/settings/esg-configuration.css` - ESG configuration page styles
- `Frontend/src/styles/settings/notification-settings.css` - Notification settings page styles

## Your git commands

```bash
git checkout auth
git pull origin main
# edit your files, then:
git add .
git commit -m "feat(auth): describe your change"
git push origin auth
```
