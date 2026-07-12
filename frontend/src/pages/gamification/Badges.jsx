import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import gamificationService from '../../services/gamificationService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import '../../styles/common/module.css';

const BADGE_EMOJIS = ['🏆', '🌟', '💚', '♻️', '🌱', '💡', '🤝', '🎯'];

function Badges() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '🏆', criteria: '' });

  const { data, loading, error, refetch } = useApi(() => gamificationService.listBadges(), []);
  const badges = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    await gamificationService.createBadge(values);
    refetch();
    setShowModal(false);
    setForm({ name: '', description: '', icon: '🏆', criteria: '' });
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this badge?')) return;
    await gamificationService.deleteBadge(id);
    refetch();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    save(form);
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => setShowModal(true)}>+ New Badge</Button>
        )}
      </div>

      {/* Badge Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="activity-card" style={{ height: 120 }}>
                <div className="skeleton skeleton--text" style={{ height: 40, width: 40, borderRadius: '50%' }} />
                <div className="skeleton skeleton--text" style={{ height: 16, marginTop: 12 }} />
              </div>
            ))
          : badges.map((badge) => (
              <div key={badge.id} className="activity-card" style={{ alignItems: 'center', textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.icon || '🏆'}</div>
                <div className="activity-card__title" style={{ textAlign: 'center' }}>{badge.name}</div>
                {badge.description && (
                  <div className="activity-card__meta" style={{ textAlign: 'center', marginTop: 4 }}>{badge.description}</div>
                )}
                {badge.criteria && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginTop: 4 }}>📋 {badge.criteria}</div>
                )}
                {canManage && (
                  <Button variant="ghost-danger" size="sm" className="btn--icon-only" style={{ marginTop: 12 }} onClick={() => remove(badge.id)} title="Delete"><Icon name="trash" size={15} /></Button>
                )}
              </div>
            ))}
      </div>

      {badges.length === 0 && !loading && (
        <div className="module-table-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>
          No badges created yet.
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Badge"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>Create</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Badge Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Icon</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
              {BADGE_EMOJIS.map((emoji) => (
                <button key={emoji} type="button"
                  style={{ fontSize: 24, padding: '6px 10px', borderRadius: 8, border: `2px solid ${form.icon === emoji ? 'var(--color-secondary)' : 'var(--color-surface-dim)'}`, cursor: 'pointer', background: 'var(--color-surface)' }}
                  onClick={() => setForm({ ...form, icon: emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Criteria</label>
            <input value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} placeholder="e.g. Complete 5 challenges" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Badges;
