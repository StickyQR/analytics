/**
 * Event queue with automatic flushing and retry logic
 */
import { AnalyticsEvent, QueueItem, CustomFetch } from '../types';
import { isNode } from '../utils/platform';

export interface QueueConfig {
  flushAt: number;
  flushInterval: number;
  maxQueueSize: number;
  retryAttempts: number;
  apiHost: string;
  writeKey: string;
  debug: boolean;
  /**
   * Custom fetch function for making HTTP requests.
   * Defaults to global fetch if not provided.
   */
  customFetch?: CustomFetch;
}

export class Queue {
  private queue: QueueItem[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private config: QueueConfig;
  private isFlushing = false;

  constructor(config: QueueConfig) {
    this.config = config;
    this.startFlushInterval();
  }

  /**
   * Add event to queue
   */
  push(event: AnalyticsEvent): void {
    const item: QueueItem = {
      event,
      attempts: 0,
      timestamp: Date.now()
    };

    this.queue.push(item);

    if (this.config.debug) {
      console.log('[Analytics] Event queued:', event.type, event);
    }

    // Auto-flush if queue size reached
    if (this.queue.length >= this.config.flushAt) {
      this.flush();
    }

    // Check max queue size
    if (this.queue.length > this.config.maxQueueSize) {
      this.queue.shift(); // Remove oldest event
      if (this.config.debug) {
        console.warn('[Analytics] Queue size exceeded, dropping oldest event');
      }
    }
  }

  /**
   * Flush queue to server
   */
  async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = [];

    try {
      await this.sendBatch(batch);

      if (this.config.debug) {
        console.log('[Analytics] Batch sent successfully:', batch.length, 'events');
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Analytics] Failed to send batch:', error);
      }

      // Retry logic
      for (const item of batch) {
        item.attempts++;

        if (item.attempts < this.config.retryAttempts) {
          this.queue.push(item);
        } else if (this.config.debug) {
          console.warn('[Analytics] Dropping event after max retries:', item.event);
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Send batch to server
   */
  private async sendBatch(batch: QueueItem[]): Promise<void> {
    const events = batch.map(item => item.event);
    const url = `${this.config.apiHost}/v1/batch`;

    // Base64 encode for Authorization header (Node.js compatible)
    const authString = isNode()
      ? Buffer.from(this.config.writeKey + ':').toString('base64')
      : btoa(this.config.writeKey + ':');

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        batch: events,
        sentAt: new Date().toISOString()
      })
    };

    // keepalive is browser-only, skip in Node.js
    if (!isNode()) {
      fetchOptions.keepalive = true;
    }

    // Use custom fetch if provided, otherwise use global fetch
    const fetchFn = this.config.customFetch || fetch;
    const response = await fetchFn(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Start automatic flush interval
   */
  private startFlushInterval(): void {
    // Use setInterval from global scope (works in both browser and Node.js)
    const intervalFn = typeof window !== 'undefined' 
      ? window.setInterval.bind(window)
      : setInterval;

    this.flushTimer = intervalFn(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop automatic flush interval
   */
  stopFlushInterval(): void {
    if (this.flushTimer !== null) {
      const clearFn = typeof window !== 'undefined'
        ? window.clearInterval.bind(window)
        : clearInterval;
      clearFn(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Get current queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Destroy queue
   */
  destroy(): void {
    this.stopFlushInterval();
    this.flush(); // Flush remaining events
    this.clear();
  }
}
