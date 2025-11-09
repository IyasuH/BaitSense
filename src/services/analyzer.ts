/**
 * AI-powered clickbait analysis service
 * This is a placeholder implementation - integrate with your preferred AI API
 */

import { VideoData, ClickbaitAnalysis } from '@types';
import { logger } from '@utils/logger';
import { StorageManager } from '@utils/storage';

export class ClickbaitAnalyzer {
  /**
   * Analyze a video for clickbait content
   * TODO: Replace with actual AI API integration (OpenAI, Claude, etc.)
   */
  static async analyzeVideo(video: VideoData): Promise<ClickbaitAnalysis> {
    logger.debug('Analyzing video', video.videoId);

    try {
      // Check cache first
      const cached = await StorageManager.getCachedAnalysis(video.videoId);
      if (cached) {
        logger.debug('Using cached analysis', video.videoId);
        return cached.analysis;
      }

      // Perform analysis
      const analysis = await this.performAnalysis(video);

      // Cache the result
      const settings = await StorageManager.getSettings();
      const expiresAt = Date.now() + (settings.cacheExpiry * 60 * 60 * 1000);
      await StorageManager.cacheAnalysis(video.videoId, {
        analysis,
        expiresAt
      });

      return analysis;
    } catch (error) {
      logger.error('Analysis failed', error);
      throw error;
    }
  }

  /**
   * Perform the actual clickbait analysis
   * This is a mock implementation - replace with real AI API calls
   */
  private static async performAnalysis(video: VideoData): Promise<ClickbaitAnalysis> {
    // TODO: Integrate with AI API (OpenAI, Claude, Gemini, etc.)
    // Example API call structure:
    // const response = await fetch(apiEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`
    //   },
    //   body: JSON.stringify({
    //     title: video.title,
    //     thumbnail: video.thumbnailUrl,
    //     channel: video.channelName
    //   })
    // });

    // Mock analysis based on common clickbait patterns
    const score = this.calculateMockScore(video.title);
    const reasons = this.identifyClickbaitPatterns(video.title);

    return {
      videoId: video.videoId,
      score,
      verdict: this.generateVerdict(score, reasons),
      reasons,
      confidence: 0.85,
      analyzedAt: Date.now()
    };
  }

  /**
   * Mock scoring based on clickbait patterns
   */
  private static calculateMockScore(title: string): number {
    let score = 0;
    const upperTitle = title.toUpperCase();

    // Excessive capitalization
    const capsRatio = (title.match(/[A-Z]/g) || []).length / title.length;
    if (capsRatio > 0.5) score += 30;

    // Clickbait keywords
    const clickbaitKeywords = [
      'YOU WON\'T BELIEVE',
      'SHOCKING',
      'INSANE',
      'CRAZY',
      'UNBELIEVABLE',
      'MIND BLOWING',
      'GONE WRONG',
      'MUST WATCH',
      'WILL SHOCK YOU'
    ];

    for (const keyword of clickbaitKeywords) {
      if (upperTitle.includes(keyword)) {
        score += 15;
      }
    }

    // Excessive punctuation
    const punctuationCount = (title.match(/[!?]{2,}/g) || []).length;
    score += punctuationCount * 10;

    // Vague language
    const vagueWords = ['THIS', 'WHAT', 'WHY', 'HOW', 'SECRET', 'TRICK'];
    const vagueCount = vagueWords.filter(word => upperTitle.includes(word)).length;
    score += vagueCount * 5;

    return Math.min(score, 100);
  }

  /**
   * Identify specific clickbait patterns
   */
  private static identifyClickbaitPatterns(title: string): string[] {
    const reasons: string[] = [];
    // const upperTitle = title.toUpperCase();

    const capsRatio = (title.match(/[A-Z]/g) || []).length / title.length;
    if (capsRatio > 0.5) {
      reasons.push('Excessive use of capital letters');
    }

    if (/[!?]{2,}/.test(title)) {
      reasons.push('Excessive punctuation for emphasis');
    }

    const clickbaitPhrases = [
      { pattern: /YOU WON'?T BELIEVE/i, reason: 'Uses "you won\'t believe" hook' },
      { pattern: /SHOCKING|INSANE|CRAZY/i, reason: 'Sensationalized language' },
      { pattern: /GONE WRONG|GONE SEXUAL/i, reason: 'Clickbait format pattern' },
      { pattern: /MUST WATCH|MUST SEE/i, reason: 'Urgency manipulation' },
      { pattern: /\bTHIS\b.*\bWILL\b/i, reason: 'Vague promise structure' }
    ];

    for (const { pattern, reason } of clickbaitPhrases) {
      if (pattern.test(title)) {
        reasons.push(reason);
      }
    }

    if (reasons.length === 0) {
      reasons.push('Title appears genuine');
    }

    return reasons;
  }

  /**
   * Generate a human-readable verdict
   */
  private static generateVerdict(score: number, reasons: string[]): string {
    const reasonString = reasons.join(', ');
    if (score >= 80) {
      return `Highly likely clickbait. Proceed with caution. (${reasonString})`;
    } else if (score >= 60) {
      return `Likely clickbait. Title may be misleading. (${reasonString})`;
    } else if (score >= 40) {
      return `Moderate clickbait indicators detected. (${reasonString})`;
    } else if (score >= 20) {
      return 'Minor clickbait elements present.';
    } else {
      return 'Appears to be genuine content.';
    }
  }
}
