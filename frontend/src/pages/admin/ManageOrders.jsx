import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import StatusBadge from '../../components/common/StatusBadge';
import TopNav from '../../components/common/TopNav';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import toast from 'react-hot-toast';
import { UserCheck } from 'lucide-react';

export default function ManageOrders() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetWriterId, setTargetWriterId] = useState('');

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: adminApi.getAllOrders,
  });

  // Fetch writers for assignment selection
  const { data: writers = [] } = useQuery({
    queryKey: ['adminAvailableWriters'],
    queryFn: async () => {
      const all = await adminApi.getAllUsers();
      return all.filter(u => u.role?.toUpperCase() === 'WRITER' || u.role === 'writer');
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ orderId, writerId }) => adminApi.assignWriter(orderId, writerId),
    onSuccess: () => {
      toast.success('Writer assigned successfully.');
      queryClient.invalidateQueries(['adminOrders']);
      setSelectedOrder(null);
      setTargetWriterId('');
    },
    onError: () => {
      toast.error('Failed to assign writer.');
    }
  });

  const handleConfirmAssignment = () => {
    if (!targetWriterId || !selectedOrder) return;
    assignMutation.mutate({ orderId: selectedOrder.id, writerId: Number(targetWriterId) });
  };

  // Table Column Definitions
  const columns = [
    {
      header: 'Order ID',
      accessor: 'id',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/15 px-2.5 py-0.5 rounded">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: 'subject',
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
      header: 'Deadline',
      accessor: 'deadline',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-secondary uppercase tracking-wider">{formatDate(row.deadline, 'MMM dd, HH:mm')}</span>,
    },
    {
      header: 'Assigned Writer',
      accessor: 'writerName',
      sortable: true,
      render: (row) => (
        <span className="text-secondary font-semibold text-xs flex items-center gap-1.5 font-orbitron">
          {row.writerName ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#70a382]" />
              <span>{row.writerName}</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="text-zinc-500 uppercase text-[10px] tracking-wider font-mono">Unassigned</span>
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Total Price',
      accessor: 'totalCost',
      sortable: true,
      render: (row) => (
        <span className="text-[#c5a880] font-mono font-semibold text-xs">
          {formatCurrency(row.totalCost || 0)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          {!row.writerId && row.status !== 'CANCELLED' && (
            <Button
              variant="plasma"
              size="sm"
              onClick={() => setSelectedOrder(row)}
              className="py-1 px-3 text-[10px] font-bold"
            >
              Assign Writer
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 select-none"
    >
      <TopNav title="Manage Orders" />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={isLoadingOrders}
        searchKey="subject"
        searchPlaceholder="Filter by subject domain..."
        emptyMessage="No orders found in database."
      />

      {/* Writer Allocation Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => {
          setSelectedOrder(null);
          setTargetWriterId('');
        }}
        title="Assign Writer to Order"
        size="sm"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <p className="text-secondary text-xs leading-relaxed font-dm mb-4">
                Select a verified academic writer to assign to **Order #{selectedOrder.id} - {selectedOrder.subject || selectedOrder.orderType?.replace(/_/g, ' ')}**.
              </p>
              
              <Select
                label="Select Academic Writer"
                value={targetWriterId}
                onChange={(e) => setTargetWriterId(e.target.value)}
                options={[
                  { value: '', label: 'Select candidate writer...' },
                  ...writers.map(w => ({ value: w.id, label: `${w.name} (${w.status || 'Active'})` }))
                ]}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleConfirmAssignment} 
                disabled={!targetWriterId}
                loading={assignMutation.isPending}
                className="gap-1 flex items-center"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
