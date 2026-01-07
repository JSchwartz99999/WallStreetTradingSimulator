const newsItems = [
  {
    title: 'Tech Stocks Rally on AI Optimism',
    description: 'Major technology companies see gains as investors remain bullish on artificial intelligence developments.',
    time: '2 hours ago',
    positive: true,
  },
  {
    title: 'Fed Signals Potential Rate Changes',
    description: 'Federal Reserve officials hint at possible adjustments to monetary policy in upcoming meetings.',
    time: '4 hours ago',
    positive: false,
  },
  {
    title: 'Energy Sector Shows Strong Performance',
    description: 'Oil prices stabilize as global demand outlook improves, boosting energy stocks.',
    time: '6 hours ago',
    positive: true,
  },
  {
    title: 'Semiconductor Demand Continues Growth',
    description: 'Chip manufacturers report strong orders as data center and AI infrastructure investments accelerate.',
    time: '8 hours ago',
    positive: true,
  },
];

export function MarketNews() {
  return (
    <div className="space-y-3">
      {newsItems.map((item, i) => (
        <article key={i} className="p-3 bg-gray-700 rounded-lg">
          <h3 className={`font-semibold ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {item.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
          <time className="text-xs text-gray-500 mt-2 block">{item.time}</time>
        </article>
      ))}
    </div>
  );
}
