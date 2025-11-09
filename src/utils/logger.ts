/**
 * Centralized logging utility for the extension
 */

const LOG_PREFIX = '[BaitSense]';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`${LOG_PREFIX} [DEBUG]`, message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`${LOG_PREFIX} [INFO]`, message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${LOG_PREFIX} [WARN]`, message, ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    console.error(`${LOG_PREFIX} [ERROR]`, message, error, ...args);
  }
}

export const logger = new Logger();
