import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  History,
  Activity,
  Cpu,
  RefreshCw,
  TrendingUp,
  Globe,
  Coins,
  BarChart4,
  Home,
  Zap,
  Newspaper,
  MessageSquare
} from 'lucide-react';
import { MarketChart } from './components/MarketChart.tsx';
import { AIAnalyst } from './components/AIAnalyst.tsx';
import { AIChat } from './components/AIChat.tsx';
import { analyzeMarket } from './services/geminiService.ts';
import { 
  PricePoint, 
  Portfolio, 
  Trade, 
  AIRecommendation,
  Position
} from './types.ts';
import { INITIAL_BALANCE, UPDATE_INTERVAL, SYMBOLS, MARKET_CATEGORIES } from './constants.ts';

import { MarketNews } from './components/MarketNews.tsx';
import { SignalScanner } from './components/SignalScanner.tsx';
import { MarketHeatmap } from './components/MarketHeatmap.tsx';

export default function App() {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState(SYMBOLS[0]);
  const [isAmharic, setIsAmharic] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof MARKET_CATEGORIES>('CRYPTO');
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'SIGNALS' | 'NEWS' | 'CHAT'>('HOME');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  const [portfolio, setPortfolio] = useState<Portfolio>(() => ({
    balance: INITIAL_BALANCE,
    holdings: SYMBOLS.reduce((acc, sym) => ({ ...acc, [sym]: 0 }), {})
  }));
  const [trades, setTrades] = useState<Trade[]>([]);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [leverage, setLeverage] = useState(10);
  const [buyAmount, setBuyAmount] = useState(0.1);
  const [totalCommission, setTotalCommission] = useState(0);

  const COMMISSION_RATE = 0.001; // 0.1%

  // Simulated live signals for other markets
  const [signals, setSignals] = useState<{ [key: string]: string }>({
    'BTC': 'BUY',
    'ETH': 'SELL',
    'EUR/USD': 'HOLD',
    'AAPL': 'BUY'
  });

  // Initialize and update prices
  useEffect(() => {
    let lastPrice = currentSymbol.includes('/') ? 1.05 + Math.random() * 0.1 : 
                    currentSymbol === 'BTC' ? 65000 : 
                    currentSymbol === 'ETH' ? 3500 : 
                    150 + Math.random() * 100;
    
    const initialData: PricePoint[] = Array.from({ length: 50 }, (_, i) => {
      lastPrice = lastPrice * (1 + (Math.random() - 0.5) * 0.005);
      return {
        time: new Date(Date.now() - (50 - i) * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: lastPrice,
        timestamp: Date.now() - (50 - i) * 5000
      };
    });
    setPrices(initialData);

    const interval = setInterval(() => {
      setPrices(prev => {
        if (prev.length === 0) return [];
        const last = prev[prev.length - 1];
        const nextPrice = last.price * (1 + (Math.random() - 0.5) * 0.002);
        const next = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: nextPrice,
          timestamp: Date.now()
        };
        return [...prev.slice(1), next];
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentSymbol]);

  const currentPrice = prices.length > 0 ? prices[prices.length - 1].price : 0;

  // Liquidation check
  useEffect(() => {
    if (prices.length === 0) return;
    const currentPrice = prices[prices.length - 1].price;
    
    setPositions(prev => {
      const active = prev.filter(p => {
        if (p.type === 'LONG' && currentPrice <= p.liquidationPrice) return false;
        if (p.type === 'SHORT' && currentPrice >= p.liquidationPrice) return false;
        return true;
      });
      return active;
    });
  }, [prices]);

  const calculatePnL = (pos: Position) => {
    const diff = pos.type === 'LONG' 
      ? currentPrice - pos.entryPrice 
      : pos.entryPrice - currentPrice;
    return (diff * pos.amount) * pos.leverage;
  };

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const margin = (buyAmount * currentPrice) / leverage;
    const commission = margin * COMMISSION_RATE;
    const totalCost = margin + commission;
    
    if (portfolio.balance >= totalCost) {
      const liqPrice = type === 'LONG' 
        ? currentPrice * (1 - 0.8 / leverage) 
        : currentPrice * (1 + 0.8 / leverage);

      const newPosition: Position = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: currentSymbol,
        type,
        entryPrice: currentPrice,
        amount: buyAmount,
        leverage,
        margin,
        liquidationPrice: liqPrice,
        timestamp: Date.now()
      };

      setPositions(prev => [...prev, newPosition]);
      setPortfolio(prev => ({ ...prev, balance: prev.balance - totalCost }));
      setTotalCommission(prev => prev + commission);
      addTrade(type === 'LONG' ? 'BUY' : 'SELL', currentPrice, buyAmount);
    }
  };

  const closePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    const pnl = calculatePnL(pos);
    setPortfolio(prev => ({ ...prev, balance: prev.balance + pos.margin + pnl }));
    setPositions(prev => prev.filter(p => p.id !== id));
    addTrade(pos.type === 'LONG' ? 'SELL' : 'BUY', currentPrice, pos.amount);
  };

  const addTrade = (type: 'BUY' | 'SELL', price: number, amount: number) => {
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: currentSymbol,
      type,
      price,
      amount,
      timestamp: Date.now()
    };
    setTrades(prev => [newTrade, ...prev].slice(0, 10));
  };

  const runAnalysis = async () => {
    setIsAiLoading(true);
    const rec = await analyzeMarket(currentSymbol, prices);
    setAiRec(rec);
    setIsAiLoading(false);
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Floating AI Assistant FAB */}
      <div className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[70] hidden sm:block">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all ${isChatOpen ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-black'}`}
        >
          {isChatOpen ? <RefreshCw className="rotate-45" size={24} /> : <MessageSquare size={24} />}
        </motion.button>

        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-20 right-0 w-[380px] h-[550px] shadow-2xl rounded-2xl overflow-hidden border border-white/10"
          >
            <AIChat symbol={currentSymbol} price={currentPrice} isAmharic={isAmharic} />
          </motion.div>
        )}
      </div>

      {/* Splash Screen */}
      {isInitialLoading && (
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
          >
            <Cpu size={40} className="text-black" />
          </motion.div>
          <h1 className="text-2xl font-black tracking-tighter mb-2">BIRUK INTEL</h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-mono">Initializing Pulse Engine</span>
          </div>
        </motion.div>
      )}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md hidden xl:flex flex-col p-6 z-40">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Market Explorer</h3>
        
        <div className="space-y-6">
          {(Object.entries(MARKET_CATEGORIES) as [keyof typeof MARKET_CATEGORIES, string[]][]).map(([cat, list]) => (
            <div key={cat}>
              <button 
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase transition-colors ${activeCategory === cat ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
              >
                {cat === 'CRYPTO' && <Coins size={14} />}
                {cat === 'STOCKS' && <BarChart4 size={14} />}
                {cat === 'FOREX' && <Globe size={14} />}
                {cat}
              </button>
              {activeCategory === cat && (
                <div className="grid grid-cols-2 gap-1 pl-4">
                  {list.map(sym => (
                    <button 
                      key={sym}
                      onClick={() => setCurrentSymbol(sym)}
                      className={`text-[10px] text-left py-1.5 px-2 rounded transition-all flex items-center justify-between ${currentSymbol === sym ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {sym}
                      {signals[sym] && (
                        <div className={`w-1 h-1 rounded-full ${signals[sym] === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">PRO Signal</h4>
            <p className="text-[10px] text-gray-400 leading-tight">Biruk AI detected high volatility on {currentSymbol}. Check signal.</p>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50 h-16">
        <div className="max-w-[1700px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <Cpu size={18} className="text-black" />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold tracking-tighter leading-none">BIRUK INTEL</h1>
                <button 
                  onClick={() => setIsAmharic(!isAmharic)}
                  className="text-[9px] font-black tracking-widest text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500 hover:text-black transition-all uppercase"
                >
                  {isAmharic ? 'English' : 'አማርኛ'}
                </button>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Institutional Analysis Hub • Pro AI</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Live Multi-Scanner</p>
              <div className="flex items-center gap-4 overflow-hidden">
                 {['EUR/USD', 'BTC', 'NVDA'].map(s => (
                   <div key={s} className="flex flex-col text-right">
                      <span className="text-[8px] font-mono text-gray-600 leading-none">{s}</span>
                      <span className={`text-[10px] font-black leading-none ${signals[s] === 'BUY' ? 'text-emerald-500' : signals[s] === 'SELL' ? 'text-rose-500' : 'text-gray-400'}`}>
                        {signals[s]}
                      </span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto xl:pl-64 p-4 sm:p-6 flex flex-col lg:flex-row gap-6 pb-24 lg:pb-6">
          {/* Left Column: Chart & Intelligence */}
          <div className={`flex-1 flex flex-col gap-6 ${activeScreen !== 'HOME' ? 'hidden lg:flex' : 'flex'}`}>
            <MarketChart data={prices} symbol={currentSymbol} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Overview */}
              <div className="space-y-6">
                <MarketHeatmap isAmharic={isAmharic} />
                <div className="bg-transparent border-none rounded-xl overflow-hidden flex flex-col h-[500px]">
                  <SignalScanner isAmharic={isAmharic} onSelect={setCurrentSymbol} />
                </div>
              </div>

              {/* Pro Insights */}
              <div className="bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={24} className="text-emerald-500" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">
                  {isAmharic ? 'የባለሙያ መረጃ (Expert Info)' : 'Expert Signals'}
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed max-w-[200px]">
                  {isAmharic ? 'የሊኩዊዲቲ ቀጣናዎችን (Liquidity Zones) እና የዋጋ እንቅስቃሴን (Price Action/SMC) መሠረት ያደረገ ትንተና።' : 'Analysis based on Liquidity Zones, Market Structure, and Institutional Price Action.'}
                </p>
              </div>
            </div>

            {/* Confirmation Log (Simplified History) */}
            <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-white/90 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <History size={16} className="text-purple-400" />
                {isAmharic ? 'የቅርብ ግዜ እንቅስቃሴዎች' : 'Recent Signal Logs'}
              </h3>
              <div className="space-y-2 h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {trades.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <TrendingUp size={32} />
                    <p className="text-[10px] mt-2 uppercase tracking-widest font-mono">No Signals Recorded</p>
                  </div>
                ) : (
                  trades.map(trade => (
                    <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${trade.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                          {trade.type === 'BUY' ? <ArrowUpRight size={14} className="text-emerald-400"/> : <ArrowDownRight size={14} className="text-rose-400"/>}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold leading-none">SIGNAL: {trade.symbol}</p>
                          <p className="text-[8px] text-gray-500 font-mono mt-1 uppercase">{new Date(trade.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono leading-none">${trade.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        {/* Right Column: AI & Analysis */}
        <div className={`w-full lg:w-[400px] flex flex-col gap-6 ${activeScreen === 'HOME' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Mobile Screen Conditional Content */}
          <div className="lg:hidden contents">
            {activeScreen === 'SIGNALS' && (
              <div className="h-[600px] bg-transparent">
                <SignalScanner isAmharic={isAmharic} onSelect={(s) => { setCurrentSymbol(s); setActiveScreen('HOME'); }} />
              </div>
            )}
            
            {activeScreen === 'NEWS' && (
               <MarketNews isAmharic={isAmharic} />
            )}

            {activeScreen === 'CHAT' && (
               <AIChat symbol={currentSymbol} price={currentPrice} isAmharic={isAmharic} />
            )}
          </div>

          {/* Desktop Always-Show content or Analysis button */}
          <div className={`${activeScreen !== 'HOME' && 'hidden lg:flex'} flex flex-col gap-6`}>
            <button 
              onClick={runAnalysis}
              disabled={isAiLoading}
              className="group relative h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <RefreshCw size={18} className={isAiLoading ? 'animate-spin' : ''} />
                {isAmharic ? 'የቢሩክ AI ገበያ ትንተና ጀምር' : 'GENERATE EXPERT ANALYTICS'}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
            </button>
            
            <AIAnalyst recommendation={aiRec} loading={isAiLoading} />

            <div className="hidden lg:block space-y-6">
              <MarketNews isAmharic={isAmharic} />
              <AIChat symbol={currentSymbol} price={currentPrice} isAmharic={isAmharic} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/5 h-20 px-6 flex items-center justify-between xl:hidden z-[60]">
        {[
          { id: 'HOME', icon: Home, label: isAmharic ? 'ቤት' : 'Home' },
          { id: 'SIGNALS', icon: Zap, label: isAmharic ? 'ሲግናል' : 'Signals' },
          { id: 'NEWS', icon: Newspaper, label: isAmharic ? 'ዜና' : 'News' },
          { id: 'CHAT', icon: MessageSquare, label: isAmharic ? 'AI ቻት' : 'AI Chat' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveScreen(item.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${activeScreen === item.id ? 'text-emerald-500 scale-110' : 'text-gray-500'}`}
          >
            <item.icon size={22} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="max-w-[1700px] mx-auto px-6 py-12 border-t border-white/5 mt-12 bg-[#080808]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
             <div className="flex items-center gap-2 mb-4">
                <Cpu size={24} className="text-emerald-500" />
                <h2 className="text-xl font-black tracking-tighter">BIRUK TRADE AI</h2>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                Next-generation algorithm trading terminal. Built with Gemini Pulse™ for institutional-grade market predictive analytics.
             </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Infrastructure</h4>
            <div className="space-y-2 flex flex-col">
              <a href="#" className="text-[10px] text-gray-600 hover:text-white font-mono">CLOUD_EXECUTION</a>
              <a href="#" className="text-[10px] text-gray-600 hover:text-white font-mono">LATENCY_CORE</a>
              <a href="#" className="text-[10px] text-gray-600 hover:text-white font-mono">QUANT_GATEWAY</a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Legal</h4>
            <div className="space-y-2 flex flex-col">
              <a href="#" className="text-[10px] text-gray-600 hover:text-white font-mono">SIMULATION_ONLY</a>
              <a href="#" className="text-[10px] text-gray-600 hover:text-white font-mono">RISK_DISCLOSURE</a>
              <a href="#" className="text-[10px] text-gray-600 hover:text-white font-mono">TERMS_V1.2</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
