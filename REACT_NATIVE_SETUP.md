

# React Native Setup Guide

Complete guide for using `@stickyqr/analytics` with React Native and Expo 54.

## Installation

### For Expo Projects (Recommended)

```bash
# Install the analytics SDK
npx expo install @stickyqr/analytics

# Install required peer dependencies
npx expo install @react-native-async-storage/async-storage expo-constants expo-device
```

### For Bare React Native Projects

```bash
# Install the analytics SDK
npm install @stickyqr/analytics

# Install peer dependencies
npm install @react-native-async-storage/async-storage
npm install expo-constants expo-device

# Link native modules (if not using autolinking)
cd ios && pod install && cd ..
```

## Quick Start

### 1. Initialize Analytics

```typescript
// lib/analytics.ts
import { Analytics } from '@stickyqr/analytics';

export const analytics = new Analytics({
  writeKey: 'your-write-key',
  debug: __DEV__, // Enable debug in development
  trackPageViews: false, // No page tracking in RN
  flushAt: 10,
  flushInterval: 30000 // 30 seconds
});
```

### 2. Use with React Context (Recommended)

```typescript
// contexts/AnalyticsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Analytics } from '@stickyqr/analytics';

const AnalyticsContext = createContext<Analytics | null>(null);

export function AnalyticsProvider({
  children,
  writeKey
}: {
  children: React.ReactNode;
  writeKey: string;
}) {
  const [analytics] = useState(() => {
    return new Analytics({
      writeKey,
      debug: __DEV__
    });
  });

  useEffect(() => {
    // Track app launch
    analytics.track('App Launched');

    return () => {
      analytics.flush();
    };
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
```

### 3. Wrap Your App

```typescript
// App.tsx
import { AnalyticsProvider } from './contexts/AnalyticsContext';

export default function App() {
  return (
    <AnalyticsProvider writeKey="your-write-key">
      {/* Your app components */}
    </AnalyticsProvider>
  );
}
```

## Usage Examples

### Track Events

```typescript
import { useAnalytics } from './contexts/AnalyticsContext';

function MyScreen() {
  const analytics = useAnalytics();

  const handleButtonClick = () => {
    analytics.track('Button Clicked', {
      buttonId: 'signup-cta',
      screen: 'Home'
    });
  };

  return <Button onPress={handleButtonClick} title="Sign Up" />;
}
```

### Identify Users

```typescript
function LoginScreen() {
  const analytics = useAnalytics();

  const handleLogin = async (userId: string, email: string) => {
    await analytics.identify(userId, {
      email,
      name: 'John Doe',
      platform: 'mobile'
    });

    analytics.track('Login Successful');
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

### Screen Tracking

```typescript
import { useEffect } from 'react';
import { useAnalytics } from './contexts/AnalyticsContext';

// Custom hook for screen tracking
function useScreenTracking(screenName: string, properties?: any) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.screen(screenName, 'App', properties);
  }, [analytics, screenName]);
}

