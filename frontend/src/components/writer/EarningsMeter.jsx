import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import formatCurrency from '../../utils/formatCurrency';

export const EarningsMeter = ({ data = [], stats = {} }) => {
  return (
    <div className="glass bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 border-b border-zinc-800/40 pb-6">
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Secured Net</span>
          <span className="text-3xl font-black font-mono text-emerald-400">{formatCurrency(stats.total || 0)}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Pending Audits</span>
          <span className="text-3xl font-black font-mono text-amber-400">{formatCurrency(stats.pending || 0)}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Current Yield</span>
          <span className="text-3xl font-black font-mono text-sky-400">{formatCurrency(stats.current || 0)}</span>
        </div>
      </div>

      <div className="h-72 w-full mt-4 relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              fontFamily="monospace"
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#09090b', 
                borderColor: '#27272a', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fafafa',
                fontFamily: 'monospace'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorPv)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsMeter;
