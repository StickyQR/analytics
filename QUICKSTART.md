# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the SDK

```bash
npm run build
```

This creates three bundles in `dist/`:
- `index.js` (CommonJS)
- `index.esm.js` (ES Module)
- `index.umd.js` (Browser UMD)

### Step 3: Try the Demo

Open `examples/basic.html` in your browser to see a live demo with all features.

## Usage in Your Project

### Option 1: NPM Package (Recommended)

```bash
npm install @stickyqr/analytics
```

```typescript
import { Analytics } from '@stickyqr/analytics';

const analytics = new Analytics({
  writeKey: 'your-write-key'
});

// Track events
analytics.track('Button Clicked', { buttonId: 'signup' });

// Identify users
analytics.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe'
});
```

### Option 2: CDN (Browser)

```html
<script src="https://cdn.stickyqr.com/analytics/1.0.0/index.umd.js"></script>
<script>
  const analytics = new StickyQRAnalytics.Analytics({
    writeKey: 'your-write-key'
  });

  analytics.track('Page Viewed');
</script>
```

### Option 3: Local Build

Copy `dist/index.umd.js` to your project:

```html
<script src="/js/stickyqr-analytics-sdk.js"></script>
<script>
  const analytics = new StickyQRAnalytics.Analytics({
    writeKey: 'your-write-key'
  });
</script>
```

## Basic API

### Initialize

```javascript
const analytics = new StickyQRAnalytics.Analytics({
  writeKey: 'your-write-key',
  debug: true  // Enable console logging
});
```

### Track Events

```javascript
// Simple event
analytics.track('Button Clicked');

// Event with properties
analytics.track('Product Viewed', {
  productId: 'prod-123',
  price: 99.99
});
```

### Identify Users

```javascript
// Identify user
analytics.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium'
});

// Update traits for current user
analytics.identify(undefined, {
  lastLogin: new Date()
});
```

### Track Page Views

```javascript
// Auto-tracked by default
// Or manually track
analytics.page('Home');
analytics.page('Pricing', 'Marketing', { plan: 'enterprise' });
```

### Reset User (Logout)

```javascript
analytics.reset();
```

## Backend Setup

Your backend needs to implement one endpoint to receive events:

**POST** `/v1/batch`

```javascript
// Express.js example
app.post('/v1/batch', async (req, res) => {
  const { batch } = req.body;

  // Process events (save to database, queue, etc.)
  for (const event of batch) {
    await processEvent(event);
  }

  res.json({ success: true });
});
```

See `API_SPEC.md` for complete backend implementation.

## Common Patterns

### React Integration

```typescript
import { Analytics } from '@stickyqr/analytics';
import { createContext, useContext } from 'react';

const AnalyticsContext = createContext<Analytics | null>(null);

export function AnalyticsProvider({ children, writeKey }) {
  const analytics = new Analytics({ writeKey });
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

  return (
    <button onClick={() => analytics.track('Button Clicked')}>
      Click me
    </button>
  );
}
```

### E-commerce Tracking

```javascript
// Product view
analytics.track('Product Viewed', {
  productId: 'prod-123',
  name: 'Product Name',
  price: 99.99,
  category: 'Electronics'
});

// Add to cart
analytics.track('Product Added', {
  productId: 'prod-123',
  price: 99.99,
  quantity: 1
});

// Purchase
analytics.track('Order Completed', {
  orderId: 'order-123',
  revenue: 99.99,
  currency: 'USD',
  products: [
    { productId: 'prod-123', quantity: 1, price: 99.99 }
  ]
});
```

### User Signup Flow

```javascript
// 1. User signs up
analytics.track('Signup Started', {
  method: 'email'
});

// 2. User completes signup
analytics.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  signupDate: new Date()
});

analytics.track('Signup Completed', {
  method: 'email'
});

// 3. Link anonymous ID to user ID
analytics.alias('user-123', analytics.user().anonymousId);
```

## Plugins

### Enable Debug Logging

```javascript
import { Analytics, ConsoleLoggerPlugin } from '@stickyqr/analytics';

const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [new ConsoleLoggerPlugin()]
});
```

### Google Analytics Integration

```javascript
import { GoogleAnalyticsPlugin } from '@stickyqr/analytics';

const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [
    new GoogleAnalyticsPlugin({
      measurementId: 'G-XXXXXXXXXX'
    })
  ]
});
```

### Device Enrichment

```javascript
import { DeviceEnrichmentPlugin } from '@stickyqr/analytics';

const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [new DeviceEnrichmentPlugin()]
});

// All events now include device, browser, OS info
```

## Configuration

Full configuration options:

```javascript
const analytics = new Analytics({
  // Required
  writeKey: 'your-write-key',

  // API endpoint

  // Queue settings
  flushAt: 20,              // Flush after 20 events
  flushInterval: 10000,     // Flush every 10 seconds
  maxQueueSize: 100,        // Max 100 events in queue
  retryAttempts: 3,         // Retry 3 times

  // Features
  debug: false,             // Debug mode
  trackPageViews: true,     // Auto-track page views

  // Storage
  anonymousIdKey: 'stickyqr_analytics_anonymous_id',
  userIdKey: 'stickyqr_analytics_user_id',

  // Plugins
  plugins: []
});
```

## Debugging

```javascript
// Enable debug mode
const analytics = new Analytics({
  writeKey: 'your-write-key',
  debug: true
});

// View current user
console.log(analytics.user());

// View analytics state
analytics.debug();

// Check queue size
console.log(analytics.queue.size());

// Manually flush queue
await analytics.flush();
```

## Next Steps

1. **Customize**: Update package name, branding in `package.json`
2. **Backend**: Implement `/v1/batch` endpoint (see `API_SPEC.md`)
3. **Plugins**: Create custom plugins (see `PLUGIN_GUIDE.md`)
4. **Deploy**: Publish to NPM or host on CDN
5. **Monitor**: Track usage and errors

## Documentation

- `README.md` - Complete documentation
- `PLUGIN_GUIDE.md` - Plugin development
- `API_SPEC.md` - Backend API specification
- `PROJECT_STRUCTURE.md` - Project overview
- `examples/` - Code examples

## Troubleshooting

### Events not sending?

1. Check browser console for errors
2. Enable debug mode: `debug: true`
3. Check network tab for API requests
4. Verify `writeKey` and `apiHost`

### Storage not working?

1. Check localStorage availability
2. Check cookie permissions
3. Falls back to in-memory storage

### Build errors?

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Support

- GitHub: https://github.com/yourcompany/stickyqr-analytics-sdk
- Email: support@yourcompany.com
