import { Analytics } from '../analytics';
import { Plugin, TrackEvent, IdentifyEvent, PageEvent } from '../../types';

describe('Analytics', () => {
  let analytics: Analytics;
  const defaultConfig = {
    writeKey: 'test-write-key',
    debug: false,
    trackPageViews: false // Disable auto page tracking in tests
  };

  // Mock fetch
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    analytics = new Analytics(defaultConfig);
  });

  afterEach(() => {
    analytics.destroy();
  });

  describe('constructor', () => {
    it('should create analytics instance with config', () => {
      expect(analytics).toBeInstanceOf(Analytics);
    });

    it('should generate anonymous ID', () => {
      const user = analytics.user();
      expect(user.anonymousId).toBeDefined();
      expect(user.anonymousId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should not have userId initially', () => {
      const user = analytics.user();
      expect(user.userId).toBeUndefined();
    });

    it('should have empty traits initially', () => {
      const user = analytics.user();
      expect(user.traits).toEqual({});
    });
  });

  describe('identify()', () => {
    it('should set user ID', async () => {
      await analytics.identify('user-123');
      
      const user = analytics.user();
      expect(user.userId).toBe('user-123');
    });

    it('should set user traits', async () => {
      await analytics.identify('user-123', { email: 'test@test.com', name: 'John' });
      
      const user = analytics.user();
      expect(user.traits).toEqual({ email: 'test@test.com', name: 'John' });
    });

    it('should merge traits on subsequent identify calls', async () => {
      await analytics.identify('user-123', { email: 'test@test.com' });
      await analytics.identify('user-123', { name: 'John' });
      
      const user = analytics.user();
      expect(user.traits).toEqual({ email: 'test@test.com', name: 'John' });
    });

    it('should allow identify without userId to update traits', async () => {
      await analytics.identify('user-123');
      await analytics.identify(undefined, { email: 'new@test.com' });
      
      const user = analytics.user();
      expect(user.userId).toBe('user-123');
      expect(user.traits.email).toBe('new@test.com');
    });
  });

  describe('track()', () => {
    it('should queue track events', async () => {
      await analytics.track('Button Clicked');
      
      // Event should be queued
      await analytics.flush();
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should include event name in track call', async () => {
      await analytics.track('Button Clicked', { buttonId: 'submit' });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].type).toBe('track');
      expect(body.batch[0].event).toBe('Button Clicked');
      expect(body.batch[0].properties).toEqual({ buttonId: 'submit' });
    });

    it('should include anonymousId in events', async () => {
      await analytics.track('Test Event');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].anonymousId).toBeDefined();
    });

    it('should include userId in events after identify', async () => {
      await analytics.identify('user-123');
      await analytics.track('Test Event');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      // Find the track event
      const trackEvent = body.batch.find((e: any) => e.type === 'track');
      expect(trackEvent.userId).toBe('user-123');
    });

    it('should include timestamp and messageId', async () => {
      await analytics.track('Test Event');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].timestamp).toBeDefined();
      expect(body.batch[0].messageId).toBeDefined();
    });
  });

  describe('page()', () => {
    it('should queue page events', async () => {
      await analytics.page();
      await analytics.flush();
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should include page name and category', async () => {
      await analytics.page('Home', 'Main');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].type).toBe('page');
      expect(body.batch[0].name).toBe('Home');
      expect(body.batch[0].category).toBe('Main');
    });

    it('should include page properties', async () => {
      await analytics.page('Home', undefined, { section: 'hero' });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].properties).toEqual({ section: 'hero' });
    });
  });

  describe('screen()', () => {
    it('should queue screen events', async () => {
      await analytics.screen('Dashboard');
      await analytics.flush();
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should include screen name and category', async () => {
      await analytics.screen('Profile', 'User');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].type).toBe('screen');
      expect(body.batch[0].name).toBe('Profile');
      expect(body.batch[0].category).toBe('User');
    });
  });

  describe('alias()', () => {
    it('should queue alias events', async () => {
      await analytics.alias('new-user-id');
      await analytics.flush();
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should update userId after alias', async () => {
      await analytics.alias('new-user-id');
      
      const user = analytics.user();
      expect(user.userId).toBe('new-user-id');
    });

    it('should include previousId', async () => {
      const originalAnonymousId = analytics.user().anonymousId;
      await analytics.alias('new-user-id');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      // Find the alias event in the batch
      const aliasEvent = body.batch.find((e: any) => e.type === 'alias');
      expect(aliasEvent).toBeDefined();
      expect(aliasEvent.userId).toBe('new-user-id');
      expect(aliasEvent.previousId).toBe(originalAnonymousId);
    });
  });

  describe('group()', () => {
    it('should queue group events', async () => {
      await analytics.group('company-123');
      await analytics.flush();
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should include group traits', async () => {
      await analytics.group('company-123', { name: 'Acme Inc', plan: 'enterprise' });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].type).toBe('group');
      expect(body.batch[0].groupId).toBe('company-123');
      expect(body.batch[0].traits).toEqual({ name: 'Acme Inc', plan: 'enterprise' });
    });
  });

  describe('reset()', () => {
    it('should clear userId', async () => {
      await analytics.identify('user-123');
      expect(analytics.user().userId).toBe('user-123');
      
      analytics.reset();
      expect(analytics.user().userId).toBeUndefined();
    });

    it('should clear traits', async () => {
      await analytics.identify('user-123', { email: 'test@test.com' });
      expect(analytics.user().traits).toEqual({ email: 'test@test.com' });
      
      analytics.reset();
      expect(analytics.user().traits).toEqual({});
    });

    it('should generate new anonymousId', async () => {
      const originalAnonymousId = analytics.user().anonymousId;
      
      analytics.reset();
      
      expect(analytics.user().anonymousId).toBeDefined();
      expect(analytics.user().anonymousId).not.toBe(originalAnonymousId);
    });
  });

  describe('user()', () => {
    it('should return user info object', () => {
      const user = analytics.user();
      
      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('anonymousId');
      expect(user).toHaveProperty('traits');
    });
  });

  describe('flush()', () => {
    it('should flush queue manually', async () => {
      await analytics.track('Event 1');
      await analytics.track('Event 2');
      
      await analytics.flush();
      
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('plugins', () => {
    it('should register and load plugins', async () => {
      const mockPlugin: Plugin = {
        name: 'test-plugin',
        type: 'before',
        isLoaded: () => true,
        load: jest.fn().mockResolvedValue(undefined)
      };

      analytics.register(mockPlugin);
      
      expect(mockPlugin.load).toHaveBeenCalled();
    });

    it('should process events through plugins', async () => {
      const mockPlugin: Plugin = {
        name: 'test-plugin',
        type: 'enrichment',
        isLoaded: () => true,
        load: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockImplementation((event: TrackEvent) => {
          return Promise.resolve({
            ...event,
            properties: { ...event.properties, enriched: true }
          });
        })
      };

      const analyticsWithPlugin = new Analytics({
        ...defaultConfig,
        plugins: [mockPlugin]
      });

      // Wait for plugins to load
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await analyticsWithPlugin.track('Test Event');
      await analyticsWithPlugin.flush();

      expect(mockPlugin.track).toHaveBeenCalled();
      
      analyticsWithPlugin.destroy();
    });
  });

  describe('context', () => {
    it('should include context in events', async () => {
      await analytics.track('Test Event');
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].context).toBeDefined();
      expect(body.batch[0].context.library).toBeDefined();
    });

    it('should allow custom context in options', async () => {
      await analytics.track('Test Event', {}, {
        context: { customField: 'customValue' }
      });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].context.customField).toBe('customValue');
    });
  });

  describe('options', () => {
    it('should accept custom timestamp', async () => {
      const customDate = new Date('2024-01-15T10:00:00Z');
      await analytics.track('Test Event', {}, { timestamp: customDate });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].timestamp).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should accept custom userId in options', async () => {
      await analytics.track('Test Event', {}, { userId: 'override-user' });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].userId).toBe('override-user');
    });

    it('should accept custom anonymousId in options', async () => {
      await analytics.track('Test Event', {}, { anonymousId: 'custom-anon-id' });
      await analytics.flush();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.batch[0].anonymousId).toBe('custom-anon-id');
    });
  });

  describe('debug()', () => {
    it('should log debug info', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      analytics.debug();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});

