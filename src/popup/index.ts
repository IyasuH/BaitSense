/**
 * Popup script for extension settings
 */

import { MessageType, ExtensionSettings } from '@types';
import { logger } from '@utils/logger';

// DOM elements
const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
const thresholdSlider = document.getElementById('thresholdSlider') as HTMLInputElement;
const thresholdValue = document.getElementById('thresholdValue') as HTMLSpanElement;
const cacheExpiryInput = document.getElementById('cacheExpiry') as HTMLInputElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const videosAnalyzed = document.getElementById('videosAnalyzed') as HTMLDivElement;
const clickbaitDetected = document.getElementById('clickbaitDetected') as HTMLDivElement;

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  try {
    await loadSettings();
    attachEventListeners();
    await loadStatistics();
    logger.info('Popup initialized');
  } catch (error) {
    logger.error('Failed to initialize popup', error);
  }
}

/**
 * Load current settings
 */
async function loadSettings(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.GET_SETTINGS
    });

    if (response.success) {
      const settings = response.data as ExtensionSettings;
      enableToggle.checked = settings.enabled;
      thresholdSlider.value = settings.threshold.toString();
      thresholdValue.textContent = `${settings.threshold}%`;
      cacheExpiryInput.value = settings.cacheExpiry.toString();
    }
  } catch (error) {
    logger.error('Failed to load settings', error);
    showNotification('Failed to load settings', 'error');
  }
}

/**
 * Save settings
 */
async function saveSettings(): Promise<void> {
  try {
    const settings: Partial<ExtensionSettings> = {
      enabled: enableToggle.checked,
      threshold: parseInt(thresholdSlider.value),
      cacheExpiry: parseInt(cacheExpiryInput.value)
    };

    const response = await chrome.runtime.sendMessage({
      type: MessageType.UPDATE_SETTINGS,
      data: settings
    });

    if (response.success) {
      showNotification('Settings saved successfully', 'success');
    } else {
      showNotification('Failed to save settings', 'error');
    }
  } catch (error) {
    logger.error('Failed to save settings', error);
    showNotification('Failed to save settings', 'error');
  }
}

/**
 * Clear cache
 */
async function clearCache(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.CLEAR_CACHE
    });

    if (response.success) {
      showNotification('Cache cleared successfully', 'success');
      await loadStatistics();
    } else {
      showNotification('Failed to clear cache', 'error');
    }
  } catch (error) {
    logger.error('Failed to clear cache', error);
    showNotification('Failed to clear cache', 'error');
  }
}

/**
 * Load statistics
 */
async function loadStatistics(): Promise<void> {
  try {
    const storage = await chrome.storage.local.get(null);
    const cacheKeys = Object.keys(storage).filter(key => key.startsWith('cache_'));
    
    videosAnalyzed.textContent = cacheKeys.length.toString();
    
    // Count clickbait videos (score >= 60)
    let clickbaitCount = 0;
    for (const key of cacheKeys) {
      const entry = storage[key];
      if (entry?.analysis?.score >= 60) {
        clickbaitCount++;
      }
    }
    
    clickbaitDetected.textContent = clickbaitCount.toString();
  } catch (error) {
    logger.error('Failed to load statistics', error);
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners(): void {
  // Threshold slider
  thresholdSlider.addEventListener('input', () => {
    thresholdValue.textContent = `${thresholdSlider.value}%`;
  });

  // Save button
  saveBtn.addEventListener('click', saveSettings);

  // Clear cache button
  clearCacheBtn.addEventListener('click', clearCache);

  // Auto-save on toggle change
  enableToggle.addEventListener('change', saveSettings);
}

/**
 * Show notification
 */
function showNotification(message: string, type: 'success' | 'error'): void {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('notification--visible');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('notification--visible');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize on load
init();
