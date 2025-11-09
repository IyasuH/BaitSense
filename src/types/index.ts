/**
 * Core type definitions for BaitSense extension
 */

export interface VideoData {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  viewCount?: string;
  uploadDate?: string;
}

export interface ClickbaitAnalysis {
  videoId: string;
  score: number; // 0-100, higher = more clickbait
  verdict: string;
  reasons: string[];
  confidence: number; // 0-1
  analyzedAt: number; // timestamp
}

export interface CacheEntry {
  analysis: ClickbaitAnalysis;
  expiresAt: number;
}

export interface ExtensionSettings {
  enabled: boolean;
  threshold: number; // Minimum score to show warning
  cacheExpiry: number; // Hours
  apiEndpoint?: string;
  apiKey?: string;
}

export interface MessagePayload {
  type: MessageType;
  data?: unknown;
}

export enum MessageType {
  ANALYZE_VIDEO = 'ANALYZE_VIDEO',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT',
  GET_SETTINGS = 'GET_SETTINGS',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  CLEAR_CACHE = 'CLEAR_CACHE'
}

export interface AnalyzeVideoMessage extends MessagePayload {
  type: MessageType.ANALYZE_VIDEO;
  data: VideoData;
}

export interface AnalysisResultMessage extends MessagePayload {
  type: MessageType.ANALYSIS_RESULT;
  data: {
    videoId: string;
    analysis: ClickbaitAnalysis | null;
    error?: string;
  };
}
