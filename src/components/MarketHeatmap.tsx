import React from 'react';
import { motion } from 'motion/react';
import { SYMBOLS } from '../constants';

export const MarketHeatmap: React.FC<{ isAmharic: boolean }> = ({ isAmharic }) => {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          {isAmharic ? 'የአለም ገበያ ሁኔታ' : 'Global Sentiment Map'}
        </h3>
        <span className="text-[8px] text-gray-500 font-mono">SCANNING...</span>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SYMBOLS.map((symbol) => {
          const intensity = Math.random();
          const isPositive = Math.random() > 0.4;
          return (
            <motion.div
              key={symbol}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              className={`aspect-square rounded flex flex-col items-center justify-center border border-white/5 cursor-help transition-colors ${
                isPositive 
                  ? intensity > 0.7 ? 'bg-emerald-500/40 border-emerald-500/20' : 'bg-emerald-500/20 border-emerald-500/10'
                  : intensity > 0.7 ? 'bg-rose-500/40 border-rose-500/20' : 'bg-rose-500/20 border-rose-500/10'
              }`}
            >
              <span className="text-[8px] font-black text-white">{symbol.substring(0, 3)}</span>
              <span className={`text-[6px] font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : '-'}{(intensity * 5).toFixed(1)}%
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[7px] text-gray-600 uppercase font-mono">
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-rose-500/40 rounded-sm" />
            <span>Extremely Bearish</span>
         </div>
         <div className="flex items-center gap-1">
            <span>Extremely Bullish</span>
            <div className="w-2 h-2 bg-emerald-500/40 rounded-sm" />
         </div>
      </div>
    </div>
  );
};
