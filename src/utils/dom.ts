/**
 * DOM utility functions for YouTube integration
 */

import { VideoData } from '@types';
import { logger } from './logger';

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    if (urlObj.pathname === '/watch') {
      return urlObj.searchParams.get('v');
    }

    // Short URL: youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    // Embed URL: youtube.com/embed/VIDEO_ID
    if (urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.split('/')[2];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract video data from a thumbnail element
 */
export function extractVideoData(element: HTMLElement): VideoData | null {
  try {
    // Find the video link
    const linkElement = element.querySelector('a#thumbnail, a.yt-simple-endpoint') as HTMLAnchorElement;
    if (!linkElement?.href) {
      return null;
    }

    const videoId = extractVideoId(linkElement.href);
    if (!videoId) {
      return null;
    }

    // Extract title
    const titleElement = element.querySelector('#video-title, .title') as HTMLElement;
    const title = titleElement?.textContent?.trim() || titleElement?.getAttribute('aria-label') || '';

    // Extract thumbnail URL
    const imgElement = element.querySelector('img') as HTMLImageElement;
    const thumbnailUrl = imgElement?.src || '';

    // Extract channel name
    const channelElement = element.querySelector('#channel-name, .ytd-channel-name') as HTMLElement;
    const channelName = channelElement?.textContent?.trim() || '';

    // Extract view count (optional)
    const viewElement = element.querySelector('#metadata-line span, .ytd-video-meta-block span') as HTMLElement;
    const viewCount = viewElement?.textContent?.trim();

    return {
      videoId,
      title,
      thumbnailUrl,
      channelName,
      viewCount,
    };
  } catch (error) {
    logger.error('Failed to extract video data', error);
    return null;
  }
}

/**
 * Get all video thumbnail containers on the page
 */
export function getVideoThumbnails(): HTMLElement[] {
  const selectors = [
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-playlist-video-renderer',
    'ytd-rich-item-renderer'
  ];

  const thumbnails: HTMLElement[] = [];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    thumbnails.push(...Array.from(elements) as HTMLElement[]);
  }

  return thumbnails;
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
