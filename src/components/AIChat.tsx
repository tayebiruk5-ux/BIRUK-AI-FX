import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface AIChatProps {
  symbol: string;
  price: number;
}

export const AIChat: React.FC<AIChatProps & { isAmharic: boolean }> = ({ symbol, price, isAmharic }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = isAmharic 
    ? [`ስለኛኛው ${symbol} የገበያ ሁኔታ ንገረኝ`, 'የመግዣ ሰዓቱ አሁን ነው?', 'የቴክኒክ ትንተና ስጠኝ']
    : [`Analysis for ${symbol}`, 'Is it a good time to BUY?', 'Technical indicators?'];

  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        const welcome: Message = {
          role: 'model',
          parts: [{ 
            text: isAmharic 
              ? `ሰላም! እኔ የቢሩክ ኢንቴል (Biruk Intel) AI ረዳት ነኝ። ዛሬ ስለ ${symbol} የገበያ ሁኔታ ምን ማወቅ ይፈልጋሉ?` 
              : `Welcome to Biruk Intel. I am your institutional analysis partner. How can I assist you with ${symbol} market structure and liquidity today?` 
          }]
        };
        setMessages([welcome]);
      }, 500);
    }
  }, [symbol, isAmharic]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: messageText }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithAI(symbol, price, messageText, messages);
    
    const botMessage: Message = { role: 'model', parts: [{ text: responseText }] };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col h-[500px] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg">
            <Bot size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {isAmharic ? 'የቢሩክ AI ረዳት' : 'Biruk Intel Assistant'}
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-gray-500 font-mono uppercase">Neural Engine Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])} 
          className="text-gray-500 hover:text-rose-400 transition-colors p-2"
          title="Clear chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-white/[0.01]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-500/[0.02] rounded-lg border border-emerald-500/5">
            <motion.div 
               initial={{ scale: 0.8 }}
               animate={{ scale: 1 }}
               className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4"
            >
              <Bot size={32} className="text-emerald-500/40" />
            </motion.div>
            <p className="text-xs text-gray-400 font-medium">
              {isAmharic ? `${symbol}ን በተመለከተ ማንኛውንም ጥያቄ ይጠይቁኝ` : `Analysis for ${symbol}`}
            </p>
            <div className="mt-6 w-full space-y-2">
               {suggestions.map((s, idx) => (
                 <button 
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="w-full text-left p-3 text-[10px] text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/5 border border-white/5 rounded-lg transition-all"
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                m.role === 'user' 
                  ? 'bg-emerald-500 text-black font-bold rounded-tr-none' 
                  : 'bg-white/[0.03] text-gray-200 border border-white/10 rounded-tl-none'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-50">
                  {m.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                  <span className="text-[8px] uppercase tracking-tighter font-bold">
                    {m.role === 'user' ? (isAmharic ? 'እኔ' : 'ME') : (isAmharic ? 'ቢሩክ AI' : 'BIRUK INTEL')}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{m.parts[0].text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
              <div className="flex gap-1.5 focus-pulse">
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={(e) => handleSend('', e)} className="p-4 border-t border-white/5 bg-black">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAmharic ? 'ጥያቄዎን እዚህ ይጻፉ...' : 'Ask Biruk AI...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg p-2 disabled:opacity-30 transition-all active:scale-95"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};
