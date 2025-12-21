/**
 * React Integration Example
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Analytics, DeviceEnrichmentPlugin, ConsoleLoggerPlugin } from '@stickyqr/analytics';

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
      debug: true,
      trackPageViews: false, // Manual tracking in React
      plugins: [
        new DeviceEnrichmentPlugin(),
        new ConsoleLoggerPlugin()
      ]
    });
  });

  useEffect(() => {
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

// Hook for page tracking
export function usePageTracking(pageName?: string) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.page(pageName || document.title);
  }, [analytics, pageName]);
}

// Example Component 1: Login Form
export function LoginForm() {
  const analytics = useAnalytics();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Track event
    analytics.track('Login Attempted', {
      method: 'email',
      email
    });

    // Simulate login
    setTimeout(() => {
      // Identify user after successful login
      analytics.identify('user-123', {
        email,
        name: 'John Doe',
        loginMethod: 'email'
      });

      analytics.track('Login Successful', {
        method: 'email'
      });
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}

// Example Component 2: Product Card
export function ProductCard({
  product
}: {
  product: {
    id: string;
    name: string;
    price: number;
  }
}) {
  const analytics = useAnalytics();

  const handleView = () => {
    analytics.track('Product Viewed', {
      productId: product.id,
      productName: product.name,
      price: product.price
    });
  };

  const handleAddToCart = () => {
    analytics.track('Product Added', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      currency: 'USD'
    });
  };

  useEffect(() => {
    handleView();
  }, []);

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}

// Example Component 3: Dashboard (with page tracking)
export function Dashboard() {
  usePageTracking('Dashboard');
  const analytics = useAnalytics();
  const { userId, traits } = analytics.user();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User ID: {userId}</p>
      <p>Email: {traits.email}</p>
      <button onClick={() => analytics.reset()}>Logout</button>
    </div>
  );
}

// Example Component 4: E-commerce Checkout
export function Checkout({ items }: { items: any[] }) {
  const analytics = useAnalytics();

  const handlePurchase = () => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    analytics.track('Order Completed', {
      orderId: 'order-' + Date.now(),
      revenue: total,
      currency: 'USD',
      products: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total
    });
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={handlePurchase}>Complete Purchase</button>
    </div>
  );
}

// Example App
export default function App() {
  return (
    <AnalyticsProvider writeKey="your-write-key">
      <div className="app">
        <Dashboard />
        <LoginForm />
        <ProductCard
          product={{
            id: 'prod-1',
            name: 'Product 1',
            price: 99.99
          }}
        />
      </div>
    </AnalyticsProvider>
  );
}

// Usage in main.tsx or App.tsx:
/*
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
*/
