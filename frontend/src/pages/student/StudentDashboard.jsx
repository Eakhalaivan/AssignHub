import { useState } from 'react';
import { useMyOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import StatusBadge from '../../components/common/StatusBadge';
import TopNav from '../../components/common/TopNav';
import RadarScannerMap from '../../components/common/RadarScannerMap';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../api/axios';
import { 
  Sparkles, 
  Compass, 
  Wallet, 
  FileText, 
  ChevronRight, 
  User, 
  Plus, 
  Award, 
  Clock, 
  CheckCircle2, 
  Copy,
  PlusSquare,
  Users
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: ordersData } = useMyOrders();
  const orders = ordersData || [];
  const navigate = useNavigate();
  const [selectedWriter, setSelectedWriter] = useState(null);

  // Poll for nearby writers
  const { data: nearbyWritersData } = useQuery({
    queryKey: ['nearbyWriters'],
    queryFn: async () => {
      const res = await api.get('/writermatch/nearby-writers?latitude=13.0827&longitude=80.2707&radius=5.0');
      return res.data.data || [];
    },
    refetchInterval: 10000,
  });
  const nearbyWriters = nearbyWritersData || [];

  // Filter metrics
  const pendingCount = orders.filter(o => o && o.status === 'PENDING').length;
  const assignedCount = orders.filter(o => o && o.status === 'ASSIGNED').length;
  const progressCount = orders.filter(o => o && o.status === 'IN_PROGRESS').length;
  const completedCount = orders.filter(o => o && ['COMPLETED', 'DELIVERED'].includes(o.status)).length;

  const activeOrder = orders.find(o => o && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  // Copy referral code handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.name ? `ACADEMIX-${user.name.split(' ')[0].toUpperCase()}-100` : 'ACADEMIX-REF-100');
    toast.success('Referral code copied successfully!');
  };

  const activePlanName = user?.planName || 'FREE';

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-20 lg:pb-10"
    >
      <TopNav title="Dashboard" />

      {/* Welcome Heading Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111113] border border-white/5 p-6 rounded-md select-none">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-orbitron font-semibold text-xl text-primary uppercase tracking-wide">
              Welcome back, {user?.name?.split(' ')[0] || 'Member'}
            </h2>
            <span 
              className={clsx(
                "px-2 py-0.5 rounded text-[9px] font-mono font-medium border uppercase tracking-wider",
                activePlanName === 'ENTERPRISE' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                activePlanName === 'PRO' ? "bg-[#c5a880]/15 border-[#c5a880]/30 text-[#c5a880]" :
                ""
              )}
              style={
                activePlanName !== 'ENTERPRISE' && activePlanName !== 'PRO'
                  ? {
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-muted)',
                    }
                  : {}
              }
            >
              {activePlanName} Plan
            </span>
          </div>
          <p className="text-secondary text-xs mt-1.5 font-dm">
            Monitor active order deliveries, requirements tracking, and verified writer networks.
          </p>
        </div>
        
        {user?.organizationName && (
          <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-md">
            <span className="text-[9px] text-muted font-mono uppercase tracking-wider">Organization</span>
            <span className="text-xs font-semibold text-primary font-orbitron uppercase tracking-wide">{user.organizationName}</span>
          </div>
        )}
      </section>

      {/* Bento Grid Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Match', count: pendingCount, icon: Clock, color: 'text-[#dfa157]' },
          { label: 'Assigned Writers', count: assignedCount, icon: User, color: 'text-zinc-400' },
          { label: 'In Progress', count: progressCount, icon: Compass, color: 'text-[#c5a880]' },
          { label: 'Completed Orders', count: completedCount, icon: CheckCircle2, color: 'text-[#70a382]' }
        ].map((stat) => (
          <div 
            key={stat.label}
            className="bg-[#111113] border border-white/5 p-5 rounded-md flex flex-col gap-3 hover:border-zinc-700 transition-colors select-none"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={clsx("w-4.5 h-4.5", stat.color)} />
              <span className="text-xl font-bold text-primary font-mono">
                {String(stat.count).padStart(2, '0')}
              </span>
            </div>
            <div>
              <div className="text-muted text-[10px] uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Interactive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left columns */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Action CTA */}
          <section className="relative overflow-hidden rounded-md min-h-[180px] flex flex-col justify-end p-6 bg-[#111113] border border-white/5 select-none">
            <div className="absolute inset-0 consultation-overlay pointer-events-none z-0"></div>
            
            <div className="relative z-20 space-y-3 max-w-lg">
              <h3 className="font-orbitron font-semibold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[#c5a880]" />
                Request Academic Consultation
              </h3>
              <p className="text-secondary text-xs leading-relaxed font-dm">
                Submit complex specifications to receive peer-reviewed insights and solutions from verified academic subject matter specialists.
              </p>
              <Button 
                onClick={() => navigate('/student/new-order')}
                variant="primary"
                size="sm"
                className="font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4.5 h-4.5" /> <span>Create New Order</span>
              </Button>
            </div>
          </section>

          {/* Secure Credit Wallet Card */}
          <section className="bg-[#111113] border border-white/5 rounded-md p-6 space-y-4">
            <div className="flex justify-between items-start select-none">
              <div>
                <h4 className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-1">
                  Available Balance
                </h4>
                <div className="text-2xl font-bold text-primary font-mono tracking-tight">
                  ₹{(14280.00).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-[#c5a880]/15 border border-[#c5a880]/30 p-2.5 rounded text-[#c5a880]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <Button 
                onClick={() => navigate('/student/new-order')}
                variant="secondary"
                size="sm"
                className="w-full flex justify-between items-center text-xs"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#70a382]" /> Add Funds
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </Button>
              <Button 
                variant="ghost"
                disabled
                size="sm"
                className="w-full flex justify-between items-center text-xs border border-white/5 bg-white/[0.01]"
              >
                <span className="flex items-center gap-2">
                  <PlusSquare className="w-4 h-4 text-muted" /> Withdraw
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-700" />
              </Button>
            </div>
          </section>

          {/* Recent Orders List */}
          <div className="space-y-3">
            <h3 className="text-[10px] text-muted uppercase tracking-widest font-semibold select-none">
              Recent Orders
            </h3>
            {recentOrders.length === 0 ? (
              <div className="bg-[#111113] border border-white/5 p-10 rounded-md text-center text-[10px] font-mono text-muted uppercase tracking-wider">
                No active orders catalogued.
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/student/orders/${order.id}`)}
                    className="bg-[#111113] border border-white/5 p-4 rounded-md flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[9px] font-bold text-[#c5a880] bg-[#c5a880]/15 border border-[#c5a880]/20 px-2 py-0.5 rounded">
                        #{order.id}
                      </span>
                      <div>
                        <span className="text-primary font-semibold text-xs block truncate max-w-[200px] sm:max-w-none">
                          {order.title || order.subject || order.orderType?.replace('_', ' ')}
                        </span>
                        <span className="text-muted text-[10px] font-mono block mt-0.5 uppercase tracking-wider">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-mono text-xs font-semibold">
                        ₹{order.totalCost?.toLocaleString('en-IN')}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dynamic Writermatch Radar Scanner */}
          <section className="bg-[#111113] border border-white/5 rounded-md p-5 relative overflow-hidden select-none">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-xs font-semibold text-primary tracking-wide uppercase font-orbitron">
                  Active Writer Network
                </h4>
                <p className="text-muted text-[9px] mt-0.5 uppercase font-mono tracking-wider">
                  Scanning departmental nodes...
                </p>
              </div>
              <span className="w-1.5 h-1.5 bg-[#c5a880] rounded-full animate-ping block" />
            </div>

            {/* Radar scanner grid */}
            <div className="flex justify-center mb-4">
              <RadarScannerMap
                writers={nearbyWriters}
                radius={activeOrder?.locationRadiusKm || 5.0}
                onSelectWriter={setSelectedWriter}
              />
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-[10px] font-mono border-b border-white/[0.02] pb-1.5">
                <span className="text-secondary">Writers Online</span>
                <span className="text-[#c5a880] font-bold">{nearbyWriters.length} active</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono pb-1">
                <span className="text-secondary">Dispatch Accuracy</span>
                <span className="text-[#fafafa] font-bold">99.8%</span>
              </div>
            </div>
          </section>

          {/* Referral center banner */}
          <section className="rounded-md p-6 bg-[#111113] border border-white/5 relative overflow-hidden flex flex-col justify-between select-none">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-[#c5a880]" />
                <h4 className="text-xs font-semibold text-primary tracking-wide uppercase font-orbitron">Referral Portal</h4>
              </div>
              <p className="text-[10px] text-secondary leading-relaxed mb-4 font-dm">
                Share your personalized code with colleagues to award them a credit and earn referral commission bonuses on their initial order completions.
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 bg-void border border-white/5 rounded px-3 py-2 font-mono text-[11px] tracking-widest flex items-center justify-center text-secondary select-all uppercase">
                {user?.name ? `ACADEMIX-${user.name.split(' ')[0].toUpperCase()}-100` : 'ACADEMIX-REF-100'}
              </div>
              <Button 
                onClick={handleCopyCode}
                variant="secondary"
                size="sm"
                className="shrink-0 p-2 rounded"
                aria-label="Copy Referral Code"
              >
                <Copy className="w-4 h-4 text-zinc-400" />
              </Button>
            </div>
          </section>

          {/* Selection Operator drawer */}
          <AnimatePresence>
            {selectedWriter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#111113] border border-[#c5a880]/30 rounded-md p-5 relative"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest font-bold">Writer Verified</span>
                  <button onClick={() => setSelectedWriter(null)} className="text-muted hover:text-white font-mono text-[9px] uppercase tracking-wider">✕ Close</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center font-mono text-xs text-[#c5a880] font-bold">
                      {selectedWriter.name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-orbitron font-semibold text-xs text-primary">{selectedWriter.name}</h5>
                      <p className="text-[9px] font-mono text-muted mt-0.5">
                        {selectedWriter.degree || 'Expert Writer'} • {selectedWriter.distanceKm?.toFixed(1)} km
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-[#c5a880] font-bold text-xs block">{selectedWriter.rating || 5.0} ★</span>
                    </div>
                  </div>
                  <p className="text-muted text-[10px] leading-relaxed italic bg-void/35 p-3 rounded border border-white/5">
                    "{selectedWriter.bio || 'Available for prompt matching and research delivery.'}"
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-[10px] font-bold"
                    onClick={() => {
                      toast.success(`Priority request notification dispatched to ${selectedWriter.name}!`);
                      setSelectedWriter(null);
                    }}
                  >
                    Send Direct Invitation
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}