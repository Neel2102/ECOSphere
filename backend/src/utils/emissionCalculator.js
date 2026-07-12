// EcoSphere - Auto emission calculation from operations x emission factors
// Owner: neel
const emissionFactorModel = require('../models/emissionFactorModel');
const esgSettingsModel = require('../models/esgSettingsModel');
const ApiError = require('./apiError');

/*
 * Resolves the CO2 amount for a carbon transaction.
 *
 * With "Auto Emission Calculation" ON (Settings toggle) the amount is always
 * quantity x emission factor - manual co2_amount input is ignored, so ERP
 * operation records (purchase/manufacturing/fleet/expense) need no manual
 * entry. With the toggle OFF a manual co2_amount is accepted as a fallback.
 */
async function resolveCo2({ emissionFactorId, quantity, manualCo2, organizationId }) {
  const settings = await esgSettingsModel.get(organizationId);

  if (settings.auto_emission_calculation) {
    if (!emissionFactorId) {
      throw new ApiError(400, 'Auto emission calculation is enabled: an emission factor is required.');
    }
    const factor = await emissionFactorModel.findById(emissionFactorId);
    if (!factor || factor.status !== 'active') {
      throw new ApiError(400, 'Emission factor not found or inactive.');
    }
    const co2 = Number(quantity) * Number(factor.factor_value);
    return {
      co2Amount: Math.round(co2 * 10000) / 10000,
      unit: factor.unit,
      autoCalculated: true,
    };
  }

  if (manualCo2 === undefined || manualCo2 === null || Number(manualCo2) < 0) {
    throw new ApiError(400, 'Auto calculation is disabled: provide a co2_amount.');
  }
  return { co2Amount: Number(manualCo2), unit: undefined, autoCalculated: false };
}

module.exports = { resolveCo2 };
