/**
 * Node.js Server-Side Usage Example
 * Full example for @stickyqr/analytics in Node.js/Express
 */
import express from 'express';
import { Analytics } from '@stickyqr/analytics';

// Initialize Analytics (singleton)
const analytics = new Analytics({
  writeKey: process.env.ANALYTICS_WRITE_KEY || 'your-write-key',
  debug: process.env.NODE_ENV === 'development',
  flushAt: 20, // Batch 20 events before sending
  flushInterval: 10000, // Flush every 10 seconds
  maxQueueSize: 1000, // Higher for server
  trackPageViews: false // No auto page tracking in Node
});

const app = express();
app.use(express.json());

// Example 1: Track API requests
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    analytics.track('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  });

  next();
});

// Example 2: User Registration
app.post('/api/register', async (req, res) => {
  const { email, name, plan } = req.body;

  try {
    // Create user in database
    const user = await createUser({ email, name, plan });

    // Identify user in analytics
    await analytics.identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.plan,
      signupDate: user.createdAt,
      platform: 'api'
    });

    // Track signup event
    await analytics.track('User Registered', {
      userId: user.id,
      plan: user.plan,
      source: req.headers.referer
    });

    res.json({ success: true, userId: user.id });
  } catch (error) {
    analytics.track('Registration Failed', {
      email,
      error: error.message
    });

    res.status(500).json({ error: 'Registration failed' });
  }
});

// Example 3: E-commerce Order
app.post('/api/orders', async (req, res) => {
  const { userId, items, total } = req.body;

  try {
    const order = await createOrder({ userId, items, total });

    // Track purchase
    await analytics.track('Order Completed', {
      userId,
      orderId: order.id,
      revenue: order.total,
      currency: 'USD',
      products: order.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod
    });

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    analytics.track('Order Failed', {
      userId,
      error: error.message,
      total
    });

    res.status(500).json({ error: 'Order failed' });
  }
});

// Example 4: Subscription Events
app.post('/api/subscriptions/:id/upgrade', async (req, res) => {
  const { id } = req.params;
  const { newPlan } = req.body;

  try {
    const subscription = await upgradeSubscription(id, newPlan);

    await analytics.track('Subscription Upgraded', {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      oldPlan: subscription.previousPlan,
      newPlan: subscription.plan,
      mrr: subscription.monthlyRecurringRevenue
    });

    // Update user traits
    await analytics.identify(subscription.userId, {
      plan: subscription.plan,
      mrr: subscription.monthlyRecurringRevenue
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example 5: Batch Processing (Background Jobs)
async function processUserEmails() {
  const users = await getActiveUsers();

  for (const user of users) {
    // Track email sent
    analytics.track('Email Sent', {
      userId: user.id,
      emailType: 'weekly-digest',
      timestamp: new Date()
    });
  }

  // Flush all events
  await analytics.flush();
}

// Example 6: Cron Job Tracking
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  analytics.track('Daily Job Started', {
    jobName: 'cleanup',
    timestamp: new Date()
  });

  try {
    await runDailyCleanup();

    analytics.track('Daily Job Completed', {
      jobName: 'cleanup',
      duration: Date.now()
    });
  } catch (error) {
    analytics.track('Daily Job Failed', {
      jobName: 'cleanup',
      error: error.message
    });
  }

  await analytics.flush();
});

// Example 7: Webhook Handler
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'payment_intent.succeeded':
      analytics.track('Payment Succeeded', {
        userId: event.data.object.customer,
        amount: event.data.object.amount / 100,
        currency: event.data.object.currency
      });
      break;

    case 'customer.subscription.created':
      analytics.track('Subscription Created', {
        userId: event.data.object.customer,
        plan: event.data.object.plan.id,
        status: event.data.object.status
      });
      break;

    case 'customer.subscription.deleted':
      analytics.track('Subscription Cancelled', {
        userId: event.data.object.customer,
        plan: event.data.object.plan.id
      });
      break;
  }

  res.json({ received: true });
});

// Example 8: Error Tracking
process.on('uncaughtException', (error) => {
  analytics.track('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date()
  });

  analytics.flush().then(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  analytics.track('Unhandled Rejection', {
    reason: String(reason),
    timestamp: new Date()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, flushing analytics...');

  await analytics.flush();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, flushing analytics...');

  await analytics.flush();
  process.exit(0);
});

// Example 9: Debug & Testing
if (process.env.NODE_ENV === 'development') {
  // View current user
  const user = analytics.user();
  console.log('Current user:', user);

  // Debug info
  analytics.debug();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Track server start
  analytics.track('Server Started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

// Utility functions (mock implementations)
async function createUser(data: any) {
  return { id: 'user-' + Date.now(), ...data, createdAt: new Date() };
}

async function createOrder(data: any) {
  return {
    id: 'order-' + Date.now(),
    ...data,
    shippingMethod: 'standard',
    paymentMethod: 'card'
  };
}

async function upgradeSubscription(id: string, newPlan: string) {
  return {
    id,
    userId: 'user-123',
    plan: newPlan,
    previousPlan: 'basic',
    monthlyRecurringRevenue: 99
  };
}

async function getActiveUsers() {
  return [];
}

async function runDailyCleanup() {
  // Cleanup logic
}

/**
 * Best Practices for Node.js:
 *
 * 1. Create singleton instance
 * 2. Flush on shutdown (SIGTERM, SIGINT)
 * 3. Use higher flush thresholds (server has more resources)
 * 4. Track errors and exceptions
 * 5. Don't await track() unless critical (fire-and-forget)
 * 6. Flush in background jobs
 * 7. Use environment variables for config
 */

/**
 * Environment Variables:
 *
 * ANALYTICS_WRITE_KEY=your-write-key
 * NODE_ENV=production
 */
