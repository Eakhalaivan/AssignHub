import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getRevenue } from '../../api/adminApi';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Card } from '../../components/ui/Card';
import TopNav from '../../components/common/TopNav';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import formatCurrency from '../../utils/formatCurrency';

const formatDateTick = (value) => {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return value;
};

const CustomTooltip = ({ active, payload, label, isCurrency = true }) => {
  if (!active || !payload?.length) return null;
  let formattedLabel = label;
  if (label && label.includes('-')) {
    const parts = label.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      formattedLabel = `${months[monthIdx]} ${parts[2]}, ${parts[0]}`;
    }
  }
  return (
    <div className="bg-[#111113] border border-white/5 rounded p-3 shadow-premium select-none">
      <p className="text-muted text-[9px] font-mono mb-1.5 uppercase tracking-wider">{formattedLabel}</p>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || '#c5a880' }} />
          <span className="text-muted text-[10px] uppercase font-mono">{p.name}:</span>
          <span className="text-secondary font-mono font-semibold text-xs ml-auto">
            {isCurrency ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: analytics, isLoading: aLoading } = useQuery({ queryKey: ['analytics'], queryFn: getAnalytics });
  const { data: revenue, isLoading: rLoading } = useQuery({ queryKey: ['revenue'], queryFn: getRevenue });

  const statusLabels = {
    PENDING: 'Pending Match',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    DISPUTED: 'Disputed'
  };

  const statusData = analytics?.orderStatusDistribution
    ? Object.entries(analytics.orderStatusDistribution).map(([status, count]) => ({
        name: statusLabels[status] || status.replace(/_/g, ' '),
        value: count,
      }))
    : [];

  const isLoading = aLoading || rLoading;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 select-none"
    >
      <TopNav title="Platform Analytics" />

      <div className="border-b border-white/5 pb-5">
        <h2 className="font-orbitron font-semibold text-lg text-primary uppercase tracking-wider mb-1">
          System Performance Analytics
        </h2>
        <p className="text-xs text-muted font-dm">
          Comprehensive insights regarding order volumes, revenue flow, and platform commission metrics.
        </p>
      </div>

      {isLoading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-[#111113]/40 border border-white/5 rounded-md">
          <svg className="animate-spin h-8 w-8 text-[#c5a880] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Consolidating system telemetry...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue & Profit Growth Chart */}
          <Card className="p-6 bg-[#111113] border-white/5 h-[380px] flex flex-col justify-between" animate={false}>
            <div>
              <h3 className="font-orbitron font-semibold text-secondary text-[10px] tracking-widest mb-1 uppercase">
                Revenue & Profit Growth
              </h3>
              <p className="text-[9px] text-muted font-mono uppercase tracking-wider mb-4">
                Comparison of top-line revenue vs net profit margins (last 30 days)
              </p>
            </div>
            <div className="flex-1 w-full h-56 relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={revenue || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c5a880" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#c5a880" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#70a382" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#70a382" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.01)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDateTick}
                    stroke="var(--text-muted)" 
                    fontSize={9.5} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={9.5} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <Tooltip content={(props) => <CustomTooltip {...props} isCurrency={true} />} />
                  <Area 
                    type="monotone" 
                    name="Revenue"
                    dataKey="revenue" 
                    stroke="#c5a880" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#revenueGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    name="Profit"
                    dataKey="profit" 
                    stroke="#70a382" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#profitGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Commission & Writer Payout Allocation */}
          <Card className="p-6 bg-[#111113] border-white/5 h-[380px] flex flex-col justify-between" animate={false}>
            <div>
              <h3 className="font-orbitron font-semibold text-secondary text-[10px] tracking-widest mb-1 uppercase">
                Platform Resource Allocation
              </h3>
              <p className="text-[9px] text-muted font-mono uppercase tracking-wider mb-4">
                Distribution of gross order revenue to writer payouts vs platform profit
              </p>
            </div>
            <div className="flex-1 w-full h-56 relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={revenue || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.01)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDateTick}
                    stroke="var(--text-muted)" 
                    fontSize={9.5} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={9.5} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <Tooltip content={(props) => <CustomTooltip {...props} isCurrency={true} />} />
                  <Bar dataKey="writerPayout" name="Writer Payout" fill="#52525b" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="profit" name="Platform Profit" fill="#c5a880" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Order Volume by Status */}
          <Card className="p-6 bg-[#111113] border-white/5 h-[380px] flex flex-col justify-between lg:col-span-2" animate={false}>
            <div>
              <h3 className="font-orbitron font-semibold text-secondary text-[10px] tracking-widest mb-1 uppercase">
                Active Order Volume by Status
              </h3>
              <p className="text-[9px] text-muted font-mono uppercase tracking-wider mb-4">
                Total distribution of order states across the marketplace platform
              </p>
            </div>
            <div className="flex-1 w-full h-56 relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.01)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={9.5} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={9.5} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <Tooltip content={(props) => <CustomTooltip {...props} isCurrency={false} />} />
                  <Bar dataKey="value" name="Orders" fill="#c5a880" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      )}
    </motion.div>
  );
}
