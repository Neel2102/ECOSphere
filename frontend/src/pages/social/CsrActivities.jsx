import { useState } from 'react';
import { FiMapPin, FiStar, FiUsers, FiTag, FiCalendar, FiCheck } from 'react-icons/fi';
import { useApi, useMutation } from '../../hooks/useApi';
import socialService from '../../services/socialService';
import settingsService from '../../services/settingsService';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';
import '../../styles/social/csr-activities.css';

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
        <div className="csr-card-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="csr-card csr-card--skeleton">
              <div className="skeleton skeleton--text" style={{ height: 18, width: '70%' }} />
              <div className="skeleton skeleton--text" style={{ height: 14, width: '50%', marginTop: 10 }} />
              <div className="skeleton skeleton--text" style={{ height: 14, width: '40%', marginTop: 6 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="csr-card-grid">
          {activities.map((activity) => (
            <div key={activity.id} className={`csr-card${activity.status === 'open' ? ' csr-card--open' : ''}`}>
              <div className="csr-card__accent" />
              <div className="csr-card__body">
                <div className="csr-card__top-row">
                  <StatusBadge status={activity.status} />
                  {activity.evidence_required && (
                    <span className="csr-card__evidence-badge">Evidence Required</span>
                  )}
                </div>
                <h4 className="csr-card__title">{activity.title}</h4>
                {activity.description && (
                  <p className="csr-card__desc">{activity.description}</p>
                )}
                <div className="csr-card__meta-grid">
                  {activity.category_name && (
                    <div className="csr-card__meta-item">
                      <FiTag size={13} />
                      <span>{activity.category_name}</span>
                    </div>
                  )}
                  <div className="csr-card__meta-item">
                    <FiUsers size={13} />
                    <span>{activity.joined_count || 0} joined</span>
                  </div>
                  {activity.location && (
                    <div className="csr-card__meta-item">
                      <FiMapPin size={13} />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  {activity.points > 0 && (
                    <div className="csr-card__meta-item csr-card__meta-item--points">
                      <FiStar size={13} />
                      <span>{activity.points} pts</span>
                    </div>
                  )}
                  {activity.activity_date && (
                    <div className="csr-card__meta-item">
                      <FiCalendar size={13} />
                      <span>{new Date(activity.activity_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="csr-card__footer">
                  <div className="csr-card__actions">
                    {!activity.joined_by_me && activity.status === 'open' && (
                      <Button variant="secondary" size="sm" loading={joining} onClick={() => join(activity.id)}>
                        Join
                      </Button>
                    )}
                    {activity.joined_by_me && (
                      <span className="csr-card__joined">
                        <FiCheck size={14} /> Joined
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <div className="csr-card__manage-actions">
                      <button
                        type="button"
                        className="action-icon-btn action-icon-btn--edit"
                        title="Edit"
                        onClick={() => openEdit(activity)}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn action-icon-btn--delete"
                        title="Delete"
                        onClick={() => remove(activity.id)}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
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
