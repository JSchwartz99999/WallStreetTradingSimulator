import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Wall Street Simulator! 📈',
    content:
      'This is a paper trading simulator where you can practice trading stocks, commodities, and bonds with virtual money. No real money is involved!',
    highlight: null,
  },
  {
    title: 'Market Overview',
    content:
      'Browse available assets in the Market Overview section. Click on any asset to select it for trading. Use the filter buttons to show only stocks, commodities, or bonds.',
    highlight: 'market-overview',
  },
  {
    title: 'Trading Panel',
    content:
      'Once you select an asset, use the Trading Panel to buy or sell. Choose between Market orders (instant execution at current price) or Limit orders (execution at your specified price).',
    highlight: 'trading-panel',
  },
  {
    title: 'Your Portfolio',
    content:
      'Track your holdings in the Portfolio section. You can see your positions, average purchase price, and current profit/loss for each asset.',
    highlight: 'portfolio',
  },
  {
    title: 'Price Charts',
    content:
      'Analyze price movements with interactive candlestick charts. Switch between different timeframes (1D, 5D, 1M, 3M, 1Y) to see historical trends.',
    highlight: 'charts',
  },
  {
    title: 'Watchlist & Alerts',
    content:
      'Star your favorite assets to add them to your Watchlist. Set Price Alerts to get notified when a stock reaches your target price.',
    highlight: 'watchlist',
  },
  {
    title: 'Analytics Dashboard',
    content:
      'Review your trading performance in the Analytics Dashboard. See your portfolio allocation, win rate, and other key metrics.',
    highlight: 'analytics',
  },
  {
    title: "You're Ready! 🚀",
    content:
      'Start with $100,000 in virtual cash. Experiment with different strategies, learn from your trades, and have fun! You can always reset your portfolio to start fresh.',
    highlight: null,
  },
];

export function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const showTutorial = useSettingsStore((state) => state.showTutorial);
  const completeTutorial = useSettingsStore((state) => state.completeTutorial);
  const setShowTutorial = useSettingsStore((state) => state.setShowTutorial);

  if (!showTutorial) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    setShowTutorial(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index <= currentStep ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <div className="text-sm text-gray-400 mb-2">
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
        <p className="text-gray-300 mb-6 leading-relaxed">{step.content}</p>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="secondary" onClick={handlePrev}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TutorialButton() {
  const setShowTutorial = useSettingsStore((state) => state.setShowTutorial);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowTutorial(true)}
      aria-label="Show tutorial"
      title="Show tutorial"
    >
      ❓
    </Button>
  );
}
