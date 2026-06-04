import { useQuery } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { DataTable } from '../../components/ui/DataTable';
import TopNav from '../../components/common/TopNav';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import clsx from 'clsx';

export default function ManageUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminAllUsers'],
    queryFn: adminApi.getAllUsers,
  });

  // Table Column Definitions
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <span className="font-orbitron font-semibold text-secondary tracking-wide uppercase text-xs">
          {row.name}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-muted">{row.email}</span>,
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      render: (row) => {
        const isWriter = row.role?.toLowerCase() === 'writer';
        const isAdmin = row.role?.toLowerCase() === 'admin';
        return (
          <span className={clsx(
            "px-2 py-0.5 rounded text-[9px] font-mono font-medium uppercase border select-none",
            isAdmin ? "bg-[#cb6e6e]/10 border-[#cb6e6e]/25 text-[#cb6e6e]" :
            isWriter ? "bg-[#dfa157]/10 border-[#dfa157]/25 text-[#dfa157]" :
            "bg-[#c5a880]/15 border-[#c5a880]/30 text-[#c5a880]"
          )}>
            {row.role}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-[#70a382]" />
          Active
        </span>
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
      <TopNav title="Manage Users" />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        searchKey="name"
        searchPlaceholder="Filter by name..."
        emptyMessage="No users found in database."
      />
    </motion.div>
  );
}
