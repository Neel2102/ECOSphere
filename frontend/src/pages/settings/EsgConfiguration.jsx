import { useState, useEffect } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

function EsgConfiguration() {
  const { data, loading, error, refetch } = useApi(() => settingsService.getEsgConfig(), []);
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  const [save, { loading: saving }] = useMutation(async (values) => {
    await settingsService.updateEsgConfig(values);
    setSaved(true);
    refetch();
    setTimeout(() => setSaved(false), 3000);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (config) {
      const totalWeight = Number(config.weight_environmental) + Number(config.weight_social) + Number(config.weight_governance);
      if (totalWeight !== 100) {
        alert('Total weight sum must equal exactly 100%. Currently: ' + totalWeight + '%');
        return;
      }
      save({
        ...config,
        weight_environmental: Number(config.weight_environmental),
        weight_social: Number(config.weight_social),
        weight_governance: Number(config.weight_governance),
      });
    }
  };

  const handleWeightChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading && !config) {
    return (
      <div className="module-table-card" style={{ padding: 24 }}>
        <div className="skeleton skeleton--title" style={{ marginBottom: 20 }} />
        <div className="skeleton skeleton--text" style={{ height: 40, marginBottom: 14 }} />
        <div className="skeleton skeleton--text" style={{ height: 40, marginBottom: 14 }} />
      </div>
    );
  }

  const cfg = config || {};

  const toggleItems = [
    {
      key: 'auto_emission_calculation',
      label: 'Auto Emission Calculation',
      desc: 'Derive carbon output automatically from operational values using emission factor equations',
    },
    {
      key: 'evidence_requirement',
      label: 'Evidence Requirement',
      desc: 'Require employees to upload proof of evidence file before CSR activity participation can be approved',
    },
    {
      key: 'badge_auto_award',
      label: 'Badge Auto-Award',
      desc: 'Automatically trigger badge checks and awards when employee XP or completed challenge counts change',
    },
  ];

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      {saved && (
        <div className="page-error" style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
          ✅ ESG Configuration saved successfully!
        </div>
      )}
      <div className="module-table-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 20 }}>ESG Score Weightings</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="modal-form-field">
            <label>Environmental Weight (%)</label>
            <input required type="number" min="0" max="100" value={cfg.weight_environmental ?? 40} onChange={(e) => handleWeightChange('weight_environmental', e.target.value)} />
          </div>
          <div className="modal-form-field" style={{ marginTop: 6 }}>
            <label>Social Weight (%)</label>
            <input required type="number" min="0" max="100" value={cfg.weight_social ?? 30} onChange={(e) => handleWeightChange('weight_social', e.target.value)} />
          </div>
          <div className="modal-form-field" style={{ marginTop: 6 }}>
            <label>Governance Weight (%)</label>
            <input required type="number" min="0" max="100" value={cfg.weight_governance ?? 30} onChange={(e) => handleWeightChange('weight_governance', e.target.value)} />
          </div>

          {toggleItems.map((item) => (
            <div key={item.key} className="settings-toggle-row">
              <div className="settings-toggle-row__info">
                <div className="settings-toggle-row__label">{item.label}</div>
                <div className="settings-toggle-row__desc">{item.desc}</div>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={cfg[item.key] || false}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                />
                <span className="settings-switch__slider" />
              </label>
            </div>
          ))}

          <Button type="submit" variant="secondary" loading={saving} style={{ alignSelf: 'flex-start', marginTop: 12 }}>
            Save ESG Configuration
          </Button>
        </form>
      </div>
    </div>
  );
}

export default EsgConfiguration;
