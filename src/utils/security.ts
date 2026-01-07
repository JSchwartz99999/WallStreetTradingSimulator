/**
 * Rate limiter to prevent rapid API calls or actions
 */
class RateLimiterClass {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 60, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(action: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(action) ?? { count: 0, resetTime: now + this.windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    this.attempts.set(action, record);
    return true;
  }

  reset(action: string): void {
    this.attempts.delete(action);
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      const tryAcquire = () => {
        if (this.check('api')) {
          resolve();
        } else {
          setTimeout(tryAcquire, 100);
        }
      };
      tryAcquire();
    });
  }
}

// Singleton rate limiter for API calls
export const apiRateLimiter = new RateLimiterClass(60, 60000);

// Singleton rate limiter for trade actions
export const tradeRateLimiter = new RateLimiterClass(10, 60000);

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(str: unknown): string {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Deep freeze an object to prevent mutation
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach((prop) => {
    const value = (obj as Record<string, unknown>)[prop];
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value as object);
    }
  });
  return Object.freeze(obj);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
