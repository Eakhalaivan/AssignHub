import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getAnalytics, getRevenue } from '../../api/adminApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, StatCard } from '../../components/ui/Card';
import TopNav from '../../components/common/TopNav';
import FraudRiskMeter from '../../components/dashboard/FraudRiskMeter';
import WriterLeaderboard from '../../components/dashboard/WriterLeaderboard';
import { motion } from 'framer-motion';
import { pageTransition, containerStagger, itemFadeUp } from '../../animations/presets';

const formatDateTick = (value) => {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return value;
};

const CustomTooltip = ({ active, payload, label }) => {
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
      <p className="text-muted text-[9px] font-mono mb-1 uppercase tracking-wider">{formattedLabel}</p>
      <p className="text-[#c5a880] font-mono font-bold text-sm">₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: analytics, isLoading: aLoading } = useQuery({ queryKey: ['analytics'], queryFn: getAnalytics });
  const { data: revenue, isLoading: rLoading } = useQuery({ queryKey: ['revenue'], queryFn: getRevenue });

  const metrics = [
    { label: 'Total Orders', value: analytics?.totalOrders || 0, isCurrency: false, color: 'plasma' },
    { label: 'Active Writers', value: analytics?.activeWriters || 0, isCurrency: false, color: 'orbit' },
    { label: 'Total Revenue', value: analytics?.totalRevenue || 0, isCurrency: true, color: 'orbit' },
    { label: 'Pending Match Orders', value: analytics?.pendingOrders || 0, isCurrency: false, color: 'plasma' },
    { label: 'Commissions', value: analytics?.totalCommission || 0, isCurrency: true, color: 'orbit' },
    { label: 'Total Users', value: analytics?.totalUsers || 0, isCurrency: false, color: 'plasma' },
  ];

  // Admin-controlled platform fee (persisted to localStorage so all pages read it)
  const [platformFee, setPlatformFee] = useState(Number(localStorage.getItem('adminPlatformFee')) || 15);
  const [feeInput, setFeeInput] = useState(String(platformFee));
  const [feeSaved, setFeeSaved] = useState(false);

  const savePlatformFee = () => {
    const val = parseFloat(feeInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    localStorage.setItem('adminPlatformFee', String(val));
    setPlatformFee(val);
    setFeeSaved(true);
    setTimeout(() => setFeeSaved(false), 2000);
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 select-none"
    >
      <TopNav title="Admin Dashboard" />

      {/* Stats Cards Section */}
      <motion.div 
        variants={containerStagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {metrics.map((m) => (
          <motion.div variants={itemFadeUp} key={m.label} className="w-full">
            <StatCard
              title={m.label}
              value={m.isCurrency ? `₹${(m.value || 0).toLocaleString('en-IN')}` : m.value}
              subtitle="All-time stats"
              glow={m.color === 'orbit'}
              loading={aLoading}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Platform Commission Fee Editor */}
      <Card className="p-5 bg-[#111113] border-white/5" animate={false}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h3 className="font-orbitron font-semibold text-secondary text-[10px] tracking-widest uppercase mb-1">
              Platform Commission Rate
            </h3>
            <p className="text-muted text-[10px] font-mono">
              Current: <span className="text-[#c5a880] font-bold">{platformFee}%</span>
              &nbsp;&mdash; Silently baked into student quotes. Writers never see this line item.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="platform-fee-input"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={feeInput}
              onChange={e => { setFeeInput(e.target.value); setFeeSaved(false); }}
              className="w-20 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-primary focus:border-[#c5a880]/60 focus:outline-none transition-colors"
            />
            <span className="text-muted text-xs font-mono">%</span>
            <button
              id="save-platform-fee-btn"
              type="button"
              onClick={savePlatformFee}
              className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold transition-all ${
                feeSaved
                  ? 'bg-[#70a382]/20 border border-[#70a382]/40 text-[#70a382]'
                  : 'bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#c5a880] hover:bg-[#c5a880]/20'
              }`}
            >
              {feeSaved ? '\u2713 Saved' : 'Save'}
            </button>
          </div>
        </div>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trajectory Area Graph */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-[#111113] border-white/5 h-[360px]" animate={false}>
            <h3 className="font-orbitron font-semibold text-secondary text-[10px] tracking-widest mb-6 uppercase">
              Revenue Trend
            </h3>
            {rLoading ? (
              <div className="h-56 flex flex-col items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-[#c5a880] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-[9px] font-mono text-muted uppercase tracking-wider">Syncing database data...</span>
              </div>
            ) : (
              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={revenue || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.01)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDateTick}
                      tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'JetBrains Mono' }} 
                      axisLine={false} 
                      tickLine={false} 
                      className="uppercase tracking-wider"
                    />
                    <YAxis 
                      tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'JetBrains Mono' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#c5a880" 
                      strokeWidth={2} 
                      dot={{ fill: '#c5a880', r: 3, strokeWidth: 0 }} 
                      activeDot={{ r: 5, fill: '#fafafa', strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Risk meter */}
        <div className="lg:col-span-1">
          <FraudRiskMeter 
            riskScore={24} 
            factors={['IP Address Multi-Mapping', 'Outlier Location Radius Discrepancy']} 
          />
        </div>
      </div>

      {/* Leaderboard and Operational Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WriterLeaderboard />
        </div>

        {/* Live system logs ticker */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-[#111113] border-white/5 h-full" animate={false}>
            <h3 className="font-orbitron font-semibold text-secondary text-[10px] tracking-widest mb-4.5 uppercase">
              Recent Platform Activity
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {[
                { stamp: '12:51:20', node: 'API-ROUTER', msg: 'Verification handshake complete for writer client Sarah K.' },
                { stamp: '12:49:05', node: 'MATCH-BEACON', msg: 'Geo-match broadcast successfully accepted on order #4812' },
                { stamp: '12:42:11', node: 'PAYMENT-GATEWAY', msg: 'PCI compliance validation status: SUCCESS (Transaction ID #TX-90B)' },
                { stamp: '12:35:48', node: 'COMPLIANCE-ENGINE', msg: 'Risk assessment executed. Risk coefficient: 24%' },
                { stamp: '12:20:04', node: 'AUTH-GATE', msg: 'Access token refresh request processed for user token #219B' }
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4.5 text-[10px] font-mono border-b border-white/[0.02] pb-2 last:border-0 last:pb-0 select-text">
                  <span className="text-muted shrink-0">{log.stamp}</span>
                  <span className="text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/15 px-2 py-0.5 rounded font-bold shrink-0 text-[8px] uppercase tracking-wider">
                    {log.node}
                  </span>
                  <span className="text-secondary truncate">{log.msg}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}