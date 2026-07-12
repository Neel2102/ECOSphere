# Neel - branch `environmental`

Environmental module: emission factors, product ESG profiles, carbon transactions (incl. auto emission calculation), environmental goals.

Work ONLY in the files below (each stub's first line also names you as owner).
Push to branch `environmental` - see ../TEAM-WORKFLOW.md for the git commands.

## Backend files (Phase 2)

- `Backend/src/models/emissionFactorModel.js` - Emission Factor master data access
- `Backend/src/models/productEsgProfileModel.js` - Product ESG Profile master data access
- `Backend/src/models/environmentalGoalModel.js` - Environmental Goal master data access
- `Backend/src/models/carbonTransactionModel.js` - Carbon Transaction data access
- `Backend/src/controllers/emissionFactorController.js` - Emission Factor CRUD
- `Backend/src/controllers/productEsgProfileController.js` - Product ESG Profile CRUD
- `Backend/src/controllers/environmentalGoalController.js` - Environmental Goal CRUD + progress
- `Backend/src/controllers/carbonTransactionController.js` - Carbon Transaction CRUD + auto-calculation endpoint
- `Backend/src/routes/environmentalRoutes.js` - Emission factors, product profiles, goals, carbon transactions
- `Backend/src/validators/environmentalValidators.js` - Environmental module validation
- `Backend/src/utils/emissionCalculator.js` - Auto emission calculation from operations x emission factors

## Frontend files (Phase 3)

- `Frontend/src/services/environmentalService.js` - Environmental module API calls
- `Frontend/src/components/common/ProgressBar/ProgressBar.jsx` - Goal progress bar with percentage
- `Frontend/src/pages/environmental/Environmental.jsx` - Environmental module shell with sub-tabs
- `Frontend/src/pages/environmental/EmissionFactors.jsx` - Emission Factors tab - CRUD table
- `Frontend/src/pages/environmental/ProductEsgProfiles.jsx` - Product ESG Profiles tab - CRUD table
- `Frontend/src/pages/environmental/CarbonTransactions.jsx` - Carbon Transactions tab - list + auto-calc source info
- `Frontend/src/pages/environmental/EnvironmentalGoals.jsx` - Environmental Goals tab - goals with progress/status
- `Frontend/src/styles/common/progress-bar.css` - ProgressBar component styles
- `Frontend/src/styles/environmental/environmental.css` - Environmental shell styles
- `Frontend/src/styles/environmental/emission-factors.css` - Emission Factors page styles
- `Frontend/src/styles/environmental/product-esg-profiles.css` - Product ESG Profiles page styles
- `Frontend/src/styles/environmental/carbon-transactions.css` - Carbon Transactions page styles
- `Frontend/src/styles/environmental/environmental-goals.css` - Environmental Goals page styles

## Your git commands

```bash
git checkout environmental
git pull origin main
# edit your files, then:
git add .
git commit -m "feat(environmental): describe your change"
git push origin environmental
```
