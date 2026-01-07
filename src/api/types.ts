// Finnhub API Response Types

export interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface FinnhubCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  v: number[];  // Volumes
  t: number[];  // Timestamps (UNIX)
  s: 'ok' | 'no_data';
}

export interface FinnhubWebSocketTrade {
  type: 'trade';
  data: Array<{
    s: string;  // Symbol
    p: number;  // Last price
    t: number;  // UNIX timestamp in milliseconds
    v: number;  // Volume
    c?: string[]; // Conditions
  }>;
}

export interface FinnhubWebSocketPing {
  type: 'ping';
}

export type FinnhubWebSocketMessage = FinnhubWebSocketTrade | FinnhubWebSocketPing;

export interface FinnhubError {
  error: string;
}

// Custom error for rate limiting
export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Custom error for API errors
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}
