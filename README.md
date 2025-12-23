# StickyQR Analytics SDK - Customer Data Platform for Browser

A lightweight, modular StickyQR Analytics SDK for browser applications. Built as a modern alternative to Segment.js with TypeScript support, plugin architecture, and privacy-first design.

## Features

- **Identity Management**: Track users with `identify()` and `alias()`
- **Event Tracking**: Track custom events with `track()`
- **Page Views**: Automatic and manual page tracking with `page()`
- **Screen Views**: SPA screen tracking with `screen()`
- **Group Tracking**: Associate users with groups/organizations
- **Plugin System**: Extensible architecture with enrichment and destination plugins
- **Queue & Retry**: Automatic batching and retry logic for reliable delivery
- **Privacy-First**: localStorage/cookie fallback, configurable storage
- **TypeScript**: Full type safety and IntelliSense support
- **Zero Dependencies**: Lightweight bundle size

## Installation

```bash
npm install @stickyqr/analytics
```

Or use via CDN:

```html
<script src="https://cdn.stickyqr.com/analytics/1.0.0/index.umd.js"></script>
```

## Quick Start

### Basic Setup

```typescript
import { Analytics } from "@stickyqr/analytics";

const analytics = new Analytics({
  writeKey: "your-write-key",
  debug: true,
});
```

### Track Page Views

```typescript
// Automatic page tracking (enabled by default)
// Or manually track pages
analytics.page("Home");
analytics.page("Pricing", "Marketing", { plan: "enterprise" });
```

### Identify Users

```typescript
// Identify user
analytics.identify("user-123", {
  email: "user@example.com",
  name: "John Doe",
  plan: "premium",
});

// Update traits for current user
analytics.identify(undefined, {
  lastLogin: new Date().toISOString(),
});
```

### Track Events

```typescript
analytics.track("Button Clicked", {
  buttonId: "cta-signup",
  page: "homepage",
});

analytics.track("Purchase Completed", {
  orderId: "order-123",
  revenue: 99.99,
  currency: "USD",
  products: ["product-1", "product-2"],
});
```

### Screen Views (for SPAs)

```typescript
analytics.screen("Dashboard", "App", {
  section: "overview",
});
```

### Alias Users

```typescript
// Link anonymous user to identified user
analytics.alias("user-123", "anonymous-id-456");
```

### Group Users

```typescript
analytics.group("company-123", {
  name: "Acme Inc",
  plan: "enterprise",
  employees: 50,
});
```

## Configuration

```typescript
const analytics = new Analytics({
  // Required
  writeKey: "your-write-key",
  apiHost: "https://api.stickyqr.com/analytics", // Optional, defaults to https://api.stickyqr.com/analytics

  flushAt: 20, // Flush after N events
  flushInterval: 10000, // Flush every N ms
  maxQueueSize: 100, // Max events in queue
  retryAttempts: 3, // Retry failed requests
  debug: false, // Enable debug logging
  trackPageViews: true, // Auto-track page views
  anonymousIdKey: "stickyqr_analytics_anonymous_id",
  userIdKey: "stickyqr_analytics_user_id",

  // Custom fetch function (optional)
  // Useful for Next.js, custom headers, or testing
  customFetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),

  // Plugins
  plugins: [
    new DeviceEnrichmentPlugin(),
    new GoogleAnalyticsPlugin({ measurementId: "G-XXXXXXXXXX" }),
  ],
});
```

## Custom Fetch

The `customFetch` option allows you to provide a custom fetch function for making HTTP requests. This is useful for:

- **Next.js App Router**: Disable caching for analytics requests
- **Custom headers**: Add authentication or custom headers
- **Proxying**: Route requests through your own server
- **Testing**: Mock network requests in tests

### Examples

#### Next.js (Disable Caching)

```typescript
const analytics = new Analytics({
  writeKey: "your-write-key",
  customFetch: (url, init) =>
    fetch(url, {
      ...init,
      cache: "no-store",
    }),
});
```

