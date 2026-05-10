import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AIRecommendation } from '../types';

interface AIAnalystProps {
  recommendation: AIRecommendation | null;
  loading: boolean;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ recommendation, loading }) => {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between border-bottom border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-widest">Biruk AI Analyst</h3>
        </div>
        {loading && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        {!recommendation && !loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <p className="text-gray-500 text-sm italic">Analyze market data to get signals...</p>
          </motion.div>
        ) : (
          <motion.div 
            key={recommendation?.signal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Signal</span>
              <div className={`px-4 py-1 rounded-full text-xs font-bold font-mono tracking-tighter ${
                recommendation?.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                recommendation?.signal === 'SELL' ? 'bg-rose-500/20 text-rose-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {recommendation?.signal}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${recommendation?.confidence}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <span className="text-xs font-mono text-white">{recommendation?.confidence}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block">Insight</span>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                {recommendation?.reasoning}
              </p>
            </div>

            {recommendation?.entry && (
              <div className="pt-4 grid grid-cols-3 gap-2">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[8px] text-gray-500 uppercase block leading-none mb-1">Entry</span>
                  <span className="text-xs font-mono text-blue-400 leading-none">${recommendation.entry.toLocaleString()}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[8px] text-gray-500 uppercase block leading-none mb-1">Target</span>
                  <span className="text-xs font-mono text-emerald-400 leading-none">${recommendation.target?.toLocaleString()}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[8px] text-gray-500 uppercase block leading-none mb-1">Stop Loss</span>
                  <span className="text-xs font-mono text-rose-400 leading-none">${recommendation.stopLoss?.toLocaleString()}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
