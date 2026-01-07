import { config } from './config';
import { apiRateLimiter } from '@/utils/security';
import type { FinnhubQuote, FinnhubCandle } from './types';
import { RateLimitError, APIError } from './types';

/**
 * Finnhub REST API Client
 */
class FinnhubClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * Check if API is available
   */
  isAvailable(): boolean {
    return config.hasApiKey;
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.isAvailable()) {
      throw new Error('Finnhub API key not configured');
    }

    // Wait for rate limiter
    await apiRateLimiter.acquire();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('token', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());

    if (response.status === 429) {
      throw new RateLimitError();
    }

    if (!response.ok) {
      throw new APIError(`API error: ${response.statusText}`, response.status);
    }

    return response.json();
  }

  /**
   * Get current quote for a symbol
   */
  async getQuote(symbol: string): Promise<FinnhubQuote> {
    return this.request<FinnhubQuote>('/quote', { symbol });
  }

  /**
   * Get candlestick data for a symbol
   * @param symbol - Stock symbol
   * @param resolution - Supported resolution includes 1, 5, 15, 30, 60, D, W, M
   * @param from - UNIX timestamp for start
   * @param to - UNIX timestamp for end
   */
  async getCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number
  ): Promise<FinnhubCandle> {
    return this.request<FinnhubCandle>('/stock/candle', {
      symbol,
      resolution,
      from: String(from),
      to: String(to),
    });
  }

  /**
   * Get multiple quotes at once
   */
  async getQuotes(symbols: string[]): Promise<Record<string, FinnhubQuote>> {
    const quotes: Record<string, FinnhubQuote> = {};

    // Fetch quotes sequentially to respect rate limits
    for (const symbol of symbols) {
      try {
        quotes[symbol] = await this.getQuote(symbol);
        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to fetch quote for ${symbol}:`, error);
      }
    }

    return quotes;
  }
}

// Export singleton instance
export const finnhub = new FinnhubClient();
