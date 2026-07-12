import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import socialService from '../../services/socialService';
import settingsService from '../../services/settingsService';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{status}</span>;
}

function CsrActivities() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', activity_date: '', location: '', points: '', evidence_required: false, status: 'open' });

  const { data, loading, error, refetch } = useApi(() => socialService.listActivities(), []);
  const { data: catData } = useApi(() => settingsService.listCategories(), []);

  const activities = data?.items || data || [];
  const categories = catData?.items || catData || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await socialService.updateActivity(editItem.id, values);
    else await socialService.createActivity(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [join, { loading: joining }] = useMutation(async (id) => {
    await socialService.joinActivity(id);
    refetch();
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    await socialService.deleteActivity(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      activity_date: item.activity_date ? item.activity_date.substring(0, 10) : '',
      location: item.location || '',
      points: item.points || '',
      category_id: item.category_id || '',
      evidence_required: item.evidence_required || false,
      status: item.status || 'open',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    save({ ...form, points: form.points ? Number(form.points) : 0, category_id: form.category_id || null });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}

      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ title: '', description: '', activity_date: '', location: '', points: '', evidence_required: false, status: 'open' }); setShowModal(true); }}>
            + New Activity
          </Button>
        )}
      </div>

      {/* Activity Cards */}
      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="activity-card">
              <div className="skeleton skeleton--text" style={{ height: 18, width: '70%' }} />
              <div className="skeleton skeleton--text" style={{ height: 14, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card-grid">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-card__title">
                {activity.category_name ? `🏷️ ` : '🤝 '}{activity.title}
              </div>
              <div className="activity-card__meta">
                👥 {activity.joined_count || 0} joined
                {activity.evidence_required && ' • Evidence Required'}
              </div>
              {activity.location && (
                <div className="activity-card__meta">📍 {activity.location}</div>
              )}
              {activity.points > 0 && (
                <div className="activity-card__meta">⭐ {activity.points} pts</div>
              )}
              <div className="activity-card__footer">
                <StatusBadge status={activity.status} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {!activity.joined_by_me && activity.status === 'open' && (
                    <Button variant="secondary" size="sm" loading={joining} onClick={() => join(activity.id)}>
                      Join
                    </Button>
                  )}
                  {activity.joined_by_me && (
                    <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>✓ Joined</span>
                  )}
                  {canManage && (
                    <>
                      <Button variant="neutral" size="sm" onClick={() => openEdit(activity)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => remove(activity.id)}>Del</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length === 0 && !loading && (
        <div className="module-table-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>
          No CSR activities yet. {canManage && 'Create one to get started.'}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Activity' : 'New CSR Activity'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Category</label>
              <select value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="evidence_required">Evidence Required</option>
              </select>
            </div>
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Activity Date</label>
              <input type="date" value={form.activity_date} onChange={(e) => setForm({ ...form, activity_date: e.target.value })} />
            </div>
            <div className="modal-form-field">
              <label>Points</label>
              <input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <input type="checkbox" id="evidReq" checked={form.evidence_required}
              onChange={(e) => setForm({ ...form, evidence_required: e.target.checked })} />
            <label htmlFor="evidReq" style={{ fontSize: 13, color: 'var(--color-text)' }}>Evidence Required</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CsrActivities;
