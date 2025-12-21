# Plugin Development Guide

Plugins extend the StickyQR Analytics SDK with custom functionality for enrichment, destinations, and more.

## Plugin Architecture

Plugins are processed in this order:

1. **Before**: Pre-processing before event creation
2. **Enrichment**: Add/modify event data (device info, geolocation, etc.)
3. **Destination**: Send events to external services (GA, Mixpanel, etc.)
4. **After**: Post-processing (logging, validation, etc.)

## Plugin Interface

```typescript
interface Plugin {
  name: string;
  type: 'before' | 'enrichment' | 'destination' | 'after';
  version?: string;

  isLoaded(): boolean;
  load(analytics: Analytics): Promise<void>;

  // Optional event handlers
  identify?(event: IdentifyEvent): Promise<IdentifyEvent | null>;
  track?(event: TrackEvent): Promise<TrackEvent | null>;
  page?(event: PageEvent): Promise<PageEvent | null>;
  screen?(event: ScreenEvent): Promise<ScreenEvent | null>;
  alias?(event: AliasEvent): Promise<AliasEvent | null>;
  group?(event: GroupEvent): Promise<GroupEvent | null>;
}
```

## Example: Custom Enrichment Plugin

### Geolocation Plugin

```typescript
import { Plugin, AnalyticsEvent } from '@stickyqr/analytics';

export class GeolocationPlugin implements Plugin {
  name = 'geolocation';
  type: 'enrichment' = 'enrichment';
  version = '1.0.0';

  private loaded = false;
  private location: { lat: number; lon: number } | null = null;

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    // Get user's geolocation
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        this.location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
      } catch (error) {
        console.warn('Geolocation permission denied');
      }
    }

    this.loaded = true;
  }

  private enrichEvent<T extends AnalyticsEvent>(event: T): T {
    if (!this.location) return event;

    return {
      ...event,
      context: {
        ...event.context,
        location: this.location
      }
    };
  }

  async identify(event: any): Promise<any> {
    return this.enrichEvent(event);
  }

  async track(event: any): Promise<any> {
    return this.enrichEvent(event);
  }

  async page(event: any): Promise<any> {
    return this.enrichEvent(event);
  }

  async screen(event: any): Promise<any> {
    return this.enrichEvent(event);
  }
}

// Usage
const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [new GeolocationPlugin()]
});
```

### A/B Test Plugin

```typescript
import { Plugin, AnalyticsEvent } from '@stickyqr/analytics';

export class ABTestPlugin implements Plugin {
  name = 'ab-test';
  type: 'enrichment' = 'enrichment';
  version = '1.0.0';

  private loaded = false;
  private experiments: Record<string, string> = {};

  constructor(experiments: { name: string; variant: string }[]) {
    experiments.forEach(exp => {
      this.experiments[exp.name] = exp.variant;
    });
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    this.loaded = true;
  }

  private enrichEvent<T extends AnalyticsEvent>(event: T): T {
    return {
      ...event,
      properties: {
        ...event.properties,
        experiments: this.experiments
      }
    };
  }

  async track(event: any): Promise<any> {
    return this.enrichEvent(event);
  }
}

// Usage
const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [
    new ABTestPlugin([
      { name: 'homepage_hero', variant: 'variant_a' },
      { name: 'pricing_table', variant: 'variant_b' }
    ])
  ]
});
```

## Example: Custom Destination Plugin

### Mixpanel Plugin

```typescript
import { Plugin, TrackEvent, IdentifyEvent } from '@stickyqr/analytics';

declare global {
  interface Window {
    mixpanel?: any;
  }
}

export class MixpanelPlugin implements Plugin {
  name = 'mixpanel';
  type: 'destination' = 'destination';
  version = '1.0.0';

  private loaded = false;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Load Mixpanel SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.async = true;

    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Initialize Mixpanel
    window.mixpanel.init(this.token);
    this.loaded = true;
  }

  async identify(event: IdentifyEvent): Promise<IdentifyEvent> {
    if (window.mixpanel && event.userId) {
      window.mixpanel.identify(event.userId);

      if (event.traits) {
        window.mixpanel.people.set(event.traits);
      }
    }

    return event;
  }

  async track(event: TrackEvent): Promise<TrackEvent> {
    if (window.mixpanel) {
      window.mixpanel.track(event.event, event.properties);
    }

    return event;
  }
}

// Usage
const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [
    new MixpanelPlugin('your-mixpanel-token')
  ]
});
```

### Webhook Plugin

```typescript
import { Plugin, AnalyticsEvent } from '@stickyqr/analytics';

export class WebhookPlugin implements Plugin {
  name = 'webhook';
  type: 'destination' = 'destination';
  version = '1.0.0';

  private loaded = false;
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    this.loaded = true;
  }

  private async sendToWebhook(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        keepalive: true
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }

    return event;
  }

  async identify(event: any): Promise<any> {
    return this.sendToWebhook(event);
  }

  async track(event: any): Promise<any> {
    return this.sendToWebhook(event);
  }

  async page(event: any): Promise<any> {
    return this.sendToWebhook(event);
  }
}

// Usage
const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [
    new WebhookPlugin('https://your-api.com/webhook')
  ]
});
```

