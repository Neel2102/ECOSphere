import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import gamificationService from '../../services/gamificationService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

function Rewards() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', xp_cost: '', quantity: '' });

  const { data, loading, error, refetch } = useApi(() => gamificationService.listRewards(), []);
  const rewards = data?.items || data || [];

  const { data: xpData } = useApi(() => gamificationService.getMyXp(), []);
  const myXp = xpData?.xp || 0;

  const [save, { loading: saving }] = useMutation(async (values) => {
    await gamificationService.createReward(values);
    refetch();
    setShowModal(false);
    setForm({ name: '', description: '', xp_cost: '', quantity: '' });
  });

  const [redeem, { loading: redeeming }] = useMutation(async (id) => {
    await gamificationService.redeemReward(id);
    alert('Reward redeemed! 🎉');
    refetch();
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this reward?')) return;
    await gamificationService.deleteReward(id);
    refetch();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    save({ ...form, xp_cost: Number(form.xp_cost), quantity: form.quantity ? Number(form.quantity) : null });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}

      <div className="module-toolbar">
        <div style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))', color: '#fff', padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
          ⭐ My XP: {myXp}
        </div>
        {canManage && (
          <Button variant="secondary" onClick={() => setShowModal(true)}>+ New Reward</Button>
        )}
      </div>

      <div className="card-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="activity-card" style={{ height: 140 }}>
                <div className="skeleton skeleton--text" style={{ height: 20 }} />
                <div className="skeleton skeleton--text" style={{ height: 14, marginTop: 8, width: '60%' }} />
              </div>
            ))
          : rewards.map((reward) => (
              <div key={reward.id} className="activity-card">
                <div className="activity-card__title">🎁 {reward.name}</div>
                {reward.description && (
                  <div className="activity-card__meta">{reward.description}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-secondary)' }}>⭐ {reward.xp_cost} XP</span>
                  {reward.quantity != null && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>({reward.quantity} left)</span>
                  )}
                </div>
                <div className="activity-card__footer" style={{ marginTop: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={redeeming}
                    disabled={myXp < reward.xp_cost}
                    onClick={() => redeem(reward.id)}
                  >
                    Redeem
                  </Button>
                  {canManage && (
                    <Button variant="danger" size="sm" onClick={() => remove(reward.id)}>Delete</Button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {rewards.length === 0 && !loading && (
        <div className="module-table-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>
          No rewards available yet.
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Reward"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>Create</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Reward Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>XP Cost *</label>
              <input required type="number" value={form.xp_cost} onChange={(e) => setForm({ ...form, xp_cost: e.target.value })} />
            </div>
            <div className="modal-form-field">
              <label>Quantity (blank = unlimited)</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Rewards;
