// Asset definitions with current market data
export interface Asset {
  name: string;
  type: 'stocks' | 'commodities' | 'bonds';
  symbol: string;
}

export const ASSETS: Record<string, Asset> = {
  // Stocks
  AAPL: { name: 'Apple Inc.', type: 'stocks', symbol: 'AAPL' },
  MSFT: { name: 'Microsoft', type: 'stocks', symbol: 'MSFT' },
  TSLA: { name: 'Tesla Inc.', type: 'stocks', symbol: 'TSLA' },
  GOOGL: { name: 'Alphabet', type: 'stocks', symbol: 'GOOGL' },
  AMZN: { name: 'Amazon', type: 'stocks', symbol: 'AMZN' },
  META: { name: 'Meta Platforms', type: 'stocks', symbol: 'META' },
  NVDA: { name: 'NVIDIA', type: 'stocks', symbol: 'NVDA' },
  JPM: { name: 'JPMorgan Chase', type: 'stocks', symbol: 'JPM' },
  // Commodities (using futures symbols)
  GC: { name: 'Gold', type: 'commodities', symbol: 'GC' },
  CL: { name: 'Crude Oil', type: 'commodities', symbol: 'CL' },
  SI: { name: 'Silver', type: 'commodities', symbol: 'SI' },
  // Bonds (using index symbols)
  TNX: { name: '10Y Treasury', type: 'bonds', symbol: 'TNX' },
  TYX: { name: '30Y Treasury', type: 'bonds', symbol: 'TYX' },
};

// Symbols for the scrolling ticker
export const TICKER_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];

// Valid symbols set for O(1) lookup
export const VALID_SYMBOLS = new Set(Object.keys(ASSETS));

// Initial portfolio values
export const INITIAL_CASH = 100000;
export const STORAGE_KEY = 'wallStreetSimulator';
export const STORAGE_VERSION = '2.0';

// Fallback prices (used when API is unavailable)
export const FALLBACK_PRICES: Record<string, { price: number; change: number }> = {
  AAPL: { price: 262.24, change: -5.02 },
  MSFT: { price: 475.00, change: 2.15 },
  TSLA: { price: 432.96, change: -18.71 },
  GOOGL: { price: 314.34, change: -2.36 },
  AMZN: { price: 240.92, change: 7.86 },
  META: { price: 660.46, change: 1.67 },
  NVDA: { price: 187.27, change: -0.85 },
  JPM: { price: 334.29, change: 1.75 },
  GC: { price: 4478.24, change: 30.24 },
  CL: { price: 58.15, change: -0.17 },
  SI: { price: 81.52, change: 4.97 },
  TNX: { price: 4.19, change: 0.02 },
  TYX: { price: 4.88, change: 0.03 },
};

// API rate limits
export const API_RATE_LIMIT = 60; // calls per minute
export const API_RATE_WINDOW = 60000; // 1 minute in ms

// Chart timeframes
export type Timeframe = '1D' | '5D' | '1M' | '3M' | '1Y';
export const TIMEFRAMES: Timeframe[] = ['1D', '5D', '1M', '3M', '1Y'];

// Resolution mapping for Finnhub API
export const TIMEFRAME_RESOLUTION: Record<Timeframe, string> = {
  '1D': '5',   // 5 minute bars
  '5D': '15',  // 15 minute bars
  '1M': '60',  // 1 hour bars
  '3M': 'D',   // Daily bars
  '1Y': 'D',   // Daily bars
};

// Order types
export type OrderType = 'market' | 'limit';

// Asset filter types
export type AssetFilter = 'all' | 'stocks' | 'commodities' | 'bonds';

// Chart tab types
export type ChartTab = 'chart' | 'orderbook' | 'news';
