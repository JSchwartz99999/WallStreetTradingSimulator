import { Card } from '@/components/ui/Card';

export function Footer() {
  return (
    <Card className="text-center text-gray-400 text-sm">
      <p>Wall Street Trading Simulator - For Educational Purposes Only</p>
      <p className="mt-1">Data is simulated and does not represent real market conditions</p>
      <p className="mt-2 text-xs">
        <a
          href="https://github.com/JSchwartz99999/WallStreetTradingSimulator"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </p>
    </Card>
  );
}
