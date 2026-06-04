import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import TopNav from '../../components/common/TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, containerStagger, itemFadeUp } from '../../animations/presets';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

export default function WriterApprovals() {
  const queryClient = useQueryClient();

  const { data: pendingWriters = [], isLoading } = useQuery({
    queryKey: ['pendingWriters'],
    queryFn: adminApi.getPendingWriters,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id }) => adminApi.verifyWriter(id),
    onSuccess: () => {
      toast.success('Writer verified successfully.');
      queryClient.invalidateQueries(['pendingWriters']);
    },
    onError: () => {
      toast.error('Failed to verify writer.');
    }
  });

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 select-none"
    >
      <TopNav title="Writer Approvals" />

      <div className="border-b border-white/5 pb-5">
        <h2 className="font-orbitron font-semibold text-lg text-primary uppercase tracking-wider mb-1">
          Approvals Gate
        </h2>
        <p className="text-xs text-muted font-dm">
          Review academic qualifications and approve pending writer applications.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-[#111113] border border-white/5 rounded skeleton animate-pulse" />
          ))}
        </div>
      ) : pendingWriters.length === 0 ? (
        <div className="bg-[#111113] border border-white/5 p-16 text-center rounded-md select-none">
          <Check className="w-8 h-8 text-[#70a382] mx-auto mb-3" />
          <p className="text-secondary font-orbitron text-xs tracking-wider uppercase font-semibold">Approvals Queue Cleared</p>
          <p className="text-muted text-[10px] font-mono mt-1 uppercase tracking-wider">No pending writer applications found.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerStagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {pendingWriters.map((w, idx) => (
              <motion.div variants={itemFadeUp} key={w.id || idx}>
                <Card className="flex flex-col justify-between h-full min-h-[220px] bg-[#111113] border-white/5 p-5">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-secondary font-orbitron font-semibold text-xs tracking-wide uppercase">
                          {w.user?.name || 'Candidate Writer'}
                        </h3>
                        <p className="text-[10px] text-muted font-mono mt-0.5">{w.user?.email || 'N/A'}</p>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-[#c5a880] uppercase bg-[#c5a880]/10 px-2.5 py-0.5 rounded border border-[#c5a880]/20">
                        {w.expertise || 'GENERAL'}
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-[8px] font-mono text-muted uppercase block tracking-wider">Bio / Credentials Statement</span>
                        <p className="text-secondary italic text-xs bg-void border border-white/5 p-3 rounded leading-relaxed font-dm mt-1.5">
                          "{w.bio || 'No credentials bio provided.'}"
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 font-mono text-[9px] uppercase tracking-wider">
                        <div>
                          <span className="text-muted block text-[8px] uppercase">Degree</span>
                          <span className="text-secondary font-bold font-orbitron mt-0.5 block">{w.degree || 'Master Degree'}</span>
                        </div>
                        <div>
                          <span className="text-muted block text-[8px] uppercase">Minimum Deadline</span>
                          <span className="text-secondary font-bold font-orbitron mt-0.5 block">{w.minDeadlineHours || '3'} Hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-4 border-t border-white/5 mt-5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        toast.error('Applicant request rejected.');
                        queryClient.invalidateQueries(['pendingWriters']);
                      }}
                      className="flex-1 text-[10px] font-bold"
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => verifyMutation.mutate({ id: w.id })}
                      loading={verifyMutation.isPending}
                      className="flex-1 text-[10px] font-bold"
                    >
                      Approve Writer
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