#### Add Custom Headers

```typescript
const analytics = new Analytics({
  writeKey: "your-write-key",
  customFetch: (url, init) =>
    fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        "X-Custom-Header": "my-value",
        "X-API-Version": "2024-01",
      },
    }),
});
```

#### Proxy Through Your Server

```typescript
const analytics = new Analytics({
  writeKey: "your-write-key",
  apiHost: "/api/analytics-proxy", // Your proxy endpoint
  customFetch: (url, init) => fetch(url, init),
});
```

#### Testing with Mock

```typescript
const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
});

const analytics = new Analytics({
  writeKey: "test-key",
  customFetch: mockFetch,
});

// Your tests...
expect(mockFetch).toHaveBeenCalled();
```

## Plugins

### Built-in Plugins

#### Console Logger (Debug)

```typescript
import { Analytics, ConsoleLoggerPlugin } from "@stickyqr/analytics";

const analytics = new Analytics({
  writeKey: "your-write-key",
  plugins: [new ConsoleLoggerPlugin()],
});
```

#### Device Enrichment

```typescript
import { DeviceEnrichmentPlugin } from "@stickyqr/analytics";

const analytics = new Analytics({
  writeKey: "your-write-key",
  plugins: [new DeviceEnrichmentPlugin()],
});

// Adds device, browser, OS info to all events
```

#### Google Analytics 4

```typescript
import { GoogleAnalyticsPlugin } from "@stickyqr/analytics";

const analytics = new Analytics({
  writeKey: "your-write-key",
  plugins: [
    new GoogleAnalyticsPlugin({
      measurementId: "G-XXXXXXXXXX",
    }),
  ],
});
```

### Custom Plugins

Create your own plugins by implementing the `Plugin` interface:

```typescript
import { Plugin, TrackEvent } from "@stickyqr/analytics";

class MyCustomPlugin implements Plugin {
  name = "my-plugin";
  type: "enrichment" = "enrichment";
  version = "1.0.0";
  private loaded = false;

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    // Initialize your plugin
    this.loaded = true;
  }

  async track(event: TrackEvent): Promise<TrackEvent> {
    // Modify or send the event
    return {
      ...event,
      properties: {
        ...event.properties,
        customField: "value",
      },
    };
  }
}

// Register plugin
analytics.register(new MyCustomPlugin());
```

### Plugin Types

- **before**: Pre-processing before event creation
- **enrichment**: Enrich events with additional data
- **destination**: Send events to external services
- **after**: Post-processing after all other plugins

## API Reference

### `identify(userId?, traits?, options?)`

Associate user with their actions and traits.

```typescript
analytics.identify("user-123", {
  email: "user@example.com",
  name: "John Doe",
});
```

### `track(event, properties?, options?)`

Track a custom event.

```typescript
analytics.track("Video Played", {
  videoId: "video-123",
  duration: 120,
});
```

### `page(name?, category?, properties?, options?)`

Track a page view.

```typescript
analytics.page("Pricing", "Marketing", {
  experiment: "variant-a",
});
```

### `screen(name?, category?, properties?, options?)`

Track a screen view (for SPAs).

```typescript
analytics.screen("Settings", "App", {
  section: "profile",
});
```

### `alias(userId, previousId?, options?)`

Link user identities.

```typescript
analytics.alias("user-123", "anonymous-456");
```

### `group(groupId, traits?, options?)`

Associate user with a group.

```typescript
analytics.group("company-123", {
  name: "Acme Inc",
  plan: "enterprise",
});
```

### `user()`

Get current user information.

```typescript
const { userId, anonymousId, traits } = analytics.user();
```

### `reset()`

Reset user (logout).

```typescript
analytics.reset();
```

### `flush()`

Manually flush the event queue.

```typescript
await analytics.flush();
```

### `debug()`

Print debug information to console.

```typescript
analytics.debug();
```

## Event Options

All tracking methods accept an optional `options` parameter:

