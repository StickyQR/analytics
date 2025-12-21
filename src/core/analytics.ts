/**
 * Main Analytics class - Core Analytics SDK
 */
import {
  AnalyticsConfig,
  AnalyticsEvent,
  IdentifyEvent,
  TrackEvent,
  PageEvent,
  ScreenEvent,
  AliasEvent,
  GroupEvent,
  UserTraits,
  EventProperties,
  EventOptions,
  Plugin,
  AnalyticsContext
} from '../types';
import { Queue, QueueConfig } from './queue';
import { Storage } from '../utils/storage';
import { uuid, messageId } from '../utils/uuid';
import { getDefaultContext } from '../utils/context';

const DEFAULT_CONFIG: Partial<AnalyticsConfig> = {
  apiHost: 'https://api.stickyqr.com/analytics',
  flushAt: 20,
  flushInterval: 10000, // 10 seconds
  maxQueueSize: 100,
  retryAttempts: 3,
  debug: false,
  trackPageViews: true,
  anonymousIdKey: 'analytics_anonymous_id',
  userIdKey: 'analytics_user_id',
  integrations: {}
};

export class Analytics {
  private config: AnalyticsConfig;
  private queue: Queue;
  private storage: Storage;
  private plugins: Map<string, Plugin> = new Map();
  private _userId?: string;
  private _anonymousId: string;
  private _traits: UserTraits = {};
  private isReady = false;

  constructor(config: AnalyticsConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as AnalyticsConfig;
    this.storage = new Storage();

    // Initialize or retrieve IDs
    this._anonymousId = this.getOrCreateAnonymousId();
    this._userId = this.storage.getSync(this.config.userIdKey!) || undefined;
    this._traits = this.storage.getSync('analytics_traits') || {};

    // Initialize queue
    const queueConfig: QueueConfig = {
      flushAt: this.config.flushAt!,
      flushInterval: this.config.flushInterval!,
      maxQueueSize: this.config.maxQueueSize!,
      retryAttempts: this.config.retryAttempts!,
      apiHost: this.config.apiHost!,
      writeKey: this.config.writeKey,
      debug: this.config.debug!
    };
    this.queue = new Queue(queueConfig);

    // Load plugins
    this.loadPlugins();

    // Auto-track page views
    if (this.config.trackPageViews && typeof window !== 'undefined') {
      this.trackInitialPageView();
    }
  }

  /**
   * Load and initialize plugins
   */
  private async loadPlugins(): Promise<void> {
    const plugins = this.config.plugins || [];

    // Sort plugins by type order
    const typeOrder = { before: 0, enrichment: 1, destination: 2, after: 3 };
    const sortedPlugins = plugins.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

    for (const plugin of sortedPlugins) {
      try {
        await plugin.load(this);
        this.plugins.set(plugin.name, plugin);

        if (this.config.debug) {
          console.log('[Analytics] Plugin loaded:', plugin.name);
        }
      } catch (error) {
        console.error(`[Analytics] Failed to load plugin ${plugin.name}:`, error);
      }
    }

    this.isReady = true;
  }

  /**
   * Get or create anonymous ID
   */
  private getOrCreateAnonymousId(): string {
    let id = this.storage.getSync<string>(this.config.anonymousIdKey!);

    if (!id) {
      id = uuid();
      this.storage.setSync(this.config.anonymousIdKey!, id);
    }

    return id;
  }

  /**
   * Track initial page view
   */
  private trackInitialPageView(): void {
    if (document.readyState === 'complete') {
      this.page();
    } else {
      window.addEventListener('load', () => this.page());
    }
  }

  /**
   * Process event through plugins
   */
  private async processEvent<T extends AnalyticsEvent>(event: T): Promise<T | null> {
    let processedEvent: T | null = event;

    for (const plugin of this.plugins.values()) {
      if (!processedEvent) break;

      const handler = plugin[event.type as keyof Plugin] as any;
      if (typeof handler === 'function') {
        try {
          processedEvent = await handler.call(plugin, processedEvent);
        } catch (error) {
          console.error(`[Analytics] Plugin ${plugin.name} error:`, error);
        }
      }
    }

    return processedEvent;
  }

  /**
   * Build base event properties
   */
  private buildBaseEvent(options: EventOptions = {}): Partial<AnalyticsEvent> {
    const context: AnalyticsContext = {
      ...getDefaultContext(),
      ...options.context
    };

    return {
      userId: options.userId || this._userId,
      anonymousId: options.anonymousId || this._anonymousId,
      context,
      timestamp: options.timestamp
        ? new Date(options.timestamp).toISOString()
        : new Date().toISOString(),
      messageId: messageId()
    };
  }

