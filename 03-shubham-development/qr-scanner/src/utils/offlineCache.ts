import * as SecureStore from 'expo-secure-store';

export interface CachedEvent {
  _id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  hall: { hallName: string };
  gate: string;
  status: string;
  assignedAt: string;
  cachedAt: number;
}

const CACHE_KEYS = {
  EVENTS: 'qr_scanner_cached_events',
  CACHE_TIMESTAMP: 'qr_scanner_cache_timestamp',
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const OfflineCache = {
  /**
   * Get cached events
   */
  async getCachedEvents(): Promise<CachedEvent[] | null> {
    try {
      const cached = await SecureStore.getItemAsync(CACHE_KEYS.EVENTS);
      const timestamp = await SecureStore.getItemAsync(CACHE_KEYS.CACHE_TIMESTAMP);

      if (!cached || !timestamp) {
        return null;
      }

      // Check if cache is stale
      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > CACHE_DURATION) {
        console.log('📦 Cache expired, clearing...');
        await OfflineCache.clearCache();
        return null;
      }

      const events = JSON.parse(cached);
      console.log(
        `📦 Loaded ${events.length} events from cache (age: ${Math.round(cacheAge / 1000)}s)`
      );
      return events;
    } catch (e) {
      console.warn('Failed to get cached events:', e);
      return null;
    }
  },

  /**
   * Save events to cache
   */
  async cacheEvents(events: CachedEvent[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(CACHE_KEYS.EVENTS, JSON.stringify(events));
      await SecureStore.setItemAsync(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
      console.debug(`Cached ${events.length} events`);
    } catch (e) {
      console.warn('Failed to cache events:', e);
      // Gracefully handle cache failures - app will still work with network requests
    }
  },

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CACHE_KEYS.EVENTS);
      await SecureStore.deleteItemAsync(CACHE_KEYS.CACHE_TIMESTAMP);
      console.debug('Cache cleared');
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  },
};

export default OfflineCache;

