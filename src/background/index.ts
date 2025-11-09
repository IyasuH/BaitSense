/**
 * Background service worker for BaitSense extension
 * Handles message passing and API calls
 */

import {
  MessageType,
  AnalyzeVideoMessage,
  AnalysisResultMessage,
  VideoData
} from '@types';
import { logger } from '@utils/logger';
import { StorageManager } from '@utils/storage';
import { ClickbaitAnalyzer } from '@services/analyzer';

logger.info('Background service worker initialized');

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.debug('Received message', message.type);
  logger.debug(sender.toString());
  switch (message.type) {
    case MessageType.ANALYZE_VIDEO:
      handleAnalyzeVideo(message as AnalyzeVideoMessage, sendResponse);
      return true; // Keep channel open for async response

    case MessageType.GET_SETTINGS:
      handleGetSettings(sendResponse);
      return true;

    case MessageType.UPDATE_SETTINGS:
      handleUpdateSettings(message.data, sendResponse);
      return true;

    case MessageType.CLEAR_CACHE:
      handleClearCache(sendResponse);
      return true;

    default:
      logger.warn('Unknown message type', message.type);
      sendResponse({ error: 'Unknown message type' });
      return false;
  }
});

/**
 * Handle video analysis request
 */
async function handleAnalyzeVideo(
  message: AnalyzeVideoMessage,
  sendResponse: (response: AnalysisResultMessage) => void
): Promise<void> {
  try {
    const video = message.data as VideoData;
    const analysis = await ClickbaitAnalyzer.analyzeVideo(video);

    sendResponse({
      type: MessageType.ANALYSIS_RESULT,
      data: {
        videoId: video.videoId,
        analysis
      }
    });
  } catch (error) {
    logger.error('Failed to analyze video', error);
    sendResponse({
      type: MessageType.ANALYSIS_RESULT,
      data: {
        videoId: (message.data as VideoData).videoId,
        analysis: null,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }
    });
  }
}

/**
 * Handle get settings request
 */
async function handleGetSettings(sendResponse: (response: unknown) => void): Promise<void> {
  try {
    const settings = await StorageManager.getSettings();
    sendResponse({ success: true, data: settings });
  } catch (error) {
    logger.error('Failed to get settings', error);
    sendResponse({ success: false, error: 'Failed to get settings' });
  }
}

/**
 * Handle update settings request
 */
async function handleUpdateSettings(
  data: unknown,
  sendResponse: (response: unknown) => void
): Promise<void> {
  try {
    await StorageManager.updateSettings(data as Record<string, unknown>);
    sendResponse({ success: true });
  } catch (error) {
    logger.error('Failed to update settings', error);
    sendResponse({ success: false, error: 'Failed to update settings' });
  }
}

/**
 * Handle clear cache request
 */
async function handleClearCache(sendResponse: (response: unknown) => void): Promise<void> {
  try {
    await StorageManager.clearCache();
    sendResponse({ success: true });
  } catch (error) {
    logger.error('Failed to clear cache', error);
    sendResponse({ success: false, error: 'Failed to clear cache' });
  }
}

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  logger.info('Extension installed', details.reason);

  if (details.reason === 'install') {
    // Initialize default settings
    StorageManager.getSettings().then(() => {
      logger.info('Default settings initialized');
    });
  }
});
