import { useMyOrders } from '../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import TopNav from '../../components/common/TopNav';
import { Button } from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import { Plus } from 'lucide-react';

const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

export default function MyOrders() {
  const { data: orders = [], isLoading } = useMyOrders();
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  // Table Column Definitions
  const columns = [
    {
      header: 'Order ID',
      accessor: 'id',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/15 px-2 py-0.5 rounded">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: 'orderType',
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-secondary font-orbitron font-semibold text-[11px] block tracking-wide uppercase">
            {row.subject || row.orderType?.replace(/_/g, ' ')}
          </span>
          <span className="text-muted text-[10px] font-mono block mt-0.5">
            {row.workType} • {row.pages} pages
          </span>
        </div>
      ),
    },
    {
      header: 'Urgency',
      accessor: 'urgency',
      sortable: true,
      render: (row) => <span className="font-mono text-xs uppercase tracking-wider">{row.urgency}</span>,
    },
    {
      header: 'Date Created',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-muted text-xs font-mono uppercase tracking-wider">
          {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      header: 'Total Price',
      accessor: 'totalCost',
      sortable: true,
      render: (row) => (
        <span className="text-[#c5a880] font-mono font-semibold text-xs">
          ₹{row.totalCost?.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <TopNav title="My Orders" />

      {/* Filter Tabs Row */}
      <div className="flex gap-2 flex-wrap mb-4 bg-void border border-white/5 p-1 rounded max-w-fit select-none">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#c5a880] font-bold'
                : 'border border-transparent text-muted hover:text-secondary'
            }`}
          >
            {f.replace('_', ' ')}{' '}
            <span className="text-[8px] opacity-75">
              {f === 'ALL' ? `(${orders.length})` : `(${orders.filter(o => o.status === f).length})`}
            </span>
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        searchKey="subject"
        searchPlaceholder="Filter by subject domain..."
        emptyMessage="No orders found matching criteria."
        onRowClick={(row) => navigate(`/student/orders/${row.id}`)}
        actions={
          <Button variant="plasma" size="sm" onClick={() => navigate('/student/new-order')} className="gap-1 flex items-center">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </Button>
        }
      />
    </motion.div>
  );
}