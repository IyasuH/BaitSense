/**
 * Content script for YouTube integration
 * Detects video thumbnails and shows clickbait analysis on hover
 */

import { MessageType, AnalysisResultMessage, VideoData } from '@types';
import { logger } from '@utils/logger';
import { extractVideoData, getVideoThumbnails, debounce } from '@utils/dom';
import { ClickbaitTooltip } from './tooltip';

// Global state
const processedVideos = new Set<string>();
const analysisCache = new Map<string, AnalysisResultMessage['data']>();
const tooltip = new ClickbaitTooltip();

logger.info('BaitSense content script loaded');

/**
 * Initialize the extension
 */
function init(): void {
  // Process initial thumbnails
  processVideoThumbnails();

  // Watch for new thumbnails (YouTube is a SPA)
  observePageChanges();

  logger.info('BaitSense initialized');
}

/**
 * Process all video thumbnails on the page
 */
function processVideoThumbnails(): void {
  const thumbnails = getVideoThumbnails();
  logger.debug(`Found ${thumbnails.length} video thumbnails`);

  thumbnails.forEach(thumbnail => {
    const videoData = extractVideoData(thumbnail);
    if (videoData && !processedVideos.has(videoData.videoId)) {
      attachHoverListeners(thumbnail, videoData);
      processedVideos.add(videoData.videoId);
    }
  });
}

/**
 * Attach hover event listeners to a thumbnail
 */
function attachHoverListeners(element: HTMLElement, videoData: VideoData): void {
  let hoverTimeout: NodeJS.Timeout | null = null;

  element.addEventListener('mouseenter', () => {
    // Delay analysis to avoid unnecessary API calls
    hoverTimeout = setTimeout(() => {
      handleThumbnailHover(element, videoData);
    }, 500);
  });

  element.addEventListener('mouseleave', () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    tooltip.scheduleHide();
  });
}

/**
 * Handle thumbnail hover event
 */
async function handleThumbnailHover(
  element: HTMLElement,
  videoData: VideoData
): Promise<void> {
  try {
    // Check cache first
    if (analysisCache.has(videoData.videoId)) {
      const cached = analysisCache.get(videoData.videoId)!;
      if (cached.analysis) {
        tooltip.show(cached.analysis, element);
      }
      return;
    }

    // Show loading state
    showLoadingTooltip(element);

    // Request analysis from background script
    const response = await chrome.runtime.sendMessage({
      type: MessageType.ANALYZE_VIDEO,
      data: videoData
    }) as AnalysisResultMessage;

    // Cache the result
    analysisCache.set(videoData.videoId, response.data);

    // Show analysis
    if (response.data.analysis) {
      tooltip.show(response.data.analysis, element);
    } else if (response.data.error) {
      logger.error('Analysis error', response.data.error);
      showErrorTooltip(element, response.data.error);
    }
  } catch (error) {
    logger.error('Failed to analyze video', error);
    showErrorTooltip(element, 'Failed to analyze video');
  }
}

/**
 * Show loading tooltip
 */
function showLoadingTooltip(element: HTMLElement): void {
  // Create a simple loading tooltip
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'baitsense-tooltip baitsense-tooltip--loading';
  loadingDiv.innerHTML = `
    <div class="baitsense-tooltip__header">
      <div class="baitsense-tooltip__title">
        <span class="baitsense-tooltip__icon">⏳</span>
        <span>Analyzing...</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(loadingDiv);
  
  const rect = element.getBoundingClientRect();
  loadingDiv.style.top = `${rect.top - loadingDiv.offsetHeight - 10 + window.scrollY}px`;
  loadingDiv.style.left = `${rect.right - loadingDiv.offsetWidth + window.scrollX}px`;
  
  setTimeout(() => {
    if (loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
  }, 3000);
}

/**
 * Show error tooltip
 */
function showErrorTooltip(element: HTMLElement, message: string): void {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'baitsense-tooltip baitsense-tooltip--error';
  errorDiv.innerHTML = `
    <div class="baitsense-tooltip__header">
      <div class="baitsense-tooltip__title">
        <span class="baitsense-tooltip__icon">⚠️</span>
        <span>Error</span>
      </div>
    </div>
    <div class="baitsense-tooltip__body">
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  
  const rect = element.getBoundingClientRect();
  errorDiv.style.top = `${rect.top - errorDiv.offsetHeight - 10 + window.scrollY}px`;
  errorDiv.style.left = `${rect.right - errorDiv.offsetWidth + window.scrollX}px`;
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

/**
 * Observe page changes (YouTube is a SPA)
 */
function observePageChanges(): void {
  // Debounced handler for DOM mutations
  const handleMutations = debounce(() => {
    processVideoThumbnails();
  }, 500);

  // Observe DOM changes
  const observer = new MutationObserver(handleMutations);
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also listen for YouTube navigation events
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      logger.debug('URL changed, reprocessing thumbnails');
      processedVideos.clear();
      analysisCache.clear();
      processVideoThumbnails();
    }
  }).observe(document.querySelector('title')!, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
