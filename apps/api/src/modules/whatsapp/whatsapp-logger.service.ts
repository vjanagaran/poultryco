import { Injectable, Logger } from '@nestjs/common';

/**
 * WhatsApp Logger Service
 * Maintains an in-memory buffer of WhatsApp-related logs
 */
@Injectable()
export class WhatsAppLoggerService {
  private readonly logger = new Logger(WhatsAppLoggerService.name);
  private logBuffer: Array<{ timestamp: string; level: string; message: string; accountId?: string }> = [];
  private readonly maxLogs = 1000; // Keep last 1000 log entries

  /**
   * Add a log entry to the buffer
   */
  log(message: string, accountId?: string) {
    this.addLog('log', message, accountId);
    this.logger.log(message);
  }

  warn(message: string, accountId?: string) {
    this.addLog('warn', message, accountId);
    this.logger.warn(message);
  }

  error(message: string, error?: any, accountId?: string) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.addLog('error', `${message}: ${errorMessage}`, accountId);
    this.logger.error(message, error);
  }

  debug(message: string, accountId?: string) {
    this.addLog('debug', message, accountId);
    this.logger.debug(message);
  }

  private addLog(level: string, message: string, accountId?: string) {
    this.logBuffer.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      accountId,
    });

    // Keep only last maxLogs entries
    if (this.logBuffer.length > this.maxLogs) {
      this.logBuffer = this.logBuffer.slice(-this.maxLogs);
    }
  }

  /**
   * Get logs filtered by criteria
   */
  getLogs(filters?: {
    accountId?: string;
    level?: string;
    search?: string;
    limit?: number;
  }): Array<{ timestamp: string; level: string; message: string; accountId?: string }> {
    let logs = [...this.logBuffer];

    // Filter by account ID
    if (filters?.accountId) {
      logs = logs.filter(log => log.accountId === filters.accountId);
    }

    // Filter by level
    if (filters?.level) {
      logs = logs.filter(log => log.level === filters.level);
    }

    // Filter by search term
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        (log.accountId && log.accountId.toLowerCase().includes(searchLower))
      );
    }

    // Limit results
    const limit = filters?.limit || 100;
    return logs.slice(-limit);
  }

  /**
   * Clear log buffer
   */
  clear() {
    this.logBuffer = [];
  }

  /**
   * Get log statistics
   */
  getStats() {
    const total = this.logBuffer.length;
    const byLevel = this.logBuffer.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byLevel,
      oldest: this.logBuffer[0]?.timestamp,
      newest: this.logBuffer[this.logBuffer.length - 1]?.timestamp,
    };
  }
}

