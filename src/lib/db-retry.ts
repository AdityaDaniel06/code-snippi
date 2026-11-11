import "server-only";

/**
 * Neon's connection pooler drops idle connections; Prisma then throws a
 * transient error (e.g. "Connection closed") on the next query instead of
 * transparently reconnecting. Retrying re-establishes the connection.
 */
function isTransientConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /connection closed|connection reset|econnreset|terminating connection|can't reach database|connection pool timed out|closed the connection|server has closed the connection/i.test(
    message
  );
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  retries = 2
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientConnectionError(error) || attempt === retries) throw error;
      // brief backoff before reconnecting
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }
  throw lastError;
}
