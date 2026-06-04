import React from 'react';
import { Link } from 'react-router-dom';
import AntigravityCard from '../common/AntigravityCard';
import StatusBadge from '../common/StatusBadge';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

// Maps order status → AntigravityCard variant + StatusDot status
const STATUS_VARIANT_MAP = {
  PENDING:     { variant: 'warning', status: 'busy' },
  ASSIGNED:    { variant: 'default', status: 'online' },
  IN_PROGRESS: { variant: 'elevated', status: 'busy' },
  COMPLETED:   { variant: 'success',  status: 'success' },
  DELIVERED:   { variant: 'success',  status: 'online' },
  CANCELLED:   { variant: 'danger',   status: 'offline' },
};

export const OrderCard = ({ order, index = 0 }) => {
  const { variant, status } = STATUS_VARIANT_MAP[order.status] || { variant: 'default', status: undefined };

  return (
    <AntigravityCard
      as={Link}
      to={`/student/orders/${order.id}`}
      variant={variant}
      status={status}
      animate="fade-up"
      delay={index * 0.05}
      accent="tl"
      hover
      ripple
      className="flex flex-col justify-between h-full group block"
    >
      {/* Header row */}
      <div>
        <div className="flex items-start justify-between mb-4 gap-4">
          <span className="text-[10px] font-mono text-zinc-500 tracking-wide uppercase bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800">
            #{String(order.id).slice(-6) || 'NEW'}
          </span>
          <StatusBadge status={order.status} />
        </div>

        <h3 className="text-base font-bold text-zinc-200 mb-2 tracking-wide truncate group-hover:text-white transition-colors duration-200">
          {order.title || order.subject || `Order #${order.id}`}
        </h3>
        <p className="text-sm text-zinc-500 line-clamp-2 mb-5 leading-relaxed">
          {order.description}
        </p>
      </div>

      {/* Footer row */}
      <div className="pt-4 border-t border-white/[0.06] flex items-end justify-between mt-auto">
        <div>
          <span className="text-[9px] font-bold text-zinc-600 uppercase block tracking-widest mb-0.5">
            Deadline
          </span>
          <span className="text-xs font-medium text-zinc-400 font-mono">
            {formatDate(order.deadline, 'MMM dd, HH:mm')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-zinc-600 uppercase block tracking-widest mb-0.5">
            Total
          </span>
          <span className="text-lg font-black font-mono text-sky-400">
            {formatCurrency(order.totalCost ?? order.price)}
          </span>
        </div>
      </div>
    </AntigravityCard>
  );
};

export default OrderCard;
