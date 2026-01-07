import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMultiPortfolioStore } from '@/store/multiPortfolioStore';
import { formatCurrency } from '@/utils/formatters';
import { clsx } from 'clsx';

interface PortfolioSelectorProps {
  className?: string;
}

export function PortfolioSelector({ className }: PortfolioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const portfolios = useMultiPortfolioStore((state) => state.portfolios);
  const activePortfolioId = useMultiPortfolioStore((state) => state.activePortfolioId);
  const setActivePortfolio = useMultiPortfolioStore((state) => state.setActivePortfolio);
  const createPortfolio = useMultiPortfolioStore((state) => state.createPortfolio);
  const deletePortfolio = useMultiPortfolioStore((state) => state.deletePortfolio);

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  const handleCreate = () => {
    if (newName.trim()) {
      createPortfolio(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  if (portfolios.length === 0) {
    return (
      <div className={clsx('p-3 bg-gray-700/50 rounded-lg', className)}>
        <p className="text-sm text-gray-400 mb-2">
          Create multiple portfolios to test different strategies!
        </p>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Portfolio name"
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={!newName.trim()}>
            Create
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('relative', className)}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <span>📁</span>
          <span className="truncate">{activePortfolio?.name || 'Select Portfolio'}</span>
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className={clsx(
                  'flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 transition-colors',
                  portfolio.id === activePortfolioId && 'bg-emerald-900/30'
                )}
                onClick={() => {
                  setActivePortfolio(portfolio.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{portfolio.name}</div>
                  <div className="text-xs text-gray-400">
                    {formatCurrency(portfolio.cashBalance)} cash
                  </div>
                </div>
                {portfolios.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${portfolio.name}"?`)) {
                        deletePortfolio(portfolio.id);
                      }
                    }}
                    aria-label={`Delete ${portfolio.name}`}
                  >
                    🗑️
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 p-2">
            {isCreating ? (
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Portfolio name"
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') setIsCreating(false);
                  }}
                />
                <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsCreating(true)}
              >
                + New Portfolio
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
