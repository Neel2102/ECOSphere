import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import gamificationService from '../../services/gamificationService';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import '../../styles/common/module.css';

const STATUSES = ['draft', 'active', 'under_review', 'completed', 'archived'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const STATUS_COLORS = {
  draft: 'var(--color-neutral)',
  active: 'var(--color-success)',
  under_review: 'var(--color-warning)',
  completed: 'var(--color-secondary)',
  archived: 'var(--color-accent)',
};

function StatusPill({ status }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status] }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

// Allowed lifecycle transitions (mirrors the backend rules).
const TRANSITIONS = {
  draft: ['active', 'archived'],
  active: ['under_review', 'archived'],
  under_review: ['completed', 'active', 'archived'],
  completed: ['archived'],
  archived: [],
};

function Challenges() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [activeStatus, setActiveStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', xp: '', difficulty: 'medium', deadline: '', evidence_required: false, category_id: '' });

  const { data, loading, error, refetch } = useApi(
    () => gamificationService.listChallenges({ status: activeStatus }),
    [activeStatus]
  );
  const { data: catData } = useApi(() => settingsService.listCategories(), []);

  const challenges = data?.items || [];
  const statusCounts = data?.statusCounts || [];
  const categories = catData?.items || catData || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await gamificationService.updateChallenge(editItem.id, values);
    else await gamificationService.createChallenge(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [join, { loading: joining }] = useMutation(async (id) => {
    await gamificationService.joinChallenge(id);
    refetch();
  });

  const [changeStatus, { error: statusError }] = useMutation(async (id, status) => {
    const result = await gamificationService.changeStatus(id, status);
    refetch();
    setDetailItem((current) =>
      current && current.id === id ? { ...current, status } : current
    );
    return result;
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description || '', xp: item.xp, difficulty: item.difficulty, deadline: item.deadline ? item.deadline.substring(0, 10) : '', evidence_required: item.evidence_required, category_id: item.category_id || '' });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    save({ ...form, xp: Number(form.xp), category_id: form.category_id || null });
  };

  const countFor = (s) => statusCounts.find((c) => c.status === s)?.count || 0;

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}

      {/* Status pipeline */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', background: 'var(--color-surface)', padding: 8, borderRadius: 12, boxShadow: 'var(--shadow-raised-sm)' }}>
        <button
          className={`status-pipeline-btn${activeStatus === '' ? ' is-active' : ''}`}
          style={{
            flex: 1,
            minWidth: 80,
            padding: '8px 12px',
            fontSize: 12.5,
            fontWeight: activeStatus === '' ? 'bold' : '500',
            borderRadius: 8,
            color: activeStatus === '' ? 'var(--color-white)' : 'var(--color-text-soft)',
            background: activeStatus === '' ? 'var(--color-secondary)' : 'transparent',
            transition: 'all var(--transition-fast)',
          }}
          onClick={() => setActiveStatus('')}
        >
          All
        </button>
        {STATUSES.map((s) => {
          const isActive = activeStatus === s;
          const themeColor = STATUS_COLORS[s] || 'var(--color-neutral)';
          return (
            <button
              key={s}
              className={`status-pipeline-btn${isActive ? ' is-active' : ''}`}
              style={{
                flex: 1,
                minWidth: 80,
                padding: '8px 12px',
                fontSize: 12.5,
                fontWeight: isActive ? 'bold' : '500',
                borderRadius: 8,
                color: isActive ? 'var(--color-white)' : 'var(--color-text-soft)',
                background: isActive ? themeColor : 'transparent',
                transition: 'all var(--transition-fast)',
              }}
              onClick={() => setActiveStatus(s)}
            >
              <span style={{ textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</span> {countFor(s) > 0 ? `(${countFor(s)})` : ''}
            </button>
          );
        })}
      </div>

      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ title: '', description: '', xp: '', difficulty: 'medium', deadline: '', evidence_required: false, category_id: '' }); setShowModal(true); }}>
            + New Challenge
          </Button>
        )}
      </div>

      {/* Challenge Cards */}
      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="activity-card">
              <div className="skeleton skeleton--text" style={{ height: 18, width: '70%' }} />
              <div className="skeleton skeleton--text" style={{ height: 14, width: '50%', marginTop: 8 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card-grid">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className="activity-card"
              style={{ borderLeft: `4px solid ${STATUS_COLORS[ch.status] || 'transparent'}`, cursor: 'pointer' }}
              onClick={() => setDetailItem(ch)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDetailItem(ch)}
            >
              <div className="activity-card__title">🏆 {ch.title}</div>
              <div className="activity-card__meta">
                XP: {ch.xp} • {ch.difficulty?.toUpperCase()}
              </div>
              {ch.deadline && (
                <div className="activity-card__meta">📅 Deadline: {new Date(ch.deadline).toLocaleDateString()}</div>
              )}
              <div className="activity-card__meta">👥 {ch.participant_count || 0} joined</div>
              <div className="activity-card__footer" onClick={(e) => e.stopPropagation()}>
                <StatusPill status={ch.status} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {!ch.joined_by_me && ch.status === 'active' && (
                    <Button variant="secondary" size="sm" loading={joining} onClick={() => join(ch.id)}>
                      Join Challenge
                    </Button>
                  )}
                  {ch.joined_by_me && (
                    <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>✓ Joined</span>
                  )}
                  {canManage && (
                    <Button variant="ghost-edit" size="sm" className="btn--icon-only" onClick={() => openEdit(ch)} title="Edit"><Icon name="edit" size={15} /></Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {challenges.length === 0 && !loading && (
        <div className="module-table-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>
          No challenges found.
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Challenge' : 'New Challenge'} size="lg"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Challenge Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>XP Reward *</label>
              <input required type="number" value={form.xp} onChange={(e) => setForm({ ...form, xp: e.target.value })} />
            </div>
            <div className="modal-form-field">
              <label>Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <input type="checkbox" id="evidReqC" checked={form.evidence_required}
              onChange={(e) => setForm({ ...form, evidence_required: e.target.checked })} />
            <label htmlFor="evidReqC" style={{ fontSize: 13, color: 'var(--color-text)' }}>Evidence Required</label>
          </div>
        </form>
      </Modal>

      {/* Challenge details popup */}
      <Modal
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={detailItem ? `🏆 ${detailItem.title}` : ''}
        size="md"
        footer={
          detailItem && (
            <div className="modal-footer-btns">
              {!detailItem.joined_by_me && detailItem.status === 'active' && (
                <Button
                  loading={joining}
                  onClick={() => join(detailItem.id).then(() => setDetailItem({ ...detailItem, joined_by_me: true, participant_count: (detailItem.participant_count || 0) + 1 })).catch(() => {})}
                >
                  Join Challenge
                </Button>
              )}
              {canManage && (
                <Button variant="neutral" onClick={() => { setDetailItem(null); openEdit(detailItem); }}>
                  Edit
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(`Delete challenge "${detailItem.title}"? This cannot be undone.`)) {
                      gamificationService.deleteChallenge(detailItem.id)
                        .then(() => { setDetailItem(null); refetch(); })
                        .catch(() => {});
                    }
                  }}
                >
                  Delete
                </Button>
              )}
              <Button variant="neutral" onClick={() => setDetailItem(null)}>Close</Button>
            </div>
          )
        }
      >
        {detailItem && (
          <div className="challenge-detail">
            {statusError && <div className="page-error">⚠️ {statusError}</div>}

            <div className="challenge-detail__grid">
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">Status</span>
                <StatusPill status={detailItem.status} />
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">XP Reward</span>
                <strong>{detailItem.xp} XP</strong>
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">Difficulty</span>
                <strong style={{ textTransform: 'capitalize' }}>{detailItem.difficulty}</strong>
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">Deadline</span>
                <strong>{detailItem.deadline ? new Date(detailItem.deadline).toLocaleDateString() : 'No deadline'}</strong>
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">Category</span>
                <strong>{detailItem.category_name || '—'}</strong>
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">Participants</span>
                <strong>{detailItem.participant_count || 0} joined</strong>
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">Evidence</span>
                <strong>{detailItem.evidence_required ? 'Proof required' : 'Optional'}</strong>
              </div>
              <div className="challenge-detail__item">
                <span className="challenge-detail__label">My participation</span>
                <strong>{detailItem.joined_by_me ? '✓ Joined' : 'Not joined yet'}</strong>
              </div>
            </div>

            <div className="challenge-detail__desc">
              <span className="challenge-detail__label">Description</span>
              <p>{detailItem.description || 'No description provided.'}</p>
            </div>

            {canManage && (TRANSITIONS[detailItem.status] || []).length > 0 && (
              <div className="challenge-detail__lifecycle">
                <span className="challenge-detail__label">Move to</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {TRANSITIONS[detailItem.status].map((next) => (
                    <Button key={next} size="sm" variant="secondary"
                      onClick={() => changeStatus(detailItem.id, next).catch(() => {})}>
                      {next.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Challenges;
