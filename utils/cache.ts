export const isCacheFresh = (fetchedAt: number | null, ttlMs: number) =>
  typeof fetchedAt === 'number' && Date.now() - fetchedAt < ttlMs;
