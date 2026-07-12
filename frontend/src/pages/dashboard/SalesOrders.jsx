import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card/Card';
import Table from '../../components/common/Table/Table';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Modal from '../../components/common/Modal/Modal';
import Popup from '../../components/common/Popup/Popup';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import '../../styles/dashboard/sales-orders.css';

const STATUS = {
  fulfilled: { label: 'Fulfilled', variant: 'success' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  partial: { label: 'Partially shipped', variant: 'warning' },
};

// The ten orders from the reference design, verbatim.
const BASE_ORDERS = [
  { id: 'SO-00003', company: 'Gaspar Antunes', status: 'fulfilled', total: 2674.56, created: 'May 10, 2019', updated: 'Today' },
  { id: 'SO-00004', company: 'Trienke van Aartsen', status: 'confirmed', total: 1478.48, created: 'May 12, 2019', updated: 'Yesterday' },
  { id: 'SO-00005', company: 'Trashae Hubbard', status: 'partial', total: 245.12, created: 'May 14, 2019', updated: 'Jun 12, 2019' },
  { id: 'SO-00006', company: 'Tongbang Jun-Seo', status: 'fulfilled', total: 122.18, created: 'May 14, 2019', updated: 'Jun 14, 2019' },
  { id: 'SO-00007', company: 'Ngô Hải Giang', status: 'confirmed', total: 199.78, created: 'May 16, 2019', updated: 'Jun 24, 2019' },
  { id: 'SO-00008', company: 'Miglena Tadic', status: 'confirmed', total: 16789.72, created: 'May 18, 2019', updated: 'Jun 01, 2019' },
  { id: 'SO-00009', company: 'Leslee Moss', status: 'partial', total: 457.45, created: 'May 19, 2019', updated: 'May 12, 2019' },
  { id: 'SO-00010', company: 'Jacqueline Likoki', status: 'fulfilled', total: 4411.96, created: 'May 18, 2019', updated: 'Jun 08, 2019' },
  { id: 'SO-00011', company: 'Dai Jiang', status: 'fulfilled', total: 2784.23, created: 'May 21, 2019', updated: 'Jun 24, 2019' },
  { id: 'SO-00012', company: 'Clarke Gillebert', status: 'partial', total: 2674.56, created: 'May 24, 2019', updated: 'Jul 09, 2019' },
];

const EXTRA_COMPANIES = [
  'Amara Okafor', 'Bram de Vries', 'Chiara Ricci', 'Deniz Yilmaz', 'Emeka Eze',
  'Freja Lindqvist', 'Goran Petrović', 'Hana Suzuki', 'Iris Papadopoulos', 'Jonas Berg',
  'Katya Ivanova', 'Luca Moretti', 'Maya Patel', 'Nikolaj Sørensen', 'Oona Virtanen',
  'Pablo Herrera', 'Qi Wei', 'Rosa Almeida', 'Samir Haddad', 'Tereza Nováková', 'Umut Aydin',
];

// Deterministic mock dataset (73 orders) whose tab totals match the
// reference design: All 73, Active 21, To invoice 18, To ship 36.
function buildOrders() {
  const orders = [...BASE_ORDERS];
  const months = ['May', 'Jun', 'Jul'];
  for (let index = 0; orders.length < 73; index += 1) {
    const number = 13 + index;
    // 15 of the generated orders stay open, joining the 6 open base orders.
    const open = index < 30 && index % 2 === 0;
    orders.push({
      id: `SO-${String(number).padStart(5, '0')}`,
      company: EXTRA_COMPANIES[index % EXTRA_COMPANIES.length],
      status: open ? (index % 4 === 0 ? 'confirmed' : 'partial') : 'fulfilled',
      total: Math.round(((index * 761) % 9000 + 120) * 100 + (index * 37) % 100) / 100,
      created: `${months[index % 3]} ${(index % 27) + 1}, 2019`,
      updated: `${months[(index + 1) % 3]} ${((index * 7) % 27) + 1}, 2019`,
    });
  }

  // Mock invoice/shipping queues with exact reference counts.
  let invoiceQuota = 18;
  let shipQuota = 36;
  orders.forEach((order, index) => {
    order.toInvoice = invoiceQuota > 0 && index % 4 === 1;
    if (order.toInvoice) invoiceQuota -= 1;
    order.toShip = shipQuota > 0 && (order.status !== 'fulfilled' || index % 4 === 3);
    if (order.toShip) shipQuota -= 1;
  });
  return orders;
}

// "2 674,56 $" — European grouping like the reference design.
function formatMoney(value) {
  const [whole, cents] = value.toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped},${cents} $`;
}

const TABS = [
  { key: 'all', label: 'All orders', icon: 'menu' },
  { key: 'active', label: 'Active', icon: 'activity' },
  { key: 'toInvoice', label: 'To invoice', icon: 'invoicing' },
  { key: 'toShip', label: 'To ship', icon: 'ship' },
];

const matchesTab = (order, tab) => {
  switch (tab) {
    case 'active':
      return order.status !== 'fulfilled';
    case 'toInvoice':
      return order.toInvoice;
    case 'toShip':
      return order.toShip;
    default:
      return true;
  }
};

const NEW_ORDER_INITIAL = { company: '', total: '', status: 'confirmed' };

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [filter, setFilter] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState(NEW_ORDER_INITIAL);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Simulated fetch so the Table's skeleton state is visible.
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(buildOrders());
      // Preselect the reference design's three rows.
      setSelectedKeys(['SO-00004', 'SO-00006', 'SO-00010']);
      setLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const tabCounts = useMemo(() => {
    const counts = { all: orders.length, active: 0, toInvoice: 0, toShip: 0 };
    orders.forEach((order) => {
      if (matchesTab(order, 'active')) counts.active += 1;
      if (matchesTab(order, 'toInvoice')) counts.toInvoice += 1;
      if (matchesTab(order, 'toShip')) counts.toShip += 1;
    });
    return counts;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const rows = orders.filter(
      (order) =>
        matchesTab(order, tab) &&
        (!query ||
          order.company.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query))
    );
    rows.sort((a, b) => (sortDir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)));
    return rows;
  }, [orders, tab, filter, sortDir]);

  const columns = [
    {
      key: 'id',
      title: 'Order #',
      sortable: true,
      render: (order) => <span className="orders__id">#{order.id}</span>,
    },
    { key: 'company', title: 'Company name' },
    {
      key: 'status',
      title: 'Status',
      render: (order) => (
        <Badge variant={STATUS[order.status].variant} dot>
          {STATUS[order.status].label}
        </Badge>
      ),
    },
    {
      key: 'total',
      title: 'Total',
      align: 'right',
      render: (order) => <span className="orders__total">{formatMoney(order.total)}</span>,
    },
    { key: 'created', title: 'Created' },
    { key: 'updated', title: 'Last updated' },
    {
      key: 'actions',
      title: '',
      align: 'right',
      width: 56,
      render: () => (
        <button type="button" className="orders__row-menu" aria-label="Row actions">
          <Icon name="dots" size={18} />
        </button>
      ),
    },
  ];

  const handleAddOrder = (event) => {
    event.preventDefault();
    const total = parseFloat(newOrder.total);
    if (!newOrder.company.trim() || Number.isNaN(total)) return;
    const nextNumber =
      Math.max(...orders.map((order) => parseInt(order.id.slice(3), 10)), 0) + 1;
    setOrders((current) => [
      {
        id: `SO-${String(nextNumber).padStart(5, '0')}`,
        company: newOrder.company.trim(),
        status: newOrder.status,
        total,
        created: 'Today',
        updated: 'Today',
      },
      ...current,
    ]);
    setNewOrder(NEW_ORDER_INITIAL);
    setModalOpen(false);
  };

  const handleDeleteSelected = () => {
    setOrders((current) => current.filter((order) => !selectedKeys.includes(order.id)));
    setSelectedKeys([]);
    setConfirmDelete(false);
  };

  return (
    <div className="orders">
      {/* Folder-style tabs above the table card */}
      <div className="orders__tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`orders__tab${tab === item.key ? ' is-active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            <Icon name={item.icon} size={17} />
            <span className="orders__tab-label">{item.label}</span>
            <span className="orders__tab-count">{loading ? '…' : tabCounts[item.key]}</span>
          </button>
        ))}
      </div>

      <Card flat padding="none" className="orders__card">
        <div className="orders__toolbar">
          <div className="orders__filter">
            <Icon name="filter" size={16} className="orders__filter-icon" />
            <input
              type="search"
              placeholder="Filter sales orders"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter sales orders"
            />
            <button type="button" className="orders__filter-settings" aria-label="Filter settings">
              <Icon name="sliders" size={16} />
            </button>
          </div>

          <Button
            variant="indigo"
            iconLeft={<Icon name="plus" size={16} strokeWidth={2.4} />}
            onClick={() => setModalOpen(true)}
          >
            New sales order
          </Button>
        </div>

        <Table
          columns={columns}
          data={visibleOrders}
          rowKey="id"
          loading={loading}
          skeletonRows={8}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          sortKey="id"
          sortDir={sortDir}
          onSort={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}
          empty={
            <EmptyState
              icon="orders"
              title="No sales orders found"
              message="Try a different filter, or create your first sales order."
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
        <div className="orders__bulkbar" role="toolbar" aria-label="Bulk actions">
          <button
            type="button"
            className="orders__bulkbar-clear"
            onClick={() => setSelectedKeys([])}
            aria-label="Clear selection"
          >
            <Icon name="x" size={16} />
          </button>
          <span className="orders__bulkbar-count">{selectedKeys.length}</span>
          <span className="orders__bulkbar-text">items selected</span>

          <div className="orders__bulkbar-actions">
            <button type="button" className="orders__bulkbar-btn">
              <Icon name="dots" size={16} /> More
            </button>
            <button type="button" className="orders__bulkbar-btn">
              <Icon name="mail" size={16} /> Send
            </button>
            <button type="button" className="orders__bulkbar-btn">
              <Icon name="printer" size={16} /> Print
            </button>
            <button type="button" className="orders__bulkbar-btn">
              <Icon name="edit" size={16} /> Edit
            </button>
            <button
              type="button"
              className="orders__bulkbar-btn orders__bulkbar-btn--danger"
              onClick={() => setConfirmDelete(true)}
            >
              <Icon name="trash" size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* New order modal (reuses Input/Select/Button) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New sales order"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-order-form">
              Create order
            </Button>
          </>
        }
      >
        <form id="new-order-form" className="orders__form" onSubmit={handleAddOrder}>
          <Input
            label="Company name"
            placeholder="e.g. Gaspar Antunes"
            value={newOrder.company}
            onChange={(event) => setNewOrder({ ...newOrder, company: event.target.value })}
            required
          />
          <Input
            label="Total ($)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={newOrder.total}
            onChange={(event) => setNewOrder({ ...newOrder, total: event.target.value })}
            required
          />
          <Select
            label="Status"
            options={Object.entries(STATUS).map(([value, meta]) => ({ value, label: meta.label }))}
            value={newOrder.status}
            onChange={(value) => setNewOrder({ ...newOrder, status: value })}
          />
        </form>
      </Modal>

      <Popup
        open={confirmDelete}
        variant="danger"
        icon="trash"
        title={`Delete ${selectedKeys.length} order${selectedKeys.length > 1 ? 's' : ''}?`}
        message="This will permanently remove the selected sales orders."
        confirmLabel="Delete"
        onConfirm={handleDeleteSelected}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default SalesOrders;
