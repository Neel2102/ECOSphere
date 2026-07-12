import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';

const SOURCE_TYPES = ['purchase', 'manufacturing', 'fleet', 'expense'];

function EmissionFactors() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', source_type: 'purchase', unit: '', factor_value: '', status: 'active' });
  const [q, setQ] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => environmentalService.listEmissionFactors({ q }),
    [q]
  );

  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) {
      await environmentalService.updateEmissionFactor(editItem.id, values);
    } else {
      await environmentalService.createEmissionFactor(values);
    }
    refetch();
    setShowModal(false);
    setEditItem(null);
    setForm({ name: '', source_type: 'purchase', unit: '', factor_value: '', status: 'active' });
  });

  const [remove, { loading: removing }] = useMutation(async (id) => {
    if (!window.confirm('Delete this emission factor?')) return;
    await environmentalService.deleteEmissionFactor(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      source_type: item.source_type,
      unit: item.unit,
      factor_value: item.factor_value,
      status: item.status || 'active',
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'source_type', title: 'Source Type' },
    { key: 'factor_value', title: 'CO₂ / Unit', render: (r) => `${r.factor_value} kg` },
    { key: 'unit', title: 'Unit' },
    { key: 'status', title: 'Status', render: (r) => <span className={`status-badge status-badge--${r.status}`}>{r.status}</span> },
    ...(canManage
      ? [
          {
            key: 'actions',
            title: '',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => remove(r.id)} loading={removing}>Delete</Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    save({ ...form, factor_value: Number(form.factor_value) });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}

      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', source_type: 'purchase', unit: '', factor_value: '', status: 'active' }); setShowModal(true); }}>
            + New Factor
          </Button>
        )}
        <div className="module-toolbar__right">
          <div className="module-search">
            <span>🔍</span>
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Emission Factor' : 'New Emission Factor'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>
              {editItem ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Factor Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Purchased steel" />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Source Type *</label>
              <select required value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
                {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-form-field">
              <label>CO₂ per Unit (kg) *</label>
              <input required type="number" step="0.0001" value={form.factor_value} onChange={(e) => setForm({ ...form, factor_value: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Unit *</label>
              <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. kg, litre, kWh, km" />
            </div>
            <div className="modal-form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EmissionFactors;
