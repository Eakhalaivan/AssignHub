import useWriterData from '../../hooks/useWriterData';
import { Card, StatCard } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import TopNav from '../../components/common/TopNav';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';

export default function Earnings() {
  const { earnings = {}, isLoadingEarnings } = useWriterData();

  // Backend returns: walletBalance, totalEarned, pendingPayout, recentTransactions
  const totalEarned = earnings.totalEarned ?? earnings.total ?? 0;
  const walletBalance = earnings.walletBalance ?? earnings.current ?? 0;
  const pendingPayout = earnings.pendingPayout ?? earnings.pending ?? 0;
  const recentTransactions = earnings.recentTransactions ?? earnings.history ?? [];

  // Build chart from actual data or generate trend from total
  const chartData = recentTransactions.length > 0
    ? recentTransactions
        .slice(0, 4)
        .reverse()
        .map((t, i) => ({
          name: `Tx ${i + 1}`,
          amount: Number(t.amount) || 0,
        }))
    : [
        { name: 'Week 1', amount: Number(totalEarned) * 0.1 || 0 },
        { name: 'Week 2', amount: Number(totalEarned) * 0.35 || 0 },
        { name: 'Week 3', amount: Number(totalEarned) * 0.7 || 0 },
        { name: 'Week 4', amount: Number(totalEarned) || 0 },
      ];

  // DataTable columns configuration
  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'id',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#c5a880]">
          #{String(row.id || Math.random()).slice(-6).toUpperCase() || 'TX-89A'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      sortable: true,
      render: (row) => (
        <span className="font-orbitron font-medium text-xs uppercase tracking-wide">
          {row.type?.replace(/_/g, ' ') || 'Credit'}
        </span>
      ),
    },
    {
      header: 'Reference',
      accessor: 'referenceType',
      sortable: false,
      render: (row) => (
        <span className="text-muted text-xs font-mono">
          {row.referenceType?.replace(/_/g, ' ') || '—'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      render: (row) => (
        <span className={`font-mono font-semibold ${
          row.type === 'CREDIT' ? 'text-[#70a382]' : 'text-[#cb6e6e]'
        }`}>
          {row.type === 'DEBIT' ? '−' : '+'}{formatCurrency(Number(row.amount) || 0)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-muted text-xs uppercase tracking-wider">
          {formatDate(row.createdAt, 'MMM dd, yyyy')}
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
      <TopNav title="Earnings Analytics" />

      {/* Yield Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Earned"
          value={formatCurrency(Number(totalEarned))}
          subtitle="All-time earnings"
          glow={true}
          loading={isLoadingEarnings}
        />
        <StatCard
          title="Pending Payout"
          value={formatCurrency(Number(pendingPayout))}
          subtitle="Awaiting release"
          glow={false}
          loading={isLoadingEarnings}
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(Number(walletBalance))}
          subtitle="Ready for withdrawal"
          glow={false}
          loading={isLoadingEarnings}
        />
      </section>

      {/* Area Chart */}
      {!isLoadingEarnings && (
        <Card className="p-6 bg-[#111113] border-white/5 h-[340px]" animate={false}>
          <div className="flex justify-between items-center mb-4 select-none">
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest block font-medium">
              Earnings Trend
            </span>
          </div>

          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowOrbit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a880" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c5a880" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="JetBrains Mono"
                  className="uppercase tracking-wider"
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="JetBrains Mono"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111113',
                    borderColor: 'var(--border-primary)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#c5a880"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#glowOrbit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Ledger History table */}
      <DataTable
        columns={columns}
        data={recentTransactions}
        loading={isLoadingEarnings}
        searchKey="type"
        searchPlaceholder="Filter by type..."
        emptyMessage="No earnings transactions recorded yet."
      />
    </motion.div>
  );
}
