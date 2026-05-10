import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PricePoint } from '../types';

interface MarketChartProps {
  data: PricePoint[];
  symbol: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141414] border border-[#333] p-3 rounded-md shadow-xl">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-emerald-400 font-mono text-sm leading-none">
          ${parseFloat(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const MarketChart: React.FC<MarketChartProps> = ({ data, symbol }) => {
  return (
    <div className="w-full h-[400px] bg-[#0a0a0a] rounded-xl border border-white/5 p-6 relative overflow-hidden group">
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-4xl font-light tracking-tighter text-white/90">
          {symbol}<span className="text-emerald-500 text-sm ml-2">USDT</span>
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-500/80 uppercase">Live Feed</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 80, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            hide 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            data={data.map(d => ({ ...d, price: d.price * 0.999 }))}
            dataKey="price" 
            stroke="#4b5563" 
            strokeWidth={1}
            strokeDasharray="5 5"
            fill="none" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
