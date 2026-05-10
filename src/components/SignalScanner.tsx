import React from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, TrendingDown, Info, ShieldCheck, Zap } from 'lucide-react';

interface SignalInfo {
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
  reasoningAm: string;
  strength: number;
}

const MOCK_SIGNALS: SignalInfo[] = [
  { 
    symbol: 'EUR/USD', 
    type: 'BUY', 
    strength: 88,
    reasoning: 'Price rejected the daily support level at 1.0820 with a double bottom formation. Institutional liquidity grab detected.',
    reasoningAm: 'ዋጋው በ 1.0820 ያለውን የየቀኑ የድጋፍ ደረጃ (Daily Support) ውድቅ አድርጎ የሁለት ታች (Double Bottom) ቅርፅ ሰርቷል። የባለሀብቶች የገንዘብ እንቅስቃሴ (Institutional liquidity) ታይቷል።'
  },
  { 
    symbol: 'BTC', 
    type: 'SELL', 
    strength: 75,
    reasoning: 'RSI overbought on H4. Fair Value Gap (FVG) remains unfilled at 62k, indicating potential downside correction.',
    reasoningAm: 'በ H4 ቻርት ላይ RSI ከመጠን በላይ ተገዝቷል (Overbought)። በ62k አካባቢ ያልተሞላ የዋጋ ክፍተት (Fair Value Gap) ስላለ ዋጋው ሊቀንስ እንደሚችል ይጠቁማል።'
  },
  { 
    symbol: 'GBP/USD', 
    type: 'BUY', 
    strength: 92,
    reasoning: 'Bullish engulfing candle on H1 after CPI data release. Market structure shift (MSS) confirmed to the upside.',
    reasoningAm: 'የዋጋ ግሽበት መረጃ (CPI) ከወጣ በኋላ በ H1 ላይ ከፍተኛ የጭማሪ ምልክት (Bullish engulfing) ታይቷል። የገበያው መዋቅር ወደ ላይ መቀየሩ ተረጋግጧል።'
  },
  { 
    symbol: 'NVDA', 
    type: 'BUY', 
    strength: 95,
    reasoning: 'Strong quarterly earnings and AI GPU demand driving price discovery phase. Consolidating above 20 EMA.',
    reasoningAm: 'ጠንካራ የሩብ ዓመት ትርፍ እና የ AI GPU ፍላጎት ዋጋው አዲስ ደረጃ እንዲይዝ እያደረገ ነው። ከ 20 EMA በላይ እየተረጋጋ ይገኛል።'
  },
  { 
    symbol: 'ETH', 
    type: 'HOLD', 
    strength: 50,
    reasoning: 'Price stuck in a narrow range. Waiting for BTC breakout confirmation to determine next major direction.',
    reasoningAm: 'ዋጋው በጠባብ ክልል ውስጥ ተይዟል። የሚቀጥለውን አቅጣጫ ለመወሰን የ BTC መስመር ሰባሪ (Breakout) እየተጠበቀ ነው።'
  },
];

export const SignalScanner: React.FC<{ isAmharic: boolean; onSelect: (symbol: string) => void }> = ({ isAmharic, onSelect }) => {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-500/10 p-2 rounded-lg">
                <Zap size={20} className="text-blue-400" />
             </div>
             <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  {isAmharic ? 'የሲግናል ዳሽቦርድ' : 'Institutional Scanner'}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase">Live TradingView & OrderBook Sync</p>
             </div>
          </div>
          <ShieldCheck size={18} className="text-emerald-500/50" />
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Signals..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {MOCK_SIGNALS.map(signal => (
          <motion.div 
            key={signal.symbol}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelect(signal.symbol)}
            className="bg-white/[0.01] border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/[0.03] transition-all group border-l-4"
            style={{ borderLeftColor: signal.type === 'BUY' ? '#10b981' : signal.type === 'SELL' ? '#f43f5e' : '#6b7280' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white">{signal.symbol}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  signal.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' :
                  signal.type === 'SELL' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-white/10 text-gray-400'
                }`}>
                  {signal.type}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-mono">{signal.strength}% STR</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="mt-1 text-gray-600">
                <Info size={12} />
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                {isAmharic ? signal.reasoningAm : signal.reasoning}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[7px] text-gray-600 uppercase mb-1">Buy Pressure</p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, signal.strength + 10)}%` }} />
                  </div>
               </div>
               <div>
                  <p className="text-[7px] text-gray-600 uppercase mb-1">Dark Pool Alert</p>
                  <div className="flex items-center gap-1">
                     <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                     <span className="text-[8px] text-blue-400 font-mono">Institutional Activity</span>
                  </div>
               </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] text-gray-600 font-mono">LIVE FEED</span>
               </div>
               <div className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <TrendingUp size={10} />
                  <span className="text-[8px] font-black uppercase">{isAmharic ? 'ትንተና ተመልከት' : 'View Hub'}</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
