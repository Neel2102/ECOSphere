import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import settingsService from '../../services/settingsService';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';

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
    { key: 'source_type', title: 'Source', render: (r) => SOURCE_TYPES.find((s) => s.value === r.source_type)?.label || r.source_type },
    { key: 'reference', title: 'Reference / Notes' },
    { key: 'factor_name', title: 'Emission Factor' },
    { key: 'quantity', title: 'Quantity', render: (r) => `${r.quantity} ${r.unit || ''}` },
    { key: 'co2_amount', title: 'CO₂ Emitted', render: (r) => r.co2_amount ? `${Number(r.co2_amount).toFixed(2)} kg CO₂` : '—' },
    { key: 'department_name', title: 'Department' },
    { key: 'transaction_date', title: 'Log Date', render: (r) => r.transaction_date ? new Date(r.transaction_date).toLocaleDateString() : '—' },
    ...(canManage
      ? [
          {
            key: 'actions',
            title: '',
            render: (r) => <Button variant="danger" size="sm" onClick={() => remove(r.id)}>Delete</Button>,
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
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => setShowModal(true)}>+ Log Carbon Data</Button>
        )}
      </div>
      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Carbon Transaction"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>Log Transaction</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
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
          <div className="modal-form-row" style={{ marginTop: 14 }}>
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
          <div className="modal-form-row" style={{ marginTop: 14 }}>
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