## Example: Validation Plugin

### Event Validator Plugin

```typescript
import { Plugin, AnalyticsEvent } from '@stickyqr/analytics';

export class ValidationPlugin implements Plugin {
  name = 'validator';
  type: 'before' = 'before';
  version = '1.0.0';

  private loaded = false;
  private rules: Record<string, (event: any) => boolean>;

  constructor(rules?: Record<string, (event: any) => boolean>) {
    this.rules = rules || {};
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    this.loaded = true;
  }

  async track(event: any): Promise<any> {
    // Check if event name is valid
    if (!event.event || typeof event.event !== 'string') {
      console.error('Invalid event name:', event);
      return null; // Block invalid event
    }

    // Apply custom rules
    if (this.rules[event.event]) {
      const isValid = this.rules[event.event](event);
      if (!isValid) {
        console.error('Event validation failed:', event);
        return null;
      }
    }

    return event;
  }
}

// Usage
const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [
    new ValidationPlugin({
      'Purchase Completed': (event) => {
        // Ensure revenue is present
        return event.properties?.revenue > 0;
      },
      'Form Submitted': (event) => {
        // Ensure formId is present
        return !!event.properties?.formId;
      }
    })
  ]
});
```

## Example: PII Sanitizer Plugin

```typescript
import { Plugin, AnalyticsEvent } from '@stickyqr/analytics';

export class PIISanitizerPlugin implements Plugin {
  name = 'pii-sanitizer';
  type: 'enrichment' = 'enrichment';
  version = '1.0.0';

  private loaded = false;
  private piiFields = ['email', 'phone', 'ssn', 'creditCard'];

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    this.loaded = true;
  }

  private sanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = { ...obj };

    for (const key in sanitized) {
      // Hash PII fields
      if (this.piiFields.includes(key.toLowerCase())) {
        sanitized[key] = this.hash(sanitized[key]);
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  private hash(value: string): string {
    // Simple hash (use crypto in production)
    return btoa(String(value)).substring(0, 16) + '...';
  }

  private sanitizeEvent<T extends AnalyticsEvent>(event: T): T {
    return {
      ...event,
      properties: this.sanitize(event.properties),
      traits: this.sanitize((event as any).traits)
    };
  }

  async identify(event: any): Promise<any> {
    return this.sanitizeEvent(event);
  }

  async track(event: any): Promise<any> {
    return this.sanitizeEvent(event);
  }
}
```

## Plugin Best Practices

1. **Always handle errors gracefully**
```typescript
async track(event: TrackEvent): Promise<TrackEvent> {
  try {
    // Your plugin logic
    return event;
  } catch (error) {
    console.error(`[${this.name}] Error:`, error);
    return event; // Return original event on error
  }
}
```

2. **Don't block event flow**
```typescript
// BAD: Blocking operation
async track(event: TrackEvent): Promise<TrackEvent> {
  await someSlowOperation(); // This blocks!
  return event;
}

// GOOD: Non-blocking
async track(event: TrackEvent): Promise<TrackEvent> {
  someSlowOperation(); // Fire and forget
  return event;
}
```

3. **Check if feature is available**
```typescript
async load(): Promise<void> {
  if (typeof window === 'undefined') {
    this.loaded = true;
    return; // Skip in SSR
  }

  if (!navigator.geolocation) {
    console.warn('Geolocation not available');
    this.loaded = true;
    return;
  }

  // Feature available, proceed
}
```

4. **Use type guards**
```typescript
private isTrackEvent(event: AnalyticsEvent): event is TrackEvent {
  return event.type === 'track';
}

async track(event: TrackEvent): Promise<TrackEvent> {
  if (this.isTrackEvent(event)) {
    // TypeScript knows event is TrackEvent
  }
  return event;
}
```

5. **Make plugins configurable**
```typescript
export class MyPlugin implements Plugin {
  constructor(private config: {
    enabled: boolean;
    apiKey: string;
    options?: any;
  }) {}
}
```

## Testing Plugins

```typescript
import { Analytics } from '@stickyqr/analytics';
import { MyPlugin } from './my-plugin';

// Test plugin
const plugin = new MyPlugin();

// Mock analytics
const mockAnalytics = {
  // ... mock implementation
};

await plugin.load(mockAnalytics);
expect(plugin.isLoaded()).toBe(true);

// Test event processing
const event = {
  type: 'track',
  event: 'Test Event',
  properties: {}
};

const result = await plugin.track(event);
expect(result).toBeDefined();
```

## Publishing Plugins

1. Create npm package
2. Export plugin class
3. Document configuration options
4. Provide usage examples
5. Add TypeScript types

```json
{
  "name": "@yourcompany/analytics-plugin-name",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@stickyqr/analytics": "^1.0.0"
  }
}
```
