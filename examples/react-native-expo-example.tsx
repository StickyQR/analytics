/**
 * React Native (Expo 54) Integration Example
 * Full example for @stickyqr/analytics in React Native
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { Analytics } from '@stickyqr/analytics';

// Create Analytics Context
const AnalyticsContext = createContext<Analytics | null>(null);

// Analytics Provider Component
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
      debug: __DEV__, // Enable debug in development
      trackPageViews: false, // No page views in RN, use screen tracking
      flushAt: 10, // Flush after 10 events
      flushInterval: 30000 // Flush every 30 seconds
    });
  });

  useEffect(() => {
    // Track app launch
    analytics.track('App Launched');

    // Cleanup on unmount
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

// Hook to use analytics
export function useAnalytics() {
  const analytics = useContext(AnalyticsContext);
  if (!analytics) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return analytics;
}

// Hook for screen tracking
export function useScreenTracking(screenName: string, properties?: any) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.screen(screenName, 'App', properties);
  }, [analytics, screenName]);
}

// Example Screen 1: Login Screen
export function LoginScreen({ navigation }: any) {
  useScreenTracking('Login');
  const analytics = useAnalytics();
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    // Track login attempt
    analytics.track('Login Attempted', {
      method: 'email',
      email
    });

    // Simulate login
    setTimeout(() => {
      const userId = 'user-' + Date.now();

      // Identify user
      analytics.identify(userId, {
        email,
        name: 'John Doe',
        platform: 'mobile',
        loginMethod: 'email'
      });

      analytics.track('Login Successful', {
        method: 'email',
        userId
      });

      navigation.navigate('Home');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Button title="Login with Email" onPress={handleLogin} />
    </View>
  );
}

// Example Screen 2: Home Screen
export function HomeScreen({ navigation }: any) {
  useScreenTracking('Home', {
    section: 'main'
  });

  const analytics = useAnalytics();
  const { userId, traits } = analytics.user();

  const handleButtonClick = () => {
    analytics.track('Button Clicked', {
      buttonId: 'cta-upgrade',
      screen: 'Home'
    });
  };

  const handleProductView = (productId: string) => {
    analytics.track('Product Viewed', {
      productId,
      productName: 'Premium Plan',
      price: 99.99,
      currency: 'USD'
    });

    navigation.navigate('Product', { productId });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text>User ID: {userId || 'Not logged in'}</Text>
      <Text>Email: {traits.email || 'N/A'}</Text>

      <View style={styles.buttonGroup}>
        <Button title="Track Event" onPress={handleButtonClick} />
        <Button title="View Product" onPress={() => handleProductView('prod-123')} />
        <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
      </View>
    </ScrollView>
  );
}

// Example Screen 3: Product Screen
export function ProductScreen({ route, navigation }: any) {
  const { productId } = route.params;
  useScreenTracking('Product', {
    productId
  });

  const analytics = useAnalytics();

  const handleAddToCart = () => {
    analytics.track('Product Added', {
      productId,
      productName: 'Premium Plan',
      price: 99.99,
      quantity: 1,
      currency: 'USD'
    });
  };

  const handlePurchase = () => {
    analytics.track('Order Completed', {
      orderId: 'order-' + Date.now(),
      productId,
      revenue: 99.99,
      currency: 'USD',
      products: [
        {
          productId,
          name: 'Premium Plan',
          price: 99.99,
          quantity: 1
        }
      ]
    });

    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product: {productId}</Text>
      <View style={styles.buttonGroup}>
        <Button title="Add to Cart" onPress={handleAddToCart} />
        <Button title="Purchase" onPress={handlePurchase} />
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

// Example Screen 4: Settings Screen
export function SettingsScreen() {
  useScreenTracking('Settings');
  const analytics = useAnalytics();

  const handleLogout = () => {
    analytics.track('User Logged Out');
    analytics.reset(); // Clear user data
  };

  const handleDebug = () => {
    analytics.debug(); // Print debug info to console
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.buttonGroup}>
        <Button title="Logout" onPress={handleLogout} color="red" />
        <Button title="Debug Info" onPress={handleDebug} />
      </View>
    </View>
  );
}

// Example App Component
export default function App() {
  return (
    <AnalyticsProvider writeKey="your-write-key">
      {/* Your navigation setup here */}
      <HomeScreen navigation={{}} />
    </AnalyticsProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10
  }
});

/**
 * Usage with React Navigation:
 *
 * import { NavigationContainer } from '@react-navigation/native';
 * import { createNativeStackNavigator } from '@react-navigation/native-stack';
 *
 * const Stack = createNativeStackNavigator();
 *
 * export default function App() {
 *   return (
 *     <AnalyticsProvider writeKey="your-write-key">
 *       <NavigationContainer>
 *         <Stack.Navigator>
 *           <Stack.Screen name="Login" component={LoginScreen} />
 *           <Stack.Screen name="Home" component={HomeScreen} />
 *           <Stack.Screen name="Product" component={ProductScreen} />
 *           <Stack.Screen name="Settings" component={SettingsScreen} />
 *         </Stack.Navigator>
 *       </NavigationContainer>
 *     </AnalyticsProvider>
 *   );
 * }
 */

/**
 * Installation for Expo 54:
 *
 * 1. Install the analytics package:
 *    npx expo install @stickyqr/analytics
 *
 * 2. Install required peer dependencies:
 *    npx expo install @react-native-async-storage/async-storage
 *    npx expo install expo-constants expo-device
 *
 * 3. Import and use in your app:
 *    import { Analytics } from '@stickyqr/analytics';
 *
 * 4. Initialize in App.tsx:
 *    const analytics = new Analytics({
 *      writeKey: 'your-write-key',
 *    });
 */