  /**
   * Identify user
   */
  async identify(userId?: string, traits?: UserTraits, options?: EventOptions): Promise<void> {
    // Allow identify() to just update traits for current user
    if (!userId && this._userId) {
      userId = this._userId;
    }

    if (userId) {
      this._userId = userId;
      this.storage.set(this.config.userIdKey!, userId);
    }

    if (traits) {
      this._traits = { ...this._traits, ...traits };
      this.storage.set('analytics_traits', this._traits);
    }

    const event: IdentifyEvent = {
      type: 'identify',
      ...this.buildBaseEvent(options),
      userId,
      traits: this._traits
    } as IdentifyEvent;

    const processedEvent = await this.processEvent(event);
    if (processedEvent) {
      this.queue.push(processedEvent);
    }
  }

  /**
   * Track event
   */
  async track(eventName: string, properties?: EventProperties, options?: EventOptions): Promise<void> {
    const event: TrackEvent = {
      type: 'track',
      event: eventName,
      properties: properties || {},
      ...this.buildBaseEvent(options)
    } as TrackEvent;

    const processedEvent = await this.processEvent(event);
    if (processedEvent) {
      this.queue.push(processedEvent);
    }
  }

  /**
   * Track page view
   */
  async page(name?: string, category?: string, properties?: EventProperties, options?: EventOptions): Promise<void> {
    // Support overloaded signature: page(category, name, properties, options)
    if (typeof category === 'object' && !properties) {
      options = category;
      category = undefined;
    }
    if (typeof name === 'object' && !category) {
      options = name;
      properties = undefined;
      name = undefined;
    }

    const event: PageEvent = {
      type: 'page',
      name,
      category,
      properties: properties || {},
      ...this.buildBaseEvent(options)
    } as PageEvent;

    const processedEvent = await this.processEvent(event);
    if (processedEvent) {
      this.queue.push(processedEvent);
    }
  }

  /**
   * Track screen view (for SPAs)
   */
  async screen(name?: string, category?: string, properties?: EventProperties, options?: EventOptions): Promise<void> {
    const event: ScreenEvent = {
      type: 'screen',
      name,
      category,
      properties: properties || {},
      ...this.buildBaseEvent(options)
    } as ScreenEvent;

    const processedEvent = await this.processEvent(event);
    if (processedEvent) {
      this.queue.push(processedEvent);
    }
  }

  /**
   * Alias user ID
   */
  async alias(userId: string, previousId?: string, options?: EventOptions): Promise<void> {
    const event: AliasEvent = {
      type: 'alias',
      userId,
      previousId: previousId || this._anonymousId,
      ...this.buildBaseEvent(options)
    } as AliasEvent;

    // Update current user ID
    this._userId = userId;
    this.storage.set(this.config.userIdKey!, userId);

    const processedEvent = await this.processEvent(event);
    if (processedEvent) {
      this.queue.push(processedEvent);
    }
  }

  /**
   * Group user
   */
  async group(groupId: string, traits?: UserTraits, options?: EventOptions): Promise<void> {
    const event: GroupEvent = {
      type: 'group',
      groupId,
      traits: traits || {},
      ...this.buildBaseEvent(options)
    } as GroupEvent;

    const processedEvent = await this.processEvent(event);
    if (processedEvent) {
      this.queue.push(processedEvent);
    }
  }

  /**
   * Register plugin
   */
  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
    plugin.load(this);
  }

  /**
   * Get user info
   */
  user(): { userId?: string; anonymousId: string; traits: UserTraits } {
    return {
      userId: this._userId,
      anonymousId: this._anonymousId,
      traits: this._traits
    };
  }

  /**
   * Reset user (logout)
   */
  reset(): void {
    this._userId = undefined;
    this._traits = {};
    this._anonymousId = uuid();

    this.storage.remove(this.config.userIdKey!);
    this.storage.remove('analytics_traits');
    this.storage.set(this.config.anonymousIdKey!, this._anonymousId);
  }

  /**
   * Flush queue manually
   */
  async flush(): Promise<void> {
    await this.queue.flush();
  }

  /**
   * Debug info
   */
  debug(): void {
    console.log('[Analytics] Debug Info:', {
      userId: this._userId,
      anonymousId: this._anonymousId,
      traits: this._traits,
      queueSize: this.queue.size(),
      plugins: Array.from(this.plugins.keys()),
      config: this.config
    });
  }

  /**
   * Destroy instance
   */
  destroy(): void {
    this.queue.destroy();
    this.plugins.clear();
  }
}
