/**
 * Storage utility for managing extension data
 */

import { ExtensionSettings, CacheEntry } from '@types';
import { logger } from './logger';

const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  threshold: 60,
  cacheExpiry: 24, // 24 hours
};

export class StorageManager {
  private static readonly SETTINGS_KEY = 'settings';
  private static readonly CACHE_PREFIX = 'cache_';

  /**
   * Get extension settings
   */
  static async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await chrome.storage.local.get(this.SETTINGS_KEY);
      return { ...DEFAULT_SETTINGS, ...result[this.SETTINGS_KEY] };
    } catch (error) {
      logger.error('Failed to get settings', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update extension settings
   */
  static async updateSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await chrome.storage.local.set({ [this.SETTINGS_KEY]: updated });
      logger.info('Settings updated', updated);
    } catch (error) {
      logger.error('Failed to update settings', error);
      throw error;
    }
  }

  /**
   * Get cached analysis for a video
   */
  static async getCachedAnalysis(videoId: string): Promise<CacheEntry | null> {
    try {
      const key = this.CACHE_PREFIX + videoId;
      const result = await chrome.storage.local.get(key);
      const entry = result[key] as CacheEntry | undefined;

      if (!entry) {
        return null;
      }

      // Check if cache has expired
      if (Date.now() > entry.expiresAt) {
        await this.removeCachedAnalysis(videoId);
        return null;
      }

      return entry;
    } catch (error) {
      logger.error('Failed to get cached analysis', error);
      return null;
    }
  }

  /**
   * Cache analysis result
   */
  static async cacheAnalysis(videoId: string, entry: CacheEntry): Promise<void> {
    try {
      const key = this.CACHE_PREFIX + videoId;
      await chrome.storage.local.set({ [key]: entry });
      logger.debug('Cached analysis for video', videoId);
    } catch (error) {
      logger.error('Failed to cache analysis', error);
    }
  }

  /**
   * Remove cached analysis for a video
   */
  static async removeCachedAnalysis(videoId: string): Promise<void> {
    try {
      const key = this.CACHE_PREFIX + videoId;
      await chrome.storage.local.remove(key);
    } catch (error) {
      logger.error('Failed to remove cached analysis', error);
    }
  }

  /**
   * Clear all cached analyses
   */
  static async clearCache(): Promise<void> {
    try {
      const allData = await chrome.storage.local.get(null);
      const cacheKeys = Object.keys(allData).filter(key =>
        key.startsWith(this.CACHE_PREFIX)
      );

      if (cacheKeys.length > 0) {
        await chrome.storage.local.remove(cacheKeys);
        logger.info('Cache cleared', { count: cacheKeys.length });
      }
    } catch (error) {
      logger.error('Failed to clear cache', error);
      throw error;
    }
  }
}
