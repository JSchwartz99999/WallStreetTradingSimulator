import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useCandlestick } from '@/hooks/useCandlestick';
import { useMarketStore } from '@/store/marketStore';
import { useUIStore } from '@/store/uiStore';

export function PriceChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const prices = useMarketStore((state) => state.prices);
  const timeframe = useUIStore((state) => state.timeframe);

  const basePrice = prices[selectedSymbol]?.price ?? 100;
  const { data, isLoading } = useCandlestick(selectedSymbol, timeframe, basePrice);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(75, 85, 99, 0.3)' },
        horzLines: { color: 'rgba(75, 85, 99, 0.3)' },
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      crosshair: {
        vertLine: {
          color: '#6b7280',
          labelBackgroundColor: '#374151',
        },
        horzLine: {
          color: '#6b7280',
          labelBackgroundColor: '#374151',
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !data) return;

    const chartData: CandlestickData[] = data.map((candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 z-10">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full"
        role="img"
        aria-label={`Candlestick price chart for ${selectedSymbol}`}
      />
    </div>
  );
}
