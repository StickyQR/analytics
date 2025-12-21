/**
 * Vanilla JavaScript Example
 * Pure JS without any framework
 */

// Import from UMD build (for browser)
// <script src="https://cdn.stickyqr.com/analytics/1.0.0/index.umd.js"></script>

// Initialize Analytics
const analytics = new StickyQRAnalytics.Analytics({
  writeKey: 'your-write-key',
  debug: true,
  trackPageViews: true,
  plugins: [
    new StickyQRAnalytics.ConsoleLoggerPlugin(),
    new StickyQRAnalytics.DeviceEnrichmentPlugin()
  ]
});

// Example 1: Track Button Clicks
document.getElementById('signup-button')?.addEventListener('click', () => {
  analytics.track('CTA Clicked', {
    buttonId: 'signup-button',
    page: window.location.pathname,
    text: 'Sign Up Now'
  });
});

// Example 2: Track Form Submissions
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  analytics.track('Form Submitted', {
    formId: 'contact-form',
    formName: 'Contact Us',
    ...data
  });
});

// Example 3: Track Video Play
document.getElementById('promo-video')?.addEventListener('play', (e) => {
  analytics.track('Video Started', {
    videoId: 'promo-video',
    videoTitle: 'Product Demo',
    duration: e.target.duration
  });
});

// Example 4: Identify User after Login
function onLoginSuccess(userData) {
  analytics.identify(userData.id, {
    email: userData.email,
    name: userData.name,
    plan: userData.plan,
    signupDate: userData.signupDate
  });

  analytics.track('User Logged In', {
    method: 'email'
  });
}

// Example 5: E-commerce Tracking
function trackProductView(product) {
  analytics.track('Product Viewed', {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: product.price,
    currency: 'USD'
  });
}

function trackAddToCart(product, quantity) {
  analytics.track('Product Added', {
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity,
    currency: 'USD'
  });
}

function trackPurchase(order) {
  analytics.track('Order Completed', {
    orderId: order.id,
    revenue: order.total,
    currency: 'USD',
    tax: order.tax,
    shipping: order.shipping,
    products: order.items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
}

// Example 6: Track Scroll Depth
let maxScroll = 0;
let scrollTracked = {
  '25': false,
  '50': false,
  '75': false,
  '100': false
};

window.addEventListener('scroll', () => {
  const scrollPercentage = Math.round(
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  );

  if (scrollPercentage > maxScroll) {
    maxScroll = scrollPercentage;
  }

  // Track milestones
  ['25', '50', '75', '100'].forEach(milestone => {
    const threshold = parseInt(milestone);
    if (scrollPercentage >= threshold && !scrollTracked[milestone]) {
      scrollTracked[milestone] = true;
      analytics.track('Page Scrolled', {
        percentage: threshold,
        page: window.location.pathname
      });
    }
  });
});

// Example 7: Track Time on Page
let pageStartTime = Date.now();

window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);

  analytics.track('Time on Page', {
    duration: timeOnPage,
    page: window.location.pathname
  });

  // Flush queue before leaving
  analytics.flush();
});

// Example 8: Track Outbound Links
document.querySelectorAll('a[href^="http"]').forEach(link => {
  if (!link.href.includes(window.location.hostname)) {
    link.addEventListener('click', (e) => {
      analytics.track('Outbound Link Clicked', {
        url: link.href,
        text: link.textContent,
        page: window.location.pathname
      });
    });
  }
});

// Example 9: Track Search
document.getElementById('search-input')?.addEventListener('input',
  debounce((e) => {
    const query = e.target.value;
    if (query.length >= 3) {
      analytics.track('Search Performed', {
        query,
        resultsCount: document.querySelectorAll('.search-result').length
      });
    }
  }, 500)
);

// Example 10: User Logout
function onLogout() {
  analytics.track('User Logged Out');
  analytics.reset();
}

// Helper: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// SPA Navigation Tracking (for frameworks like React Router, Vue Router)
function trackPageChange(newUrl) {
  analytics.page(document.title, undefined, {
    url: newUrl,
    path: new URL(newUrl).pathname
  });
}

// Example for History API
if (window.history.pushState) {
  const originalPushState = window.history.pushState;
  window.history.pushState = function(...args) {
    originalPushState.apply(this, args);
    trackPageChange(window.location.href);
  };
}

// Debug: View current user
console.log('Current User:', analytics.user());

// Debug: View analytics config
analytics.debug();
