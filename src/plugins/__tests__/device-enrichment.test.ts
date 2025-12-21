/**
 * @jest-environment jsdom
 */
import { DeviceEnrichmentPlugin } from '../device-enrichment';
import { TrackEvent, IdentifyEvent, PageEvent, ScreenEvent, AliasEvent, GroupEvent } from '../../types';

describe('DeviceEnrichmentPlugin', () => {
  let plugin: DeviceEnrichmentPlugin;

  beforeEach(() => {
    plugin = new DeviceEnrichmentPlugin();
    
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        vendor: 'Google Inc.',
        hardwareConcurrency: 8,
        maxTouchPoints: 0
      },
      writable: true
    });

    // Mock screen
    Object.defineProperty(window, 'screen', {
      value: {
        width: 1920,
        height: 1080
      },
      writable: true
    });

    // Mock devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createBaseEvent = () => ({
    anonymousId: 'anon-123',
    timestamp: new Date().toISOString(),
    messageId: 'msg-123',
    context: {}
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('device-enrichment');
    });

    it('should have type "enrichment"', () => {
      expect(plugin.type).toBe('enrichment');
    });

    it('should have version', () => {
      expect(plugin.version).toBe('2.0.0');
    });
  });

  describe('isLoaded()', () => {
    it('should return false before load', () => {
      expect(plugin.isLoaded()).toBe(false);
    });

    it('should return true after load', async () => {
      await plugin.load();
      expect(plugin.isLoaded()).toBe(true);
    });
  });

  describe('load()', () => {
    it('should load successfully', async () => {
      await expect(plugin.load()).resolves.toBeUndefined();
    });
  });

  describe('device detection', () => {
    it('should detect desktop device type', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.device).toBeDefined();
      expect(result.context.device.type).toBe('desktop');
    });

    it('should detect mobile device', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.device.type).toBe('mobile');
    });

    it('should detect tablet device', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.device.type).toBe('tablet');
    });

    it('should detect manufacturer', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.device.manufacturer).toBe('Apple');
    });
  });

  describe('browser detection', () => {
    it('should detect Chrome browser', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.browser).toBeDefined();
      expect(result.context.browser.name).toBe('Chrome');
      expect(result.context.browser.version).toBeDefined();
      expect(result.context.browser.engine).toBe('Blink');
    });

    it('should detect Safari browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.browser.name).toBe('Safari');
      expect(result.context.browser.engine).toBe('WebKit');
    });

    it('should detect Firefox browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.browser.name).toBe('Firefox');
      expect(result.context.browser.engine).toBe('Gecko');
    });

    it('should detect Edge browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.browser.name).toBe('Edge');
    });
  });

  describe('OS detection', () => {
    it('should detect macOS', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.os).toBeDefined();
      expect(result.context.os.name).toBe('macOS');
    });

    it('should detect Windows', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.os.name).toBe('Windows');
    });

    it('should detect iOS', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.os.name).toBe('iOS');
    });

    it('should detect Android', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        writable: true
      });

      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.os.name).toBe('Android');
    });
  });

  describe('hardware info', () => {
    it('should include hardware information', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result.context.hardware).toBeDefined();
      expect(result.context.hardware.devicePixelRatio).toBe(2);
      expect(result.context.hardware.cores).toBe(8);
      expect(result.context.hardware.touchPoints).toBe(0);
    });
  });

  describe('all event types', () => {
    it('should enrich identify events', async () => {
      const event: IdentifyEvent = {
        type: 'identify',
        userId: 'user-123',
        traits: {},
        ...createBaseEvent()
      };

      const result = await plugin.identify(event);

      expect(result.context.device).toBeDefined();
      expect(result.context.browser).toBeDefined();
      expect(result.context.os).toBeDefined();
    });

    it('should enrich page events', async () => {
      const event: PageEvent = {
        type: 'page',
        name: 'Home',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.page(event);

      expect(result.context.device).toBeDefined();
      expect(result.context.browser).toBeDefined();
    });

    it('should enrich screen events', async () => {
      const event: ScreenEvent = {
        type: 'screen',
        name: 'Dashboard',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.screen(event);

      expect(result.context.device).toBeDefined();
    });

    it('should enrich alias events', async () => {
      const event: AliasEvent = {
        type: 'alias',
        userId: 'new-user',
        previousId: 'old-user',
        timestamp: new Date().toISOString(),
        messageId: 'msg-123',
        context: {}
      };

      const result = await plugin.alias(event);

      expect(result.context.device).toBeDefined();
    });

    it('should enrich group events', async () => {
      const event: GroupEvent = {
        type: 'group',
        groupId: 'company-123',
        traits: {},
        ...createBaseEvent()
      };

      const result = await plugin.group(event);

      expect(result.context.device).toBeDefined();
    });
  });

  describe('context preservation', () => {
    it('should preserve existing context properties', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: {},
        anonymousId: 'anon-123',
        timestamp: new Date().toISOString(),
        messageId: 'msg-123',
        context: {
          customField: 'customValue',
          page: { path: '/test' }
        }
      };

      const result = await plugin.track(event);

      expect(result.context.customField).toBe('customValue');
      expect(result.context.page).toEqual({ path: '/test' });
      expect(result.context.device).toBeDefined();
    });
  });
});

