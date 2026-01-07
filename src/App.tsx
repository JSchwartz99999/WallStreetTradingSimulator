import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { Footer } from '@/components/layout/Footer';
import { MarketOverview } from '@/components/trading/MarketOverview';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { MarketStatus } from '@/components/trading/MarketStatus';
import { StopLossPanel } from '@/components/trading/StopLossPanel';
import { ChartSection } from '@/components/charts/ChartSection';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { TradeHistory } from '@/components/history/TradeHistory';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Watchlist } from '@/components/watchlist/Watchlist';
import { PriceAlerts } from '@/components/alerts/PriceAlerts';
import { Tutorial } from '@/components/tutorial/Tutorial';
import { Toast } from '@/components/ui/Toast';
import { ScreenReaderAnnouncer } from '@/components/ui/ScreenReaderAnnouncer';
import { useWebSocketInit } from '@/hooks/useWebSocket';
import { useAlertsStore } from '@/store/alertsStore';
import { useMarketStore } from '@/store/marketStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUIStore } from '@/store/uiStore';
import { soundManager } from '@/utils/sounds';

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

  const prices = useMarketStore((state) => state.prices);
  const showToast = useUIStore((state) => state.showToast);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const hasCompletedTutorial = useSettingsStore((state) => state.hasCompletedTutorial);
  const setShowTutorial = useSettingsStore((state) => state.setShowTutorial);

  // Use ref to track if tutorial has been shown
  const tutorialShownRef = useRef(false);

  // Sync sound settings
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Check price alerts when prices change (using store method directly to avoid dependency issues)
  useEffect(() => {
    const alerts = useAlertsStore.getState().alerts;
    const activeAlerts = alerts.filter(a => !a.triggered);

    activeAlerts.forEach((alert) => {
      const priceData = prices[alert.symbol];
      if (!priceData) return;

      const currentPrice = priceData.price;
      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        useAlertsStore.getState().triggerAlert(alert.id);
        showToast(
          `🔔 Alert: ${alert.symbol} reached ${alert.condition === 'above' ? 'above' : 'below'} $${alert.targetPrice.toFixed(2)}`,
          'info'
        );
        if (soundEnabled) {
          soundManager.playAlert();
        }
      }
    });
  }, [prices, showToast, soundEnabled]);

  // Show tutorial for first-time users (only once)
  useEffect(() => {
    if (!hasCompletedTutorial && !tutorialShownRef.current) {
      tutorialShownRef.current = true;
      setShowTutorial(true);
    }
  }, [hasCompletedTutorial, setShowTutorial]);

  return (
    <div className="min-h-screen text-gray-100 p-2 sm:p-4 transition-colors">
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
            <MarketOverview className="col-span-12 lg:col-span-5" />
            <TradingPanel className="col-span-12 lg:col-span-4" />
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <MarketStatus />
              <Watchlist />
            </div>
          </div>

          {/* Row 2: Charts, Portfolio, History */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 mb-4">
            <ChartSection className="col-span-12 lg:col-span-6" />
            <PortfolioSection className="col-span-12 lg:col-span-3" />
            <TradeHistory className="col-span-12 lg:col-span-3" />
          </div>

          {/* Row 3: Alerts, Stop-Loss */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 mb-4">
            <PriceAlerts className="col-span-12 lg:col-span-6" />
            <StopLossPanel className="col-span-12 lg:col-span-6" />
          </div>

          {/* Row 4: Analytics Dashboard */}
          <AnalyticsDashboard className="mb-4" />
        </main>

        <Footer />
      </div>

      <Toast />
      <ScreenReaderAnnouncer />
      <Tutorial />
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
