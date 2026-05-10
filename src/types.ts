export interface NewsItem {
  id: string;
  title: string;
  titleAm: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  profit: number;
  winRate: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  amount: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  timestamp: number;
}

export interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
}

export interface Portfolio {
  balance: number;
  holdings: { [symbol: string]: number };
}

export interface AIRecommendation {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  entry?: number;
  target?: number;
  stopLoss?: number;
}
