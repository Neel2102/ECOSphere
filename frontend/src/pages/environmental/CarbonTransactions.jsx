import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import settingsService from '../../services/settingsService';
import Card from '../../components/common/Card/Card';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';
import '../../styles/environmental/carbon-transactions.css';

const SOURCE_TYPES = [
  { value: 'purchase', label: 'Purchase Operations' },
  { value: 'manufacturing', label: 'Manufacturing Operations' },
  { value: 'fleet', label: 'Logistics Fleet Operations' },
  { value: 'expense', label: 'Business Expenses / Travel' },
  { value: 'manual', label: 'Manual Carbon Log' },
];

function CarbonTransactions() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [form, setForm] = useState({
    source_type: 'purchase',
    reference: '',
    emission_factor_id: '',
    department_id: '',
    quantity: '',
    transaction_date: new Date().toISOString().substring(0, 10),
  });

  const { data, loading, error, refetch } = useApi(() => environmentalService.listCarbonTransactions(), []);
  const { data: factorData } = useApi(() => environmentalService.listEmissionFactors(), []);
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);

  const items = data?.items || data || [];
  const factors = factorData?.items || factorData || [];
  const departments = deptData?.items || deptData || [];

  const filteredItems = items.filter(
    (item) =>
      !filter ||
      item.source_type?.toLowerCase().includes(filter.toLowerCase()) ||
      item.reference?.toLowerCase().includes(filter.toLowerCase()) ||
      item.department_name?.toLowerCase().includes(filter.toLowerCase())
  );

  const [save, { loading: saving }] = useMutation(async (values) => {
    await environmentalService.createCarbonTransaction(values);
    refetch();
    setShowModal(false);
    setForm({
      source_type: 'purchase',
      reference: '',
      emission_factor_id: '',
      department_id: '',
      quantity: '',
      transaction_date: new Date().toISOString().substring(0, 10),
    });
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await environmentalService.deleteCarbonTransaction(id);
    refetch();
  });

  const columns = [
    {
      key: 'source_type',
      title: 'Source',
      render: (r) => (
        <span className="carbon-source">
          {SOURCE_TYPES.find((s) => s.value === r.source_type)?.label || r.source_type}
        </span>
      ),
    },
    { key: 'reference', title: 'Reference / Notes' },
    { key: 'factor_name', title: 'Emission Factor' },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (r) => `${r.quantity} ${r.unit || ''}`,
    },
    {
      key: 'co2_amount',
      title: 'CO₂ Emitted',
      render: (r) => (
        <span className="carbon-amount">{r.co2_amount ? `${Number(r.co2_amount).toFixed(2)} kg CO₂` : '—'}</span>
      ),
    },
    { key: 'department_name', title: 'Department' },
    {
      key: 'transaction_date',
      title: 'Log Date',
      render: (r) => (r.transaction_date ? new Date(r.transaction_date).toLocaleDateString() : '—'),
    },
    ...(canManage
      ? [
          {
            key: 'actions',
            title: '',
            align: 'right',
            width: 56,
            render: (r) => (
              <button
                type="button"
                className="carbon-row-menu"
                onClick={() => remove(r.id)}
                aria-label="Delete transaction"
              >
                <Icon name="trash" size={16} />
              </button>
            ),
          },
        ]
      : []),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    save({
      ...form,
      quantity: Number(form.quantity),
      emission_factor_id: form.emission_factor_id ? Number(form.emission_factor_id) : null,
      department_id: form.department_id ? Number(form.department_id) : null,
    });
  };

  return (
    <div className="carbon-transactions">
      {error && <div className="page-error">⚠️ {error}</div>}
      
      <Card flat padding="none" className="carbon-card">
        <div className="carbon-toolbar">
          <div className="module-filter">
            <Icon name="filter" size={16} className="module-filter-icon" />
            <input
              type="search"
              placeholder="Filter carbon transactions"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter carbon transactions"
            />
            <button type="button" className="module-filter-settings" aria-label="Filter settings">
              <Icon name="sliders" size={16} />
            </button>
          </div>

          {canManage && (
            <Button
              variant="indigo"
              iconLeft={<Icon name="plus" size={16} strokeWidth={2.4} />}
              onClick={() => setShowModal(true)}
            >
              Log Carbon Data
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          data={filteredItems}
          rowKey="id"
          loading={loading}
          skeletonRows={8}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          empty={
            <EmptyState
              icon="leaf"
              title="No carbon transactions found"
              message="Try a different filter, or log your first carbon transaction."
              action={
                filter ? (
                  <Button variant="secondary" size="sm" onClick={() => setFilter('')}>
                    Clear filter
                  </Button>
                ) : null
              }
            />
          }
        />
      </Card>

      {/* Floating bulk-action bar */}
      {selectedKeys.length > 0 && (
        <div className="module-bulkbar" role="toolbar" aria-label="Bulk actions">
          <button
            type="button"
            className="module-bulkbar-clear"
            onClick={() => setSelectedKeys([])}
            aria-label="Clear selection"
          >
            <Icon name="x" size={16} />
          </button>
          <span className="module-bulkbar-count">{selectedKeys.length}</span>
          <span className="module-bulkbar-text">items selected</span>

          <div className="module-bulkbar-actions">
            <button type="button" className="module-bulkbar-btn">
              <Icon name="dots" size={16} /> More
            </button>
            <button type="button" className="module-bulkbar-btn">
              <Icon name="edit" size={16} /> Edit
            </button>
            <button
              type="button"
              className="module-bulkbar-btn module-bulkbar-btn--danger"
              onClick={() => {
                if (window.confirm(`Delete ${selectedKeys.length} transaction${selectedKeys.length > 1 ? 's' : ''}?`)) {
                  selectedKeys.forEach(id => remove(id));
                  setSelectedKeys([]);
                }
              }}
            >
              <Icon name="trash" size={16} /> Delete
            </button>
          </div>
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Carbon Transaction"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>Log Transaction</Button>
          </div>
        }
      >
        <form id="carbon-form" className="carbon-form" onSubmit={handleSubmit}>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label>Source Type *</label>
              <select required value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
                {SOURCE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Reference / Notes *</label>
              <input required value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. Electric invoice Q1" />
            </div>
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label>Emission Factor (multiplier) *</label>
              <select required value={form.emission_factor_id} onChange={(e) => setForm({ ...form, emission_factor_id: e.target.value })}>
                <option value="">— Select Factor —</option>
                {factors.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.factor_value} kg CO₂/{f.unit})</option>
                ))}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Department *</label>
              <select required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">— Select Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label>Quantity *</label>
              <input required type="number" step="0.0001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 2400" />
            </div>
            <div className="modal-form-field">
              <label>Log Date *</label>
              <input required type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CarbonTransactions;