```typescript
analytics.track(
  "Event Name",
  { prop: "value" },
  {
    timestamp: new Date("2024-01-01"),
    context: {
      ip: "192.168.1.1",
      userAgent: "custom-ua",
    },
    integrations: {
      "Google Analytics": false, // Disable for specific integration
    },
  }
);
```

## Privacy & GDPR

```typescript
// Don't track until user consent
let analytics;

function onUserConsent() {
  analytics = new Analytics({
    writeKey: "your-write-key",
  });
}

// Clear all data on user request
analytics.reset();
localStorage.clear(); // Remove stored IDs
```

## Framework Integration

### React

```typescript
import { Analytics } from "@stickyqr/analytics";
import { createContext, useContext } from "react";

const AnalyticsContext = createContext<Analytics | null>(null);

export function AnalyticsProvider({ children }) {
  const analytics = new Analytics({
    writeKey: "your-write-key",
  });

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// Usage
function MyComponent() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.track("Button Clicked");
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Vue

```typescript
import { Analytics } from "@stickyqr/analytics";

const analytics = new Analytics({
  writeKey: "your-write-key",
});

export default {
  install(app) {
    app.config.globalProperties.$analytics = analytics;
    app.provide("analytics", analytics);
  },
};

// main.js
import { createApp } from "vue";
import analyticsPlugin from "./analytics";

createApp(App).use(analyticsPlugin).mount("#app");

// Usage in component
export default {
  methods: {
    trackEvent() {
      this.$analytics.track("Button Clicked");
    },
  },
};
```

### Next.js

#### App Router (Next.js 13+)

When using Next.js App Router, the global `fetch` is patched by Next.js for caching. Use `customFetch` to disable caching for analytics requests:

```typescript
// lib/analytics.ts
import { Analytics } from "@stickyqr/analytics";

export const analytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_STICKYQR_WRITE_KEY!,
  // Disable Next.js caching for analytics requests
  customFetch: (url, init) =>
    fetch(url, {
      ...init,
      cache: "no-store",
    }),
});
```

Alternative with `next.revalidate`:

```typescript
export const analytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_STICKYQR_WRITE_KEY!,
  customFetch: (url, init) =>
    fetch(url, {
      ...init,
      next: { revalidate: 0 },
    }),
});
```

#### Pages Router

```typescript
// lib/analytics.ts
import { Analytics } from "@stickyqr/analytics";

export const analytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_STICKYQR_WRITE_KEY!,
});

