import { useAssignments, useEarnings } from '../../hooks/useWriterData';
import { toggleAvailability } from '../../api/writerApi';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Input';
import StatusBadge from '../../components/common/StatusBadge';
import TopNav from '../../components/common/TopNav';
import TierBadge from '../../components/dashboard/TierBadge';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Briefcase, TrendingUp, Inbox, Compass, Users } from 'lucide-react';

export default function WriterDashboard() {
  const { data: assignmentsData, isLoading: aLoading } = useAssignments();
  const assignments = assignmentsData || [];
  const { data: earnings } = useEarnings();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Poll for nearby geo-matching invitations
  const { data: invitationsData } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await api.get('/writermatch/invitations');
      return res.data.data || [];
    },
    refetchInterval: 3000,
  });
  const invitations = invitationsData || [];

  const active = assignments.filter(a => a && a.status === 'IN_PROGRESS');
  const done = assignments.filter(a => a && (a.status === 'COMPLETED' || a.status === 'DELIVERED'));

  const handleToggle = async () => {
    try {
      await toggleAvailability();
      qc.invalidateQueries(['writerProfile']);
      toast.success('Availability state updated.');
    } catch {
      toast.error('Failed to update availability.');
    }
  };

  const handleRespond = async (assignmentId, accept) => {
    try {
      const res = await api.post(`/writermatch/respond?assignmentId=${assignmentId}&accept=${accept}`);
      const data = res.data;
      if (data.success) {
        toast.success(accept ? 'Assignment accepted!' : 'Invitation declined.');
        qc.invalidateQueries(['assignments']);
        qc.invalidateQueries(['invitations']);
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (e) {
      toast.error('Network error occurred');
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 select-none"
    >
      <TopNav title="Writer Dashboard" />

      {/* Real-time incoming matching invitation banner */}
      <AnimatePresence>
        {invitations.length > 0 && (
          <div className="space-y-3">
            {invitations.map(inv => {
              const order = inv.order;
              if (!order) return null;
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#111113] border border-[#c5a880]/30 p-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880]">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-orbitron font-semibold text-[#c5a880] text-[10px] mb-1 tracking-wider uppercase">
                        New Assignment Invitation
                      </h3>
                      <p className="text-secondary text-xs font-dm leading-relaxed">
                        A client requested a <strong className="text-white font-medium">{order.orderType?.replace(/_/g, ' ')}</strong> on{' '}
                        <strong className="text-white font-medium">{order.subject || 'General'}</strong>.
                      </p>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-muted mt-1 uppercase tracking-wider">
                        <span>Pages: {order.pages}</span>
                        <span>•</span>
                        <span>Urgency: {order.urgency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 w-full md:w-auto">
                    <div className="text-right mr-3 hidden md:block">
                      <span className="text-muted text-[8px] font-mono uppercase block tracking-wider">Payout</span>
                      <span className="text-primary font-mono font-bold text-base">
                        ₹{order.totalCost?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 md:flex-none font-bold"
                      onClick={() => handleRespond(inv.id, true)}
                    >
                      Accept Assignment
                    </Button>
                    <button
                      onClick={() => handleRespond(inv.id, false)}
                      className="bg-transparent hover:bg-[#cb6e6e]/10 border border-white/5 hover:border-[#cb6e6e]/30 text-secondary hover:text-white px-3.5 py-2.5 rounded text-[10px] font-mono tracking-wider transition-colors uppercase font-medium"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Writer Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Invites"
          value={invitations.length}
          subtitle="Matching pipeline"
          glow={invitations.length > 0}
        />
        <StatCard
          title="In Progress"
          value={active.length}
          subtitle="Assignments queue"
          glow={active.length > 0}
        />
        <StatCard
          title="Completed Tasks"
          value={done.length}
          subtitle="All-time stats"
          glow={false}
        />
        <StatCard
          title="Balance"
          value={`₹${earnings?.walletBalance?.toLocaleString('en-IN') || '0.00'}`}
          subtitle="Available for payout"
          glow={true}
        />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main content columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Availability Control */}
          <Card hover={false} className="p-6 bg-[#111113] border-white/5" animate={false}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-orbitron font-semibold text-[#c5a880] mb-1 text-xs tracking-wide uppercase">
                  Availability Settings
                </h3>
                <p className="text-secondary text-xs font-dm leading-relaxed">
                  Toggle your availability status to appear on client maps and receive assignment recommendations.
                </p>
              </div>
              <Switch checked={earnings?.available || true} onChange={handleToggle} label="Availability" />
            </div>
          </Card>

          {/* Active assignments section */}
          <div className="space-y-3">
            <h3 className="font-orbitron font-semibold text-secondary text-[10px] uppercase tracking-widest">
              Active Assignments Queue
            </h3>
            
            {aLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[#111113] border border-white/5 rounded skeleton animate-pulse" />
                ))}
              </div>
            ) : active.length === 0 ? (
              <Card className="p-10 text-center select-none" animate={false}>
                <Briefcase className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-muted font-mono text-[10px] uppercase tracking-wider">No active assignments queue.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {active.map((a) => (
                  <Card 
                    key={a.id} 
                    className="p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 bg-[#111113] border-white/5"
                    onClick={() => navigate('/writer/assignments')}
                  >
                    <div>
                      <h4 className="text-secondary font-orbitron font-semibold text-xs uppercase tracking-wide">
                        {a.orderType?.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-muted text-[10px] font-mono mt-0.5 uppercase tracking-wider">
                        Order ID: #{a.orderId} • {a.pages} pages
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#c5a880] font-mono text-xs font-bold">
                        ₹{a.writerEarning?.toLocaleString('en-IN')}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <TierBadge tier="SILVER" orderCount={active.length + done.length} />
        </div>
      </div>
    </motion.div>
  );
}