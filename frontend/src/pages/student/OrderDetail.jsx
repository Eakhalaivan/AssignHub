import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, cancelOrder, rateOrder } from '../../api/orderApi';
import OrderStatusStepper from '../../components/dashboard/OrderStatusStepper';
import StatusBadge from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import RatingModal from '../../components/student/RatingModal';
import OrderChat from '../../components/student/OrderChat';
import { Card } from '../../components/ui/Card';
import TopNav from '../../components/common/TopNav';
import { usePayment } from '../../hooks/usePayment';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import toast from 'react-hot-toast';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [selectedWriter, setSelectedWriter] = useState(null);
  const { handlePayment, isPaying } = usePayment();

  const { data: order, isLoading } = useQuery({
    queryKey: ['orderDetail', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 4000 : false),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      toast.success('Order cancelled successfully.');
      queryClient.invalidateQueries(['orderDetail', id]);
      setIsCancelOpen(false);
    },
    onError: () => {
      toast.error('Failed to cancel order.');
    }
  });

  const rateMutation = useMutation({
    mutationFn: (ratingData) => rateOrder(id, ratingData),
    onSuccess: () => {
      toast.success('Writer review submitted successfully.');
      queryClient.invalidateQueries(['orderDetail', id]);
      setIsRateOpen(false);
    },
    onError: () => {
      toast.error('Failed to submit review.');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 select-none">
        <svg className="animate-spin h-8 w-8 text-[#c5a880] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center flex-col text-center py-20 select-none">
        <AlertCircle className="w-10 h-10 text-[#cb6e6e] mb-3" />
        <p className="font-orbitron text-primary text-sm font-semibold tracking-wider uppercase mb-1">Order Not Found</p>
        <p className="text-secondary font-dm text-xs max-w-xs mb-6">No order details match the referenced ID signature.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/student/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const canCancel = ['PENDING', 'ASSIGNED'].includes(order.status);
  const isCompleted = ['COMPLETED', 'DELIVERED'].includes(order.status);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <TopNav title="Order Details" />

      {/* Action Header */}
      <Card className="p-6 bg-[#111113] border-white/5" animate={false}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2.5 flex-wrap select-none">
              <span className="font-mono text-[9px] font-bold text-[#c5a880] bg-[#c5a880]/15 px-2 py-0.5 border border-[#c5a880]/20 rounded">
                Order #{order.id}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <h2 className="font-orbitron font-semibold text-base text-primary uppercase tracking-wider">
              {order.subject || order.orderType?.replace(/_/g, ' ') || 'Academic Assignment'}
            </h2>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {canCancel && (
              <Button
                variant="alert"
                size="sm"
                onClick={() => setIsCancelOpen(true)}
                className="w-full md:w-auto text-[10.5px] font-bold"
              >
                Cancel Order
              </Button>
            )}
            {order.status === 'PENDING' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePayment(order.id, order.totalCost)}
                disabled={isPaying}
                className="w-full md:w-auto text-[10.5px] font-bold"
              >
                {isPaying ? 'Processing...' : 'Pay Order'}
              </Button>
            )}
            {isCompleted && !order.rating && (
              <Button
                variant="plasma"
                size="sm"
                onClick={() => setIsRateOpen(true)}
                className="w-full md:w-auto text-[10.5px] font-bold"
              >
                Rate Writer
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Fulfillment Stepper */}
      <OrderStatusStepper status={order.status} />

      {/* Specs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main spec files */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-[#111113] border-white/5" animate={false}>
            <h3 className="font-orbitron font-semibold text-secondary text-[10px] uppercase tracking-widest border-b border-white/5 pb-3 mb-4 select-none">
              Requirements & Specifications
            </h3>
            <p className="text-secondary text-xs leading-relaxed whitespace-pre-wrap font-dm">
              {order.description || 'No detailed instructions provided.'}
            </p>
          </Card>

          {/* Deliverable File Download */}
          {isCompleted && order.fileUrl && (
            <Card className="p-6 border-[#70a382]/30 bg-[#70a382]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
              <div>
                <h4 className="text-[#70a382] font-orbitron font-semibold uppercase tracking-wider text-xs mb-1">
                  Deliverable Completed
                </h4>
                <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Final assignment file has been successfully uploaded and checked.</p>
              </div>
              <a
                href={order.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#70a382] text-black font-orbitron font-bold text-[10px] tracking-widest uppercase rounded shadow hover:opacity-90 transition-all text-center shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Files</span>
              </a>
            </Card>
          )}
        </div>

        {/* Sidebar: Order Metrics + Chat */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 border-white/5 bg-[#111113]" animate={false}>
            <h3 className="font-orbitron font-semibold text-secondary text-[10px] uppercase tracking-widest border-b border-white/5 pb-3 mb-4 select-none">
              Order Metrics
            </h3>

            <div className="space-y-3.5">
              {[
                { label: 'Work Type', value: order.workType },
                { label: 'Total Pages', value: `${order.pages} Pages` },
                { label: 'Urgency Level', value: order.urgency },
                { label: 'Date Created', value: formatDate(order.createdAt, 'MMM dd, yyyy') },
                { label: 'Deadline Stamp', value: formatDate(order.deadline, 'MMM dd, HH:mm'), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between text-xs border-b border-white/[0.02] pb-3 last:border-0 last:pb-0 font-mono">
                  <span className="text-muted uppercase text-[9px] tracking-wider">{label}</span>
                  <span className={`font-semibold uppercase tracking-wide ${highlight ? 'text-[#dfa157]' : 'text-secondary'}`}>
                    {value}
                  </span>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4 flex justify-between items-baseline select-none">
                <span className="text-[10px] font-orbitron font-semibold text-secondary uppercase tracking-widest">Total Cost</span>
                <span className="text-xl font-mono font-bold text-primary">
                  {formatCurrency(order.totalCost || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Invited Specialists List */}
          {order.matchedWriters && order.matchedWriters.length > 0 && (
            <Card className="p-6 border-white/5 bg-[#111113]" animate={false}>
              <h3 className="font-orbitron font-semibold text-secondary text-[10px] uppercase tracking-widest border-b border-white/5 pb-3 mb-4 select-none">
                Invited Specialists ({order.matchedWriters.length})
              </h3>
              <div className="space-y-4 divide-y divide-white/[0.03]">
                {order.matchedWriters.map((writer) => (
                  <div 
                    key={writer.id} 
                    onClick={() => setSelectedWriter(writer)}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] p-1 rounded transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center font-mono text-[10px] text-[#c5a880] font-bold shrink-0 group-hover:border-[#c5a880]/50 transition-colors">
                        {writer.initials || writer.writerName?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-orbitron font-semibold text-[11px] text-primary group-hover:text-[#c5a880] transition-colors">{writer.writerName}</h5>
                        <p className="text-[9px] font-mono text-muted mt-0.5">
                          {writer.distanceKm ? `${writer.distanceKm.toFixed(1)} km away` : 'Matching Subject'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[#c5a880] font-bold text-[10px]">{writer.writerRating || 5.0} ★</span>
                      <span className={`text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        writer.status === 'ACCEPTED' ? 'text-[#70a382] bg-[#70a382]/10 border border-[#70a382]/20' :
                        writer.status === 'REJECTED' ? 'text-[#cb6e6e] bg-[#cb6e6e]/10 border border-[#cb6e6e]/20' :
                        'text-[#dfa157] bg-[#dfa157]/10 border border-[#dfa157]/20 animate-pulse'
                      }`}>
                        {writer.status === 'PENDING' ? 'Pending' :
                         writer.status === 'REJECTED' ? 'Declined' :
                         writer.status === 'ACCEPTED' ? 'Accepted' : writer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Assigned Writer Info Card */}
          {order.writerId && (
            <Card 
              className="p-6 border-white/5 bg-[#111113] cursor-pointer hover:border-[#c5a880]/30 transition-all group" 
              animate={false}
              onClick={() => {
                const wDetails = order.matchedWriters?.find(w => w.writerId === order.writerId);
                if (wDetails) {
                  setSelectedWriter(wDetails);
                } else {
                  setSelectedWriter({
                    writerName: order.writerName,
                    writerRating: order.writerRating,
                    distanceKm: order.distanceKm,
                    initials: order.writerName?.split(' ').map(n=>n[0]).join('').toUpperCase(),
                    degree: 'Academic Specialist',
                    bio: 'Assigned specialist for this research request.'
                  });
                }
              }}
            >
              <h3 className="font-orbitron font-semibold text-secondary text-[10px] uppercase tracking-widest border-b border-white/5 pb-3 mb-4 select-none flex justify-between items-center">
                <span>Assigned Specialist</span>
                <span className="text-[9px] font-mono text-muted lowercase tracking-normal group-hover:text-[#c5a880] transition-colors">View Profile →</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center font-mono text-xs text-[#c5a880] font-bold group-hover:border-[#c5a880]/50 transition-colors">
                    {order.writerName?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-orbitron font-semibold text-xs text-primary group-hover:text-[#c5a880] transition-colors">{order.writerName}</h5>
                    <p className="text-[9px] font-mono text-muted mt-0.5">
                      Academic Specialist
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[#c5a880] font-bold text-xs block">{order.writerRating || 5.0} ★</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/[0.02] text-[11px] font-mono select-none">
                  <div className="flex justify-between items-center">
                    <span className="text-muted uppercase text-[9px] tracking-wider">Writer Distance</span>
                    <span className="text-secondary font-semibold">
                      {order.distanceKm ? `${order.distanceKm.toFixed(1)} km away` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted uppercase text-[9px] tracking-wider">Work Status</span>
                    <span className="text-[#70a382] font-bold uppercase text-[10.5px]">
                      {order.status === 'ASSIGNED' ? 'Accepted & Preparing' :
                       order.status === 'IN_PROGRESS' ? 'Actively Writing' :
                       order.status === 'COMPLETED' ? 'Completed & Uploaded' :
                       order.status === 'DELIVERED' ? 'Delivered' : order.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Live Chat Panel */}
          <div className="h-[420px]">
            <OrderChat orderId={order.id} />
          </div>
        </div>
      </div>

      {/* Abort Confirmation Dialog */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Order Confirmation"
        size="sm"
      >
        <div className="space-y-4 select-none">
          <p className="text-secondary text-xs leading-relaxed font-dm">
            Are you sure you want to cancel this order? Once cancelled, writer matchmaking will terminate immediately. Refunded credits will be returned to your wallet.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsCancelOpen(false)}>
              Cancel
            </Button>
            <Button variant="alert" size="sm" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      <RatingModal
        isOpen={isRateOpen}
        onClose={() => setIsRateOpen(false)}
        onSubmit={rateMutation.mutate}
        isLoading={rateMutation.isPending}
      />

      {/* Writer Profile Modal */}
      <Modal
        isOpen={!!selectedWriter}
        onClose={() => setSelectedWriter(null)}
        title="Specialist Profile"
        size="sm"
      >
        {selectedWriter && (
          <div className="space-y-5 select-none font-dm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center font-mono text-base text-[#c5a880] font-bold">
                {selectedWriter.initials || (selectedWriter.writerName || selectedWriter.name)?.split(' ').map(n=>n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h4 className="font-orbitron font-semibold text-sm text-primary uppercase tracking-wider">
                  {selectedWriter.writerName || selectedWriter.name}
                </h4>
                <p className="text-[10px] font-mono text-muted mt-1 uppercase tracking-wider">
                  {selectedWriter.degree || 'Academic Specialist'}
                </p>
              </div>
              <div className="ml-auto text-right">
                <span className="text-[#c5a880] font-bold text-sm block">{selectedWriter.writerRating || selectedWriter.rating || 5.0} ★</span>
                <span className="text-[9px] font-mono text-muted uppercase tracking-wider block mt-1">
                  {selectedWriter.distanceKm ? `${selectedWriter.distanceKm.toFixed(1)} km away` : 'Verified Location'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] font-mono text-muted uppercase tracking-widest block">About Specialist</span>
              <p className="text-secondary text-xs leading-relaxed italic bg-void/35 p-3 rounded border border-white/5">
                "{selectedWriter.bio || 'This specialist is certified in advanced research design and peer-reviewed academic synthesis.'}"
              </p>
            </div>

            {selectedWriter.specializations && selectedWriter.specializations.length > 0 && (
              <div className="space-y-2">
                <span className="text-[8px] font-mono text-muted uppercase tracking-widest block">Specializations</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWriter.specializations.map(spec => (
                    <span key={spec} className="px-2.5 py-0.5 bg-[#c5a880]/10 border border-[#c5a880]/20 text-[#c5a880] text-[8.5px] font-mono rounded uppercase tracking-wider">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedWriter(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
