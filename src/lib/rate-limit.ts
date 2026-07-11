export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(ip: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(ip) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (validTimestamps.length >= this.limit) {
      this.requests.set(ip, validTimestamps);
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);
    return true;
  }
}

// Global rate limiters (in-memory, per instance)
export const checkoutRateLimiter = new RateLimiter(5, 60 * 1000); // 5 requests per minute
export const webhookRateLimiter = new RateLimiter(20, 60 * 1000); // 20 requests per minute
