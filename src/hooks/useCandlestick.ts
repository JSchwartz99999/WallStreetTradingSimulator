import { useQuery } from '@tanstack/react-query';
import { finnhub } from '@/api/finnhub';
import { TIMEFRAME_RESOLUTION, type Timeframe } from '@/utils/constants';
import type { CandleData } from '@/store/types';

/**
 * Calculate time range based on timeframe
 */
function getTimeRange(timeframe: Timeframe): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;

  switch (timeframe) {
    case '1D':
      return { from: now - day, to: now };
    case '5D':
      return { from: now - day * 5, to: now };
    case '1M':
      return { from: now - day * 30, to: now };
    case '3M':
      return { from: now - day * 90, to: now };
    case '1Y':
      return { from: now - day * 365, to: now };
    default:
      return { from: now - day, to: now };
  }
}

/**
 * Generate simulated candlestick data for fallback
 */
function generateSimulatedCandles(basePrice: number, count: number): CandleData[] {
  const candles: CandleData[] = [];
  const now = Date.now();
  const interval = 300000; // 5 minutes in ms

  let price = basePrice * 0.98;

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * (basePrice * 0.01);
    const close = Math.max(0.01, price + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    candles.push({
      time: Math.floor((now - i * interval) / 1000),
      open,
      high,
      low,
      close,
      volume,
    });

    price = close;
  }

  return candles;
}

/**
 * Hook to fetch candlestick data for a symbol
 */
export function useCandlestick(symbol: string, timeframe: Timeframe, basePrice?: number) {
  return useQuery({
    queryKey: ['candles', symbol, timeframe],
    queryFn: async (): Promise<CandleData[]> => {
      if (!finnhub.isAvailable()) {
        // Return simulated data if no API key
        return generateSimulatedCandles(basePrice ?? 100, 50);
      }

      const resolution = TIMEFRAME_RESOLUTION[timeframe];
      const { from, to } = getTimeRange(timeframe);

      const data = await finnhub.getCandles(symbol, resolution, from, to);

      if (data.s === 'no_data' || !data.t || data.t.length === 0) {
        // Return simulated data if no real data available
        return generateSimulatedCandles(basePrice ?? 100, 50);
      }

      // Transform to our format
      return data.t.map((time, i) => ({
        time,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }));
    },
    staleTime: 60000, // Consider fresh for 1 minute
    refetchInterval: 60000, // Refetch every minute
    retry: 1,
  });
}
