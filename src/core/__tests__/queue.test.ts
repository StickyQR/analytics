import { Queue, QueueConfig } from '../queue';
import { TrackEvent, IdentifyEvent } from '../../types';

describe('Queue', () => {
  let queue: Queue;
  const defaultConfig: QueueConfig = {
    flushAt: 5,
    flushInterval: 10000,
    maxQueueSize: 10,
    retryAttempts: 3,
    apiHost: 'https://api.test.com',
    writeKey: 'test-write-key',
    debug: false
  };

  // Mock fetch
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetch.mockResolvedValue({ ok: true });
    queue = new Queue(defaultConfig);
  });

  afterEach(() => {
    queue.destroy();
    jest.useRealTimers();
  });

  const createTrackEvent = (name: string): TrackEvent => ({
    type: 'track',
    event: name,
    properties: {},
    anonymousId: 'anon-123',
    timestamp: new Date().toISOString(),
    messageId: `msg-${Date.now()}`
  });

  const createIdentifyEvent = (userId: string): IdentifyEvent => ({
    type: 'identify',
    userId,
    traits: { email: 'test@test.com' },
    anonymousId: 'anon-123',
    timestamp: new Date().toISOString(),
    messageId: `msg-${Date.now()}`
  });

  describe('push()', () => {
    it('should add events to the queue', () => {
      expect(queue.size()).toBe(0);
      queue.push(createTrackEvent('Test Event'));
      expect(queue.size()).toBe(1);
    });

    it('should trigger flush when flushAt threshold is reached', async () => {
      // Add events up to flushAt threshold
      for (let i = 0; i < 5; i++) {
        queue.push(createTrackEvent(`Event ${i}`));
      }

      // Allow flush to complete
      await Promise.resolve();
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should drop oldest events when maxQueueSize is exceeded', () => {
      // Stop auto-flush to test queue overflow
      queue.stopFlushInterval();
      
      // Add more events than maxQueueSize
      for (let i = 0; i < 15; i++) {
        queue.push(createTrackEvent(`Event ${i}`));
      }

      expect(queue.size()).toBeLessThanOrEqual(defaultConfig.maxQueueSize);
    });
  });

  describe('flush()', () => {
    it('should send batch to server', async () => {
      queue.push(createTrackEvent('Test Event'));
      await queue.flush();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/batch',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );
    });

    it('should clear queue after successful flush', async () => {
      queue.push(createTrackEvent('Test Event'));
      expect(queue.size()).toBe(1);
      
      await queue.flush();
      expect(queue.size()).toBe(0);
    });

    it('should not flush if queue is empty', async () => {
      await queue.flush();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should include Authorization header with writeKey', async () => {
      queue.push(createTrackEvent('Test Event'));
      await queue.flush();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /)
          })
        })
      );
    });

    it('should include sentAt timestamp in batch', async () => {
      queue.push(createTrackEvent('Test Event'));
      await queue.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body).toHaveProperty('sentAt');
      expect(body).toHaveProperty('batch');
    });
  });

  describe('retry logic', () => {
    it('should retry failed events up to retryAttempts', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      queue.push(createTrackEvent('Retry Event'));
      await queue.flush();

      // Event should be back in queue for retry
      expect(queue.size()).toBe(1);
    });

    it('should drop events after max retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      queue.push(createTrackEvent('Drop Event'));
      
      // Flush multiple times to exceed retry attempts
      for (let i = 0; i <= defaultConfig.retryAttempts; i++) {
        await queue.flush();
      }

      expect(queue.size()).toBe(0);
    });
  });

  describe('size()', () => {
    it('should return current queue size', () => {
      expect(queue.size()).toBe(0);
      
      queue.push(createTrackEvent('Event 1'));
      expect(queue.size()).toBe(1);
      
      queue.push(createTrackEvent('Event 2'));
      expect(queue.size()).toBe(2);
    });
  });

  describe('clear()', () => {
    it('should clear all events from queue', () => {
      queue.push(createTrackEvent('Event 1'));
      queue.push(createTrackEvent('Event 2'));
      expect(queue.size()).toBe(2);
      
      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });

  describe('flush interval', () => {
    it('should auto-flush at configured interval', () => {
      queue.push(createTrackEvent('Interval Event'));
      
      // Fast-forward time
      jest.advanceTimersByTime(defaultConfig.flushInterval);
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should stop flush interval when stopFlushInterval is called', () => {
      queue.stopFlushInterval();
      queue.push(createTrackEvent('No Flush Event'));
      
      jest.advanceTimersByTime(defaultConfig.flushInterval * 2);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('destroy()', () => {
    it('should flush remaining events and clear queue', async () => {
      queue.push(createTrackEvent('Final Event'));
      
      queue.destroy();
      
      // Allow flush to complete
      await Promise.resolve();
      
      expect(queue.size()).toBe(0);
    });
  });

  describe('debug mode', () => {
    it('should log events when debug is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const debugQueue = new Queue({ ...defaultConfig, debug: true });
      debugQueue.push(createTrackEvent('Debug Event'));
      
      expect(consoleSpy).toHaveBeenCalled();
      
      debugQueue.destroy();
      consoleSpy.mockRestore();
    });
  });
});

