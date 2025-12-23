import {
  Analytics,
  Queue,
  Storage,
  uuid,
  messageId,
  getDefaultContext,
  getPlatform,
  isWeb,
  isReactNative,
  isNode,
  ConsoleLoggerPlugin,
  GoogleAnalyticsPlugin,
  DeviceEnrichmentPlugin
} from '../index';

describe('SDK Exports', () => {
  describe('core exports', () => {
    it('should export Analytics class', () => {
      expect(Analytics).toBeDefined();
      expect(typeof Analytics).toBe('function');
    });

    it('should export Queue class', () => {
      expect(Queue).toBeDefined();
      expect(typeof Queue).toBe('function');
    });

    it('should export Storage class', () => {
      expect(Storage).toBeDefined();
      expect(typeof Storage).toBe('function');
    });
  });

  describe('utility exports', () => {
    it('should export uuid function', () => {
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe('function');
      expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should export messageId function', () => {
      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('function');
      expect(messageId()).toMatch(/^analytics-\d+-/);
    });

    it('should export getDefaultContext function', () => {
      expect(getDefaultContext).toBeDefined();
      expect(typeof getDefaultContext).toBe('function');
    });

    it('should export platform detection functions', () => {
      expect(getPlatform).toBeDefined();
      expect(isWeb).toBeDefined();
      expect(isReactNative).toBeDefined();
      expect(isNode).toBeDefined();
      
      expect(typeof getPlatform).toBe('function');
      expect(typeof isWeb).toBe('function');
      expect(typeof isReactNative).toBe('function');
      expect(typeof isNode).toBe('function');
    });
  });

  describe('plugin exports', () => {
    it('should export ConsoleLoggerPlugin', () => {
      expect(ConsoleLoggerPlugin).toBeDefined();
      expect(typeof ConsoleLoggerPlugin).toBe('function');
      
      const plugin = new ConsoleLoggerPlugin();
      expect(plugin.name).toBe('console-logger');
      expect(plugin.type).toBe('after');
    });

    it('should export GoogleAnalyticsPlugin', () => {
      expect(GoogleAnalyticsPlugin).toBeDefined();
      expect(typeof GoogleAnalyticsPlugin).toBe('function');
      
      const plugin = new GoogleAnalyticsPlugin({ measurementId: 'G-TEST' });
      expect(plugin.name).toBe('google-analytics');
      expect(plugin.type).toBe('destination');
    });

    it('should export DeviceEnrichmentPlugin', () => {
      expect(DeviceEnrichmentPlugin).toBeDefined();
      expect(typeof DeviceEnrichmentPlugin).toBe('function');
      
      const plugin = new DeviceEnrichmentPlugin();
      expect(plugin.name).toBe('device-enrichment');
      expect(plugin.type).toBe('enrichment');
    });
  });

  describe('Analytics instantiation', () => {
    it('should create Analytics instance with config', () => {
      const analytics = new Analytics({
        writeKey: 'test-key',
        trackPageViews: false
      });

      expect(analytics).toBeInstanceOf(Analytics);
      expect(analytics.user()).toBeDefined();
      
      analytics.destroy();
    });
  });
});

