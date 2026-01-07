import { useQuery } from '@tanstack/react-query';
import { finnhub } from '@/api/finnhub';
import { useMarketStore } from '@/store/marketStore';

/**
 * Hook to fetch and cache quote data for a symbol
 */
export function useQuote(symbol: string, enabled = true) {
  const setPrice = useMarketStore((state) => state.setPrice);

  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: async () => {
      const quote = await finnhub.getQuote(symbol);

      // Update market store with the new price
      setPrice(symbol, quote.c, quote.d, quote.dp);

      return quote;
    },
    enabled: enabled && finnhub.isAvailable(),
    staleTime: 5000, // Consider fresh for 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch quotes for multiple symbols
 */
export function useQuotes(symbols: string[], enabled = true) {
  const setPrice = useMarketStore((state) => state.setPrice);

  return useQuery({
    queryKey: ['quotes', symbols],
    queryFn: async () => {
      const quotes = await finnhub.getQuotes(symbols);

      // Update market store with all prices
      Object.entries(quotes).forEach(([symbol, quote]) => {
        setPrice(symbol, quote.c, quote.d, quote.dp);
      });

      return quotes;
    },
    enabled: enabled && finnhub.isAvailable() && symbols.length > 0,
    staleTime: 5000,
    refetchInterval: 30000, // Refetch every 30 seconds for batch
    retry: 2,
  });
}
