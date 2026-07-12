import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import '../../styles/common/module.css';

const TABS = [
  { label: '🏢 Departments', key: 'departments' },
  { label: '🏷️ Categories', key: 'categories' },
  { label: '⚙️ ESG Configuration', key: 'esg-config' },
];

function DepartmentsTab() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });

  const { data, loading, error, refetch } = useApi(() => settingsService.listDepartments(), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await settingsService.updateDepartment(editItem.id, values);
    else await settingsService.createDepartment(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete department?')) return;
    await settingsService.deleteDepartment(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', status: item.status || 'active' });
    setShowModal(true);
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', description: '', status: 'active' }); setShowModal(true); }}>
          + New Department
        </Button>
      </div>
      <div className="module-table-card">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-surface-dim)' }}>
              <div className="skeleton skeleton--text" style={{ height: 16, width: '40%' }} />
            </div>
          ))
        ) : items.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>No departments yet.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th className="tbl__th">Name</th>
                <th className="tbl__th">Description</th>
                <th className="tbl__th">Status</th>
                <th className="tbl__th"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="tbl__row">
                  <td className="tbl__td" style={{ fontWeight: 600 }}>{d.name}</td>
                  <td className="tbl__td">{d.description || '—'}</td>
                  <td className="tbl__td"><span className={`status-badge status-badge--${d.status}`}>{d.status}</span></td>
                  <td className="tbl__td">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" size="sm" onClick={() => openEdit(d)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => remove(d.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Department' : 'New Department'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={(e) => { e.preventDefault(); save(form); }}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <div className="modal-form-field">
          <label>Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="modal-form-field" style={{ marginTop: 14 }}>
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="modal-form-field" style={{ marginTop: 14 }}>
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}

function CategoriesTab() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data, loading, error, refetch } = useApi(() => settingsService.listCategories(), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await settingsService.updateCategory(editItem.id, values);
    else await settingsService.createCategory(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete category?')) return;
    await settingsService.deleteCategory(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '' });
    setShowModal(true);
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', description: '' }); setShowModal(true); }}>
          + New Category
        </Button>
      </div>
      <div className="module-table-card">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-surface-dim)' }}>
              <div className="skeleton skeleton--text" style={{ height: 16, width: '30%' }} />
            </div>
          ))
        ) : items.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>No categories yet.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th className="tbl__th">Name</th>
                <th className="tbl__th">Description</th>
                <th className="tbl__th"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="tbl__row">
                  <td className="tbl__td" style={{ fontWeight: 600 }}>🏷️ {c.name}</td>
                  <td className="tbl__td">{c.description || '—'}</td>
                  <td className="tbl__td">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => remove(c.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Category' : 'New Category'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={(e) => { e.preventDefault(); save(form); }}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <div className="modal-form-field">
          <label>Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="modal-form-field" style={{ marginTop: 14 }}>
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

function EsgConfigTab() {
  const { data, loading, error, refetch } = useApi(() => settingsService.getEsgConfig(), []);
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);

  const cfg = config ?? data ?? {};

  const [save, { loading: saving }] = useMutation(async (values) => {
    await settingsService.updateEsgConfig(values);
    setSaved(true);
    refetch();
    setTimeout(() => setSaved(false), 3000);
  });

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      {saved && <div className="page-error" style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>✅ Settings saved!</div>}
      <div className="module-table-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 20 }}>ESG Platform Configuration</h3>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton skeleton--text" style={{ height: 40, marginBottom: 14 }} />
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-surface-dim)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-heading)' }}>Evidence Requirement</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>Require evidence for CSR approvals</div>
              </div>
              <input type="checkbox" checked={cfg.evidence_requirement || false}
                onChange={(e) => setConfig({ ...cfg, evidence_requirement: e.target.checked })}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-surface-dim)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-heading)' }}>Email Notifications</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>Send email notifications to employees</div>
              </div>
              <input type="checkbox" checked={cfg.email_notifications || false}
                onChange={(e) => setConfig({ ...cfg, email_notifications: e.target.checked })}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </div>
            <Button variant="secondary" loading={saving} style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => save(cfg)}>
              Save Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div>
      <nav className="module-tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`module-tab${activeTab === t.key ? ' is-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'esg-config' && <EsgConfigTab />}
    </div>
  );
}

export default Settings;
