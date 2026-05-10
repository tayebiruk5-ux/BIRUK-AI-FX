import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { NewsItem } from '../types';

const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'FED signals potential rate pause in next meeting', titleAm: 'ፌድ በሚቀጥለው ስብሰባ ላይ የወለድ መጠን እረፍት ሊያደርግ እንደሚችል ጠቆመ', impact: 'HIGH', sentiment: 'BULLISH', timestamp: Date.now() - 1000 * 60 * 15 },
  { id: '2', title: 'Major Whale transfers 50,000 ETH to cold storage', titleAm: 'አንድ ትልቅ ባለሀብት 50,000 ETH ወደ ቀዝቃዛ ክምችት አዛወረ', impact: 'MEDIUM', sentiment: 'NEUTRAL', timestamp: Date.now() - 1000 * 60 * 45 },
  { id: '3', title: 'Mining difficulty hits new all-time high', titleAm: 'የማውጣት ችግር (Mining difficulty) አዲስ ከፍተኛ ደረጃ ላይ ደርሷል', impact: 'LOW', sentiment: 'BULLISH', timestamp: Date.now() - 1000 * 60 * 120 },
  { id: '4', title: 'Tech stocks face volatility ahead of earnings', titleAm: 'የቴክኖሎጂ አክሲዮኖች ከሪፖርት በፊት አለመረጋጋት ገጥሟቸዋል', impact: 'HIGH', sentiment: 'BEARISH', timestamp: Date.now() - 1000 * 60 * 180 },
];

export const MarketNews: React.FC<{ isAmharic: boolean }> = ({ isAmharic }) => {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <Newspaper size={16} className="text-emerald-400" />
          {isAmharic ? 'የገበያ ዜና' : 'Market Intelligence'}
        </h3>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {MOCK_NEWS.map(news => (
          <motion.div 
            key={news.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-l-2 border-white/5 pl-4 py-1 hover:border-emerald-500/50 transition-colors cursor-default"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                news.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-500'
              }`}>
                {news.impact} Impact
              </span>
              <div className="flex items-center gap-1 text-[8px] font-mono text-gray-600">
                <Clock size={8} />
                {Math.floor((Date.now() - news.timestamp) / 60000)}m ago
              </div>
            </div>
            <h4 className="text-[11px] font-medium leading-tight text-white/80 group-hover:text-white">
              {isAmharic ? news.titleAm : news.title}
            </h4>
            <div className="flex items-center gap-1 mt-1.5">
              {news.sentiment === 'BULLISH' ? (
                <TrendingUp size={10} className="text-emerald-500" />
              ) : news.sentiment === 'BEARISH' ? (
                <TrendingDown size={10} className="text-rose-500" />
              ) : null}
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                news.sentiment === 'BULLISH' ? 'text-emerald-500/70' : 
                news.sentiment === 'BEARISH' ? 'text-rose-500/70' : 'text-gray-600'
              }`}>
                {news.sentiment}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