// Usage in screen component
function ProductScreen({ route }: any) {
  const { productId } = route.params;

  useScreenTracking('Product', {
    productId,
    source: 'catalog'
  });

  return <View>{/* Screen content */}</View>;
}
```

### E-commerce Tracking

```typescript
function ProductScreen({ product }: any) {
  const analytics = useAnalytics();

  const handleAddToCart = () => {
    analytics.track('Product Added', {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      currency: 'USD'
    });
  };

  const handlePurchase = (orderId: string) => {
    analytics.track('Order Completed', {
      orderId,
      revenue: product.price,
      currency: 'USD',
      products: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ]
    });
  };

  return (
    <View>
      <Button title="Add to Cart" onPress={handleAddToCart} />
      <Button title="Buy Now" onPress={() => handlePurchase('order-123')} />
    </View>
  );
}
```

### Logout/Reset

```typescript
function SettingsScreen() {
  const analytics = useAnalytics();

  const handleLogout = async () => {
    analytics.track('User Logged Out');
    await analytics.reset(); // Clear user data
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
```

## Integration with React Navigation

Automatic screen tracking with React Navigation:

```typescript
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { useAnalytics } from './contexts/AnalyticsContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const analytics = useAnalytics();
  const routeNameRef = useRef<string>();
  const navigationRef = useRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRoute = navigationRef.current?.getCurrentRoute();
        const currentRouteName = currentRoute?.name;

        if (previousRouteName !== currentRouteName) {
          // Track screen view
          analytics.screen(currentRouteName || 'Unknown', 'App', {
            params: currentRoute?.params
          });
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AnalyticsProvider writeKey="your-write-key">
      <AppNavigator />
    </AnalyticsProvider>
  );
}
```

## Platform-Specific Features

### Expo Device Info

The SDK automatically collects device info if `expo-device` is installed:

- Device manufacturer (Apple, Samsung, etc.)
- Device model (iPhone 15 Pro, Galaxy S24, etc.)
- OS name and version (iOS 17.2, Android 14, etc.)

### Expo App Info

The SDK automatically collects app info if `expo-constants` is installed:

- App name
- App version
- Build number
- Bundle identifier

### AsyncStorage

User data (user ID, traits, anonymous ID) is automatically persisted using `@react-native-async-storage/async-storage`.

## Configuration

Full configuration options:

```typescript
const analytics = new Analytics({
  // Required
  writeKey: 'your-write-key',

  // Queue settings
  flushAt: 10, // Flush after 10 events (lower for mobile)
  flushInterval: 30000, // Flush every 30 seconds
  maxQueueSize: 50, // Max 50 events in queue
  retryAttempts: 3,

  // Features
  debug: __DEV__, // Enable in development
  trackPageViews: false, // No page views in RN

  // Storage keys
  anonymousIdKey: 'stickyqr_analytics_anonymous_id',
  userIdKey: 'stickyqr_analytics_user_id'
});
```

## Troubleshooting

### AsyncStorage not found

```bash
# Install AsyncStorage
npx expo install @react-native-async-storage/async-storage
```

### Device info not working

```bash
# Install Expo device and constants
npx expo install expo-device expo-constants
```

### TypeScript errors

Make sure you have the correct types:

```bash
npm install --save-dev @types/react @types/react-native
```

### Events not sending

1. Check network connection
2. Enable debug mode: `debug: true`
3. Check console for errors
4. Verify API endpoint is reachable
5. Check writeKey is correct

### AsyncStorage quota exceeded

Reduce queue size:

```typescript
const analytics = new Analytics({
  writeKey: 'your-write-key',
  maxQueueSize: 20, // Lower queue size
  flushAt: 5, // Flush more frequently
  flushInterval: 10000 // Flush every 10 seconds
});
```

## Best Practices

### 1. Use Context Provider

Always wrap your app with `AnalyticsProvider` for easy access across components.

### 2. Track Screen Views

Use the `useScreenTracking` hook or React Navigation integration for automatic tracking.

### 3. Flush on App Background

```typescript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background') {
      analytics.flush(); // Flush events before backgrounding
    }
  });

  return () => subscription.remove();
}, []);
```

### 4. Handle Errors Gracefully

```typescript
try {
  await analytics.identify(userId, traits);
} catch (error) {
  console.error('Analytics error:', error);
  // Don't block user flow
}
```

### 5. Test in Development

Enable debug mode to see events in console:

```typescript
const analytics = new Analytics({
  writeKey: 'your-write-key',
  debug: __DEV__ // Only in development
});
```

## Examples

See complete examples in:
- `examples/react-native-expo-example.tsx` - Full Expo app example
- Integration with React Navigation
- E-commerce tracking
- User authentication flow

## Performance

- **Bundle size**: ~17KB (very light for mobile)
- **Native dependencies**: Only AsyncStorage (required)
- **Memory usage**: Minimal, queue auto-flushes
- **Battery impact**: Negligible, batches requests

## Privacy

The SDK respects user privacy:
- ✅ Data stored locally (AsyncStorage)
- ✅ User can be reset with `analytics.reset()`
- ✅ No tracking until initialized
- ✅ Full control over data sent

## Migration from Segment

If you're migrating from Segment React Native SDK:

1. Replace `@segment/analytics-react-native` with `@stickyqr/analytics`
2. API is 95% compatible
3. No changes needed to tracking calls
4. Update initialization only

See `MIGRATION_FROM_SEGMENT.md` for detailed migration guide.

## Support

For issues or questions:
- GitHub: https://github.com/stickyqr/analytics
- Email: support@stickyqr.com
- Docs: See README.md

## Requirements

- **React Native**: >=0.70.0
- **Expo**: >=50.0.0 (tested with Expo 54)
- **iOS**: >=13.0
- **Android**: SDK >=23 (Android 6.0+)

## License

MIT
