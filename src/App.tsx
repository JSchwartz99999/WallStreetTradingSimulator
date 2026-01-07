import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { Footer } from '@/components/layout/Footer';
import { MarketOverview } from '@/components/trading/MarketOverview';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { MarketStatus } from '@/components/trading/MarketStatus';
import { ChartSection } from '@/components/charts/ChartSection';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { TradeHistory } from '@/components/history/TradeHistory';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Toast } from '@/components/ui/Toast';
import { ScreenReaderAnnouncer } from '@/components/ui/ScreenReaderAnnouncer';
import { useWebSocketInit } from '@/hooks/useWebSocket';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  // Initialize WebSocket connection and price simulation
  useWebSocketInit();

  return (
    <div className="min-h-screen text-gray-100 p-2 sm:p-4">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div
        className="max-w-7xl mx-auto"
        role="application"
        aria-label="Wall Street Trading Simulator"
      >
        <Header />
        <MarketTicker />

        <main id="main-content">
          {/* Row 1: Market Overview, Trading, Status */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 mb-4">
            <MarketOverview className="col-span-12 lg:col-span-6" />
            <TradingPanel className="col-span-12 lg:col-span-3" />
            <MarketStatus className="col-span-12 lg:col-span-3" />
          </div>

          {/* Row 2: Charts, Portfolio, History */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 mb-4">
            <ChartSection className="col-span-12 lg:col-span-6" />
            <PortfolioSection className="col-span-12 lg:col-span-3" />
            <TradeHistory className="col-span-12 lg:col-span-3" />
          </div>

          {/* Row 3: Analytics Dashboard */}
          <AnalyticsDashboard className="mb-4" />
        </main>

        <Footer />
      </div>

      <Toast />
      <ScreenReaderAnnouncer />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
