import { useState, useEffect } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

const TOGGLES = [
  { key: 'notify_in_app', label: 'Push Notifications (In-App)', desc: 'Deliver instant notification alerts directly on the top bell popover' },
  { key: 'notify_email', label: 'Email Notifications', desc: 'Deliver notifications directly to your email inbox' },
  { key: 'notify_compliance', label: 'Compliance Notifications', desc: 'Trigger alerts when new audits are scheduled or overdue compliance issues arise' },
  { key: 'notify_approvals', label: 'Approval Queue Notifications', desc: 'Notify admins/managers when new employee participations or proof uploads are pending approval' },
  { key: 'notify_policy_reminders', label: 'Policy Acknowledgement Reminders', desc: 'Notify employees to acknowledge pending corporate ESG policies' },
  { key: 'notify_badge_unlocks', label: 'Badge Unlocks & Achievements', desc: 'Congratulate employees when they unlock gamification milestones' },
];

function NotificationSettings() {
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

  const handleToggle = (key, val) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (config) {
      save(config);
    }
  };

  if (loading && !config) {
    return (
      <div className="module-table-card" style={{ padding: 24 }}>
        <div className="skeleton skeleton--title" style={{ marginBottom: 20 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton skeleton--text" style={{ height: 40, marginBottom: 14 }} />
        ))}
      </div>
    );
  }

  const cfg = config || {};

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      {saved && (
        <div className="page-error" style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
          ✅ Notification Settings saved successfully!
        </div>
      )}

      <div className="module-table-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 20 }}>Channel & Notification Routing</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TOGGLES.map((t) => (
            <div key={t.key} className="settings-toggle-row">
              <div className="settings-toggle-row__info">
                <div className="settings-toggle-row__label">{t.label}</div>
                <div className="settings-toggle-row__desc">{t.desc}</div>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={cfg[t.key] || false}
                  onChange={(e) => handleToggle(t.key, e.target.checked)}
                />
                <span className="settings-switch__slider" />
              </label>
            </div>
          ))}

          <Button type="submit" variant="secondary" loading={saving} style={{ alignSelf: 'flex-start', marginTop: 16 }}>
            Save Channel Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default NotificationSettings;
