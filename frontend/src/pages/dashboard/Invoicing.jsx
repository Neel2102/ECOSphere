import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import settingsService from '../../services/settingsService';
import Card from '../../components/common/Card/Card';
import Table from '../../components/common/Table/Table';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import '../../styles/dashboard/invoicing.css';

function Invoicing() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    reference: '',
    emission_factor_id: '',
    department_id: '',
    quantity: '',
  });

  const { data, loading, error, refetch } = useApi(() => environmentalService.listCarbonTransactions(), []);
  const { data: factorData } = useApi(() => environmentalService.listEmissionFactors(), []);
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);

  // Filter only expense source transactions
  const items = (data?.items || data || []).filter((tx) => tx.source_type === 'expense');
  const expenseFactors = (factorData?.items || factorData || []).filter((f) => f.source_type === 'expense');
  const departments = deptData?.items || deptData || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    await environmentalService.createCarbonTransaction({
      ...values,
      source_type: 'expense',
    });
    refetch();
    setShowModal(false);
    setForm({ reference: '', emission_factor_id: '', department_id: '', quantity: '' });
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    save({
      ...form,
      quantity: Number(form.quantity),
      emission_factor_id: Number(form.emission_factor_id),
      department_id: Number(form.department_id),
    });
  };

  const columns = [
    { key: 'reference', title: 'Invoice / Expense Reference' },
    { key: 'factor_name', title: 'Expense Activity' },
    { key: 'quantity', title: 'Activity Scope', render: (r) => `${r.quantity} ${r.unit || ''}` },
    { key: 'co2_amount', title: 'Calculated CO₂', render: (r) => r.co2_amount ? `${Number(r.co2_amount).toFixed(2)} kg CO₂` : '—' },
    { key: 'department_name', title: 'Department' },
    { key: 'transaction_date', title: 'Log Date', render: (r) => r.transaction_date ? new Date(r.transaction_date).toLocaleDateString() : '—' },
  ];

  return (
    <div style={{ padding: '4px 8px' }}>
      {error && <div className="page-error">⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <Card flat style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 6 }}>💳 Business Expenses & Invoicing Carbon Logs</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-soft)', marginBottom: 20 }}>
            Record air travel invoices, local mileage, hotel stays, and operational utility expense details to calculate associated Scope 3 greenhouse gas footprints.
          </p>
          <Button variant="secondary" onClick={() => setShowModal(true)}>+ Log Travel / Utility Invoice</Button>
        </Card>
        <Card flat style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-soft)', fontWeight: 600 }}>Total Expense CO₂</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-accent)', marginTop: 4 }}>
            {items.reduce((sum, r) => sum + Number(r.co2_amount || 0), 0).toFixed(1)} kg
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginTop: 2 }}>From {items.length} logged invoices</div>
        </Card>
      </div>

      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Travel or Utility Invoice"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>Log Invoice</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Invoice / Reference Code *</label>
            <input required value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. INV-9002 Flight Travel" />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Expense Factor (Target) *</label>
              <select required value={form.emission_factor_id} onChange={(e) => setForm({ ...form, emission_factor_id: e.target.value })}>
                <option value="">— Select Factor —</option>
                {expenseFactors.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.factor_value} kg/{f.unit})</option>
                ))}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Department Scope *</label>
              <select required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">— Select Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Quantity (km travelled, kWh, etc.) *</label>
            <input required type="number" step="0.0001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 1500" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Invoicing;