// _app.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { analytics } from "../lib/analytics";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = (url) => {
      analytics.page(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

#### Using with Server Components

For tracking in Server Components or Server Actions, always use `customFetch`:

```typescript
// lib/analytics-server.ts
import { Analytics } from "@stickyqr/analytics";

export const serverAnalytics = new Analytics({
  writeKey: process.env.ANALYTICS_WRITE_KEY!,
  trackPageViews: false,
  customFetch: (url, init) =>
    fetch(url, {
      ...init,
      cache: "no-store",
    }),
});

// app/actions.ts
("use server");
import { serverAnalytics } from "@/lib/analytics-server";

export async function submitForm(formData: FormData) {
  // Process form...

  await serverAnalytics.track("Form Submitted", {
    formId: "contact-form",
  });
  await serverAnalytics.flush();
}
```

### Node.js

The SDK works seamlessly in Node.js environments for server-side tracking.

#### Basic Setup

```typescript
import { Analytics } from "@stickyqr/analytics";

const analytics = new Analytics({
  writeKey: process.env.ANALYTICS_WRITE_KEY || "your-write-key",
  debug: process.env.NODE_ENV === "development",
  flushAt: 20, // Batch 20 events before sending
  flushInterval: 10000, // Flush every 10 seconds
  maxQueueSize: 1000, // Higher for server environments
  trackPageViews: false, // Disable auto page tracking in Node
});
```

#### Express.js Integration

```typescript
import express from "express";
import { Analytics } from "@stickyqr/analytics";

const app = express();
const analytics = new Analytics({
  writeKey: process.env.ANALYTICS_WRITE_KEY!,
  trackPageViews: false,
});

// Track API requests
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    analytics.track("API Request", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
  });

  next();
});

// User registration
app.post("/api/register", async (req, res) => {
  const { email, name } = req.body;
  const user = await createUser({ email, name });

  // Identify user
  await analytics.identify(user.id, {
    email: user.email,
    name: user.name,
    platform: "api",
  });

  // Track signup
  await analytics.track("User Registered", {
    userId: user.id,
    source: req.headers.referer,
  });

  res.json({ success: true, userId: user.id });
});
```

#### E-commerce Tracking

```typescript
app.post("/api/orders", async (req, res) => {
  const { userId, items, total } = req.body;
  const order = await createOrder({ userId, items, total });

  // Track purchase
  await analytics.track("Order Completed", {
    userId,
    orderId: order.id,
    revenue: order.total,
    currency: "USD",
    products: order.items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  res.json({ success: true, orderId: order.id });
});
```

#### Background Jobs & Cron

```typescript
import cron from "node-cron";

cron.schedule("0 0 * * *", async () => {
  analytics.track("Daily Job Started", {
    jobName: "cleanup",
    timestamp: new Date(),
  });

  try {
    await runDailyCleanup();
    analytics.track("Daily Job Completed", {
      jobName: "cleanup",
    });
  } catch (error) {
    analytics.track("Daily Job Failed", {
      jobName: "cleanup",
      error: error.message,
    });
  }

  // Flush events before job completes
  await analytics.flush();
});
```

#### Webhook Handlers

```typescript
app.post("/webhooks/stripe", async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "payment_intent.succeeded":
      analytics.track("Payment Succeeded", {
        userId: event.data.object.customer,
        amount: event.data.object.amount / 100,
        currency: event.data.object.currency,
      });
      break;

    case "customer.subscription.created":
      analytics.track("Subscription Created", {
        userId: event.data.object.customer,
        plan: event.data.object.plan.id,
      });
      break;
  }

  res.json({ received: true });
});
```

#### Graceful Shutdown

Always flush events on server shutdown:

```typescript
// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, flushing analytics...");
  await analytics.flush();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, flushing analytics...");
  await analytics.flush();
  process.exit(0);
});
```

#### Error Tracking

```typescript
process.on("uncaughtException", (error) => {
  analytics.track("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
    timestamp: new Date(),
  });

  analytics.flush().then(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  analytics.track("Unhandled Rejection", {
    reason: String(reason),
    timestamp: new Date(),
  });
});
```

#### Best Practices for Node.js

1. **Singleton Pattern**: Create one Analytics instance per application
2. **Environment Variables**: Use env vars for configuration
3. **Higher Queue Limits**: Increase `maxQueueSize` for server environments
4. **Manual Flushing**: Call `flush()` in background jobs and on shutdown
5. **Error Handling**: Track errors and exceptions for monitoring
6. **Fire-and-Forget**: Don't await `track()` unless critical (events are queued)
7. **Disable Auto Page Tracking**: Set `trackPageViews: false` in Node.js

#### Node.js Requirements

- **Node.js 18+** (for native `fetch` support)
- For Node.js 16 or earlier, install a fetch polyfill:
  ```bash
  npm install node-fetch
  ```

#### Environment Variables

```bash
ANALYTICS_WRITE_KEY=your-write-key
NODE_ENV=production
```

## Platform Support

### Browser

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

### Node.js

- Node.js 18+ (native `fetch` support)
- For Node.js 16 or earlier, install `node-fetch`:
  ```bash
  npm install node-fetch
  ```

See [NODEJS_ANALYSIS.md](./NODEJS_ANALYSIS.md) for detailed Node.js support analysis and recommendations.

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## Support

For issues and questions:

- GitHub Issues: https://github.com/yourcompany/stickyqr-analytics-sdk/issues
- Email: support@yourcompany.com
