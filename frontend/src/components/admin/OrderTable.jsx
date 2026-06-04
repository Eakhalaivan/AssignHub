import React from 'react';
import StatusBadge from '../common/StatusBadge';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import GlowButton from '../common/GlowButton';

export const OrderTable = ({ orders = [], onAssign, onViewDetails }) => {
  return (
    <div className="glass border border-zinc-800/60 rounded-3xl overflow-hidden w-full bg-zinc-900/20 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/50">
              <th className="p-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Signature</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Topic Context</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Payload Value</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Status Protocol</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Chronology</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-800/20 transition-colors duration-200 group">
                <td className="p-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-bold text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 px-2.5 py-1 rounded">
                    #{order.id?.slice(-6).toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="min-w-[200px]">
                    <p className="text-sm font-bold text-zinc-200 group-hover:text-sky-400 transition-colors truncate">{order.title}</p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-xs">{order.studentName || 'Unknown User'}</p>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="text-sm font-mono font-black text-zinc-300">{formatCurrency(order.price)}</span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="text-xs text-zinc-400">{formatDate(order.deadline, 'MMM dd, HH:mm')}</span>
                </td>
                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                  {order.status === 'pending' && (
                    <GlowButton
                      onClick={() => onAssign(order)}
                      className="inline-flex px-3 py-1.5 text-[10px] font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                    >
                      Match Node
                    </GlowButton>
                  )}
                  <button
                    onClick={() => onViewDetails(order.id)}
                    className="text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-zinc-200 px-3 py-1.5 transition-colors border border-transparent hover:border-zinc-800 rounded-lg"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
