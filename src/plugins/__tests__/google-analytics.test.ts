/**
 * @jest-environment jsdom
 */
import { GoogleAnalyticsPlugin } from '../google-analytics';
import { TrackEvent, IdentifyEvent, PageEvent } from '../../types';

describe('GoogleAnalyticsPlugin', () => {
  let plugin: GoogleAnalyticsPlugin;
  const measurementId = 'G-XXXXXXXXXX';

  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    delete (window as any).gtag;
    delete (window as any).dataLayer;
    
    plugin = new GoogleAnalyticsPlugin({ measurementId });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createBaseEvent = () => ({
    anonymousId: 'anon-123',
    timestamp: new Date().toISOString(),
    messageId: 'msg-123',
    context: {
      page: {
        path: '/home',
        title: 'Home Page',
        url: 'https://example.com/home'
      }
    }
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('google-analytics');
    });

    it('should have type "destination"', () => {
      expect(plugin.type).toBe('destination');
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
    it('should add gtag script to document head', async () => {
      await plugin.load();
      
      const scripts = document.head.querySelectorAll('script');
      const gtagScript = Array.from(scripts).find(
        s => s.src.includes('googletagmanager.com/gtag/js')
      );
      
      expect(gtagScript).toBeDefined();
      expect(gtagScript?.src).toContain(measurementId);
    });

    it('should initialize dataLayer', async () => {
      await plugin.load();
      
      expect(window.dataLayer).toBeDefined();
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });

    it('should initialize gtag function', async () => {
      await plugin.load();
      
      expect(typeof window.gtag).toBe('function');
    });

    it('should call gtag with config', async () => {
      await plugin.load();
      
      // gtag pushes to dataLayer
      expect(window.dataLayer?.length).toBeGreaterThan(0);
    });
  });

  describe('identify()', () => {
    beforeEach(async () => {
      await plugin.load();
    });

    it('should set user properties via gtag', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: IdentifyEvent = {
        type: 'identify',
        userId: 'user-123',
        traits: { email: 'test@test.com', plan: 'pro' },
        ...createBaseEvent()
      };

      const result = await plugin.identify(event);

      expect(gtagSpy).toHaveBeenCalledWith('set', 'user_properties', {
        user_id: 'user-123',
        email: 'test@test.com',
        plan: 'pro'
      });
      expect(result).toEqual(event);
    });

    it('should not call gtag if no userId', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: IdentifyEvent = {
        type: 'identify',
        traits: { email: 'test@test.com' },
        ...createBaseEvent()
      };

      await plugin.identify(event);

      expect(gtagSpy).not.toHaveBeenCalled();
    });
  });

  describe('track()', () => {
    beforeEach(async () => {
      await plugin.load();
    });

    it('should send event to GA4', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: TrackEvent = {
        type: 'track',
        event: 'button_click',
        properties: { button_id: 'submit', category: 'form' },
        userId: 'user-123',
        ...createBaseEvent()
      };

      const result = await plugin.track(event);

      expect(gtagSpy).toHaveBeenCalledWith('event', 'button_click', {
        button_id: 'submit',
        category: 'form',
        user_id: 'user-123'
      });
      expect(result).toEqual(event);
    });

    it('should handle events without properties', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: TrackEvent = {
        type: 'track',
        event: 'simple_event',
        properties: {},
        ...createBaseEvent()
      };

      await plugin.track(event);

      expect(gtagSpy).toHaveBeenCalledWith('event', 'simple_event', expect.any(Object));
    });
  });

  describe('page()', () => {
    beforeEach(async () => {
      await plugin.load();
    });

    it('should send page_view event to GA4', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: PageEvent = {
        type: 'page',
        name: 'Home',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.page(event);

      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Home',
        page_location: 'https://example.com/home',
        page_path: '/home'
      });
      expect(result).toEqual(event);
    });

    it('should fallback to context page title if name not provided', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: PageEvent = {
        type: 'page',
        properties: {},
        ...createBaseEvent()
      };

      await plugin.page(event);

      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        page_title: 'Home Page'
      }));
    });

    it('should include additional properties', async () => {
      const gtagSpy = jest.fn();
      window.gtag = gtagSpy;

      const event: PageEvent = {
        type: 'page',
        name: 'Product',
        properties: { product_id: '123', category: 'Electronics' },
        ...createBaseEvent()
      };

      await plugin.page(event);

      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        product_id: '123',
        category: 'Electronics'
      }));
    });
  });

  describe('without gtag loaded', () => {
    it('should handle track gracefully when gtag not available', async () => {
      window.gtag = undefined;

      const event: TrackEvent = {
        type: 'track',
        event: 'test',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.track(event);
      expect(result).toEqual(event);
    });

    it('should handle page gracefully when gtag not available', async () => {
      window.gtag = undefined;

      const event: PageEvent = {
        type: 'page',
        properties: {},
        ...createBaseEvent()
      };

      const result = await plugin.page(event);
      expect(result).toEqual(event);
    });
  });
});

