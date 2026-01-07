import { config } from './config';
import type { FinnhubWebSocketMessage } from './types';

type TradeCallback = (symbol: string, price: number, volume: number) => void;
type ConnectionCallback = (connected: boolean) => void;

/**
 * Finnhub WebSocket Manager for real-time price updates
 */
class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions = new Set<string>();
  private tradeCallbacks: TradeCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Check if WebSocket is available
   */
  isAvailable(): boolean {
    return config.hasApiKey;
  }

  /**
   * Connect to WebSocket
   */
  connect(): void {
    if (!this.isAvailable()) {
      console.log('WebSocket not available - no API key');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`${config.wsUrl}?token=${config.apiKey}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnection(true);

        // Resubscribe to all symbols
        this.subscriptions.forEach((symbol) => {
          this.sendSubscribe(symbol);
        });

        // Set up ping interval to keep connection alive
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            // Finnhub doesn't require explicit pings, but we can check connection
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: FinnhubWebSocketMessage = JSON.parse(event.data);

          if (message.type === 'trade' && message.data) {
            message.data.forEach((trade) => {
              this.tradeCallbacks.forEach((cb) => {
                cb(trade.s, trade.p, trade.v);
              });
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyConnection(false);
        this.cleanup();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.cleanup();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to real-time trades for a symbol
   */
  subscribe(symbol: string): void {
    this.subscriptions.add(symbol);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(symbol);
    }
  }

  /**
   * Unsubscribe from a symbol
   */
  unsubscribe(symbol: string): void {
    this.subscriptions.delete(symbol);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  /**
   * Subscribe to multiple symbols
   */
  subscribeAll(symbols: string[]): void {
    symbols.forEach((symbol) => this.subscribe(symbol));
  }

  /**
   * Add a callback for trade updates
   */
  onTrade(callback: TradeCallback): () => void {
    this.tradeCallbacks.push(callback);

    return () => {
      const index = this.tradeCallbacks.indexOf(callback);
      if (index > -1) {
        this.tradeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add a callback for connection status changes
   */
  onConnection(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);

    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private sendSubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  private notifyConnection(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();
