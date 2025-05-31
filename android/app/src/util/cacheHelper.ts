// Default cache expiration time (5 minutes)
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface CacheConfig {
  expirationTime?: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>> = new Map();
  private expirationTime: number;

  private constructor(config?: CacheConfig) {
    this.expirationTime = config?.expirationTime || DEFAULT_CACHE_EXPIRATION;
  }

  public static getInstance(config?: CacheConfig): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * Set cache expiration time in milliseconds
   */
  public setExpirationTime(expirationTime: number): void {
    this.expirationTime = expirationTime;
  }

  /**
   * Check if cache for a key is valid
   */
  public isCacheValid(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    return Date.now() - item.timestamp < this.expirationTime;
  }

  /**
   * Get data from cache
   */
  public get<T>(key: string): T | null {
    if (!this.isCacheValid(key)) {
      return null;
    }
    
    const item = this.cache.get(key);
    return item ? item.data : null;
  }

  /**
   * Set data in cache
   */
  public set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate a specific cache item
   */
  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache items
   */
  public invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Gets cached data if valid, otherwise fetches fresh data and updates cache
   * @param key Cache key
   * @param fetchFn Function to fetch fresh data
   * @returns Promise with the data
   */
  public async getOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cachedData = this.get<T>(key);
    
    if (cachedData !== null) {
      console.log(`Using cached data for: ${key}`);
      return cachedData;
    }
    
    console.log(`Fetching fresh data for: ${key}`);
    const freshData = await fetchFn();
    this.set(key, freshData);
    return freshData;
  }
}

// Convenience export for the singleton instance
export const cacheManager = CacheManager.getInstance(); 