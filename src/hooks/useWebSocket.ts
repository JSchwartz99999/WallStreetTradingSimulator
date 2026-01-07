import { useEffect } from 'react';
import { wsManager } from '@/api/websocket';
import { useMarketStore } from '@/store/marketStore';
import { TICKER_SYMBOLS } from '@/utils/constants';

/**
 * Hook to initialize and manage WebSocket connection
 */
export function useWebSocketInit() {
  const updatePriceFromWebSocket = useMarketStore((state) => state.updatePriceFromWebSocket);
  const setConnected = useMarketStore((state) => state.setConnected);
  const setSimulated = useMarketStore((state) => state.setSimulated);
  const initializeFallbackPrices = useMarketStore((state) => state.initializeFallbackPrices);
  const simulatePriceMovement = useMarketStore((state) => state.simulatePriceMovement);

  useEffect(() => {
    // Initialize with fallback prices first
    initializeFallbackPrices();

    if (wsManager.isAvailable()) {
      // Set up WebSocket callbacks
      const unsubscribeTrade = wsManager.onTrade((symbol, price) => {
        updatePriceFromWebSocket(symbol, price);
      });

      const unsubscribeConnection = wsManager.onConnection((connected) => {
        setConnected(connected);
        setSimulated(!connected);
      });

      // Connect and subscribe to all symbols
      wsManager.connect();
      wsManager.subscribeAll(TICKER_SYMBOLS);

      return () => {
        unsubscribeTrade();
        unsubscribeConnection();
        wsManager.disconnect();
      };
    } else {
      // No API key - use simulated data
      setSimulated(true);
      setConnected(false);

      // Simulate price movements every 3 seconds
      const interval = setInterval(() => {
        simulatePriceMovement();
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [
    initializeFallbackPrices,
    updatePriceFromWebSocket,
    setConnected,
    setSimulated,
    simulatePriceMovement,
  ]);
}

/**
 * Hook to subscribe to a specific symbol
 */
export function useSymbolSubscription(symbol: string) {
  useEffect(() => {
    if (wsManager.isAvailable()) {
      wsManager.subscribe(symbol);

      return () => {
        wsManager.unsubscribe(symbol);
      };
    }
  }, [symbol]);
}

/**
 * Hook to get connection status
 */
export function useConnectionStatus() {
  const isConnected = useMarketStore((state) => state.isConnected);
  const isSimulated = useMarketStore((state) => state.isSimulated);

  return { isConnected, isSimulated };
}
