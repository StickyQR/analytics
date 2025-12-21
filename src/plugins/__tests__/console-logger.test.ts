import { ConsoleLoggerPlugin } from '../console-logger';
import { TrackEvent, IdentifyEvent, PageEvent, ScreenEvent, AliasEvent, GroupEvent } from '../../types';

describe('ConsoleLoggerPlugin', () => {
  let plugin: ConsoleLoggerPlugin;
  let consoleSpy: {
    group: jest.SpyInstance;
    log: jest.SpyInstance;
    groupEnd: jest.SpyInstance;
  };

  beforeEach(() => {
    plugin = new ConsoleLoggerPlugin();
    consoleSpy = {
      group: jest.spyOn(console, 'group').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
      groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation()
    };
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
      expect(plugin.name).toBe('console-logger');
    });

    it('should have type "after"', () => {
      expect(plugin.type).toBe('after');
    });

    it('should have version', () => {
      expect(plugin.version).toBe('1.0.0');
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

  describe('identify()', () => {
    it('should log identify events', async () => {
      const event: IdentifyEvent = {
        type: 'identify',
        userId: 'user-123',
        traits: { email: 'test@test.com' },
        ...createBaseEvent()
      };

      const result = await plugin.identify(event);

      expect(consoleSpy.group).toHaveBeenCalledWith('[Analytics Event] identify');
      expect(consoleSpy.log).toHaveBeenCalledWith('Event:', event);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
      expect(result).toEqual(event);
    });
  });

  describe('track()', () => {
    it('should log track events', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Button Clicked',
        properties: { buttonId: 'submit' },
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(consoleSpy.group).toHaveBeenCalledWith('[Analytics Event] track');
      expect(consoleSpy.log).toHaveBeenCalledWith('Event:', event);
      expect(result).toEqual(event);
    });
  });

  describe('page()', () => {
    it('should log page events', async () => {
      const event: PageEvent = {
        type: 'page',
        name: 'Home',
        category: 'Main',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.page(event);

      expect(consoleSpy.group).toHaveBeenCalledWith('[Analytics Event] page');
      expect(consoleSpy.log).toHaveBeenCalledWith('Event:', event);
      expect(result).toEqual(event);
    });
  });

  describe('screen()', () => {
    it('should log screen events', async () => {
      const event: ScreenEvent = {
        type: 'screen',
        name: 'Dashboard',
        category: 'App',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.screen(event);

      expect(consoleSpy.group).toHaveBeenCalledWith('[Analytics Event] screen');
      expect(consoleSpy.log).toHaveBeenCalledWith('Event:', event);
      expect(result).toEqual(event);
    });
  });

  describe('alias()', () => {
    it('should log alias events', async () => {
      const event: AliasEvent = {
        type: 'alias',
        userId: 'new-user-id',
        previousId: 'old-user-id',
        timestamp: new Date().toISOString(),
        messageId: 'msg-123',
        context: {}
      };

      const result = await plugin.alias(event);

      expect(consoleSpy.group).toHaveBeenCalledWith('[Analytics Event] alias');
      expect(consoleSpy.log).toHaveBeenCalledWith('Event:', event);
      expect(result).toEqual(event);
    });
  });

  describe('group()', () => {
    it('should log group events', async () => {
      const event: GroupEvent = {
        type: 'group',
        groupId: 'company-123',
        traits: { name: 'Acme Inc' },
        ...createBaseEvent()
      };

      const result = await plugin.group(event);

      expect(consoleSpy.group).toHaveBeenCalledWith('[Analytics Event] group');
      expect(consoleSpy.log).toHaveBeenCalledWith('Event:', event);
      expect(result).toEqual(event);
    });
  });

  describe('event passthrough', () => {
    it('should return the same event without modification', async () => {
      const event: TrackEvent = {
        type: 'track',
        event: 'Test',
        properties: { key: 'value' },
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(result).toBe(event);
      expect(result.properties).toEqual({ key: 'value' });
    });
  });
});

