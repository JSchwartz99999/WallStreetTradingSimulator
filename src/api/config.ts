// Finnhub API Configuration

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';

export const config = {
  apiKey: FINNHUB_API_KEY,
  baseUrl: 'https://finnhub.io/api/v1',
  wsUrl: 'wss://ws.finnhub.io',
  hasApiKey: Boolean(FINNHUB_API_KEY),
};

// Log configuration status (only in development)
if (import.meta.env.DEV) {
  if (config.hasApiKey) {
    console.log('Finnhub API key configured - using live data');
  } else {
    console.log('No Finnhub API key found - using simulated data');
    console.log('To enable live data, create a .env file with VITE_FINNHUB_API_KEY=your_key');
  }
}
