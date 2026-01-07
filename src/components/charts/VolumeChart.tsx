import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, HistogramData, Time } from 'lightweight-charts';
import { useCandlestick } from '@/hooks/useCandlestick';
import { useMarketStore } from '@/store/marketStore';
import { useUIStore } from '@/store/uiStore';

export function VolumeChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const prices = useMarketStore((state) => state.prices);
  const timeframe = useUIStore((state) => state.timeframe);

  const basePrice = prices[selectedSymbol]?.price ?? 100;
  const { data } = useCandlestick(selectedSymbol, timeframe, basePrice);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 80,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
    });

    const histogramSeries = chart.addHistogramSeries({
      color: 'rgba(107, 114, 128, 0.5)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current = chart;
    seriesRef.current = histogramSeries;

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

    const volumeData: HistogramData[] = data.map((candle) => ({
      time: candle.time as Time,
      value: candle.volume ?? 0,
      color: candle.close >= candle.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }));

    seriesRef.current.setData(volumeData);
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full mt-2"
      role="img"
      aria-label={`Volume chart for ${selectedSymbol}`}
    />
  );
}
