const rateLimits = new Map<string, { count: number; startTime: number }>();

/**
 * Checks if a given identifier has exceeded their rate limit.
 * @param identifier The IP address, email, or other unique identifier
 * @param limit The maximum number of requests allowed in the time window
 * @param windowMs The time window in milliseconds
 * @returns true if the request should be allowed, false if it should be rate limited
 */
export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(identifier);

  if (!record) {
    rateLimits.set(identifier, { count: 1, startTime: now });
    return true;
  }

  // If the time window has passed, reset the count
  if (now - record.startTime > windowMs) {
    rateLimits.set(identifier, { count: 1, startTime: now });
    return true;
  }

  // If the limit has been reached within the window, block the request
  if (record.count >= limit) {
    return false;
  }

  // Otherwise, increment the count
  record.count += 1;
  return true;
}

// Clean up stale entries every 15 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimits.entries()) {
    // Arbitrarily choose 15 minutes as the max window for cleanup, though this could be more dynamic
    if (now - record.startTime > 15 * 60 * 1000) {
      rateLimits.delete(key);
    }
  }
}, 15 * 60 * 1000);
