import { useState, useRef, useEffect, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = trigger.top - tooltip.height - 8;
          left = trigger.left + trigger.width / 2 - tooltip.width / 2;
          break;
        case 'bottom':
          top = trigger.bottom + 8;
          left = trigger.left + trigger.width / 2 - tooltip.width / 2;
          break;
        case 'left':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2;
          left = trigger.left - tooltip.width - 8;
          break;
        case 'right':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2;
          left = trigger.right + 8;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - tooltip.height - 8));

      setCoords({ top, left });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={clsx(
            'fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
            'border border-gray-700 max-w-xs',
            'animate-fade-in'
          )}
          style={{ top: coords.top, left: coords.left }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
}

// Glossary of trading terms
export const TRADING_GLOSSARY: Record<string, string> = {
  'Market Order':
    'An order to buy or sell immediately at the current market price. Execution is guaranteed, but the price is not.',
  'Limit Order':
    'An order to buy or sell at a specific price or better. The order will only execute if the market reaches your price.',
  'Stop-Loss':
    'An order to sell a security when it reaches a certain price, designed to limit losses.',
  'P/L':
    'Profit and Loss - the net gain or loss on your investment.',
  'Position':
    'The amount of a security that you own (long position) or owe (short position).',
  'Portfolio':
    'A collection of all your investments and cash holdings.',
  'Volume':
    'The number of shares or contracts traded during a given period.',
  'Candlestick':
    'A chart type showing open, high, low, and close prices for a time period.',
  'Bid':
    'The highest price a buyer is willing to pay for a security.',
  'Ask':
    'The lowest price a seller is willing to accept for a security.',
  'Spread':
    'The difference between the bid and ask prices.',
  'Bull Market':
    'A market condition where prices are rising or expected to rise.',
  'Bear Market':
    'A market condition where prices are falling or expected to fall.',
  'Volatility':
    'A measure of how much a security\'s price fluctuates over time.',
  'Dividend':
    'A portion of a company\'s earnings distributed to shareholders.',
};

interface GlossaryTermProps {
  term: string;
  children?: ReactNode;
}

export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const definition = TRADING_GLOSSARY[term];

  if (!definition) {
    return <span>{children || term}</span>;
  }

  return (
    <Tooltip content={definition}>
      <span className="border-b border-dotted border-gray-500 cursor-help">
        {children || term}
      </span>
    </Tooltip>
  );
}
