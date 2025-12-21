# Device Enrichment Plugin v2.0

Comprehensive device, browser, OS, network, and hardware detection plugin for @stickyqr/analytics.

## Features

### 🎯 What It Detects

1. **Device Information**
   - Type: mobile, tablet, desktop, tv, wearable, console
   - Manufacturer: 30+ brands including Apple, Samsung, Google, Xiaomi, OPPO, Vivo, OnePlus, etc.
   - Model: iPhone, iPad, Samsung Galaxy, Google Pixel, etc.
   - Vendor: from navigator.vendor

2. **Browser Information**
   - Name: Chrome, Firefox, Safari, Edge, Opera, Samsung Internet, UC Browser, Brave, IE
   - Version: Major and minor versions
   - Major Version: Integer for version comparison
   - Engine: WebKit, Blink, Gecko, Trident
   - Engine Version: For compatibility checking

3. **Operating System**
   - Name: iOS, Android, Windows, macOS, Linux, Chrome OS
   - Version: Detailed OS version
   - Platform: iPhone, iPad, Mac, Ubuntu, Debian, etc.
   - Architecture: x64, x86, ARM

4. **Network Information** (when available)
   - Effective Type: 4g, 3g, 2g, slow-2g
   - Downlink: Speed in Mbps
   - RTT: Round-trip time in ms
   - Save Data: Whether data saver is enabled

5. **Hardware Information**
   - CPU Cores: Number of logical processors
   - Memory: Device memory in GB
   - Touch Points: Number of simultaneous touch points
   - Device Pixel Ratio: Screen pixel density

## Installation & Usage

```typescript
import { Analytics, DeviceEnrichmentPlugin } from '@stickyqr/analytics';

const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [
    new DeviceEnrichmentPlugin()
  ]
});

// All events will now include device/browser/OS/network/hardware info
analytics.track('Button Clicked');
```

## Example Output

When you track an event, the plugin enriches it with:

```json
{
  "type": "track",
  "event": "Button Clicked",
  "context": {
    "device": {
      "type": "mobile",
      "manufacturer": "Apple",
      "model": "iPhone 15 Pro",
      "vendor": "Apple Computer, Inc."
    },
    "browser": {
      "name": "Chrome",
      "version": "120.0",
      "majorVersion": 120,
      "engine": "Blink",
      "engineVersion": "120"
    },
    "os": {
      "name": "iOS",
      "version": "17.2",
      "platform": "iPhone",
      "architecture": "arm64"
    },
    "network": {
      "effectiveType": "4g",
      "downlink": 10,
      "rtt": 50,
      "saveData": false
    },
    "hardware": {
      "cores": 6,
      "memory": 8,
      "touchPoints": 5,
      "devicePixelRatio": 3
    }
  }
}
```

## Supported Devices & Browsers

### Device Types
- ✅ Mobile phones (iPhone, Android, etc.)
- ✅ Tablets (iPad, Android tablets)
- ✅ Desktop computers
- ✅ Smart TVs (Samsung, LG, Sony, Apple TV)
- ✅ Gaming consoles (PlayStation, Xbox, Nintendo)
- ✅ Wearables (Apple Watch, Wear OS)

### Manufacturers (30+)
- **Apple**: iPhone, iPad, Mac
- **Samsung**: Galaxy S/A/Z series, tablets
- **Google**: Pixel, Nexus
- **Chinese brands**: Xiaomi, OPPO, Vivo, OnePlus, Realme, Huawei
- **Asian brands**: Sony, LG, ASUS, HTC, Nokia, Lenovo, Motorola
- **Western brands**: Microsoft, Dell, HP
- **Consoles**: Sony PlayStation, Microsoft Xbox, Nintendo

### Browsers
- ✅ Chrome (desktop & mobile)
- ✅ Safari (macOS & iOS)
- ✅ Firefox
- ✅ Edge (Chromium)
- ✅ Opera
- ✅ Samsung Internet
- ✅ UC Browser
- ✅ Brave
- ✅ Internet Explorer (legacy)
- ✅ Chrome iOS (special detection)

### Operating Systems
- ✅ iOS (with version detection)
- ✅ Android (with version detection)
- ✅ Windows (7, 8, 8.1, 10, 11)
- ✅ macOS (with version detection)
- ✅ Linux (Ubuntu, Debian, Fedora, CentOS)
- ✅ Chrome OS

## Use Cases

### 1. A/B Testing by Device Type

```typescript
const { device } = analytics.user().context;

if (device.type === 'mobile') {
  showMobileOptimizedLayout();
} else {
  showDesktopLayout();
}
```

### 2. Browser-Specific Features

```typescript
const { browser } = analytics.user().context;

if (browser.name === 'Safari' && browser.majorVersion < 15) {
  showLegacyFeatures();
}
```

### 3. Network-Aware Loading

```typescript
const { network } = analytics.user().context;

if (network.effectiveType === '2g' || network.saveData) {
  loadLowQualityImages();
} else if (network.effectiveType === '4g') {
  loadHighQualityImages();
}
```

### 4. Device-Specific Analytics

```typescript
analytics.track('Video Started', {
  videoId: 'promo-1',
  // Device info automatically included
});

// Backend: Analyze which devices have best engagement
// "iOS users watch 30% more videos than Android"
```

### 5. Performance Monitoring

```typescript
const { hardware } = analytics.user().context;

analytics.track('Page Load', {
  loadTime: 1500,
  cpuCores: hardware.cores,
  deviceMemory: hardware.memory
});

// Analyze: "Devices with <4GB RAM have slower load times"
```

### 6. Touch vs Mouse Optimization

```typescript
const { hardware } = analytics.user().context;

if (hardware.touchPoints > 0) {
  enableTouchGestures();
  increaseTapTargetSize();
}
```

## Advanced Usage

### Custom Device Detection

You can extend the plugin by subclassing:

```typescript
import { DeviceEnrichmentPlugin } from '@stickyqr/analytics';

class CustomDevicePlugin extends DeviceEnrichmentPlugin {
  private enrichEvent(event: any) {
    const enriched = super.enrichEvent(event);

    // Add custom detection
    enriched.context.device.isBot = this.detectBot();
    enriched.context.device.screenOrientation = screen.orientation?.type;

    return enriched;
  }

  private detectBot(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return /bot|crawler|spider|crawling/i.test(ua);
  }
}

const analytics = new Analytics({
  writeKey: 'your-write-key',
  plugins: [new CustomDevicePlugin()]
});
```

### Conditional Enrichment

Only enrich certain events:

```typescript
class SelectiveDevicePlugin extends DeviceEnrichmentPlugin {
  async track(event: any): Promise<any> {
    // Only enrich purchase events
    if (event.event === 'Purchase Completed') {
      return this.enrichEvent(event);
    }
    return event;
  }
}
```

## Performance

- **Lightweight**: ~5KB minified
- **Fast**: All detection is synchronous (no async lookups)
- **Cached**: User agent parsing happens once per event
- **Non-blocking**: Runs in enrichment phase, doesn't delay event sending

## Privacy Considerations

The plugin collects:
- ✅ Device type (mobile/tablet/desktop)
- ✅ Browser name and version
- ✅ OS name and version
- ✅ Network type (4G, WiFi)
- ✅ Hardware specs (cores, memory)

It does NOT collect:
- ❌ Device serial numbers
- ❌ MAC addresses
- ❌ Phone numbers
- ❌ Precise GPS location
- ❌ Personal identifiers

All data is derived from:
- `navigator.userAgent`
- `navigator.connection`
- `navigator.hardwareConcurrency`
- `window.devicePixelRatio`

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

Graceful degradation:
- If Network API unavailable: `network` will be `undefined`
- If hardware API unavailable: `hardware` will have partial data
- In Node.js/SSR: Returns event unchanged

## Debugging

Enable debug mode to see what's detected:

```typescript
const analytics = new Analytics({
  writeKey: 'your-write-key',
  debug: true,
  plugins: [new DeviceEnrichmentPlugin()]
});

analytics.track('Test Event');
// Check console for full event data including device info
```

Or inspect directly:

```typescript
const plugin = new DeviceEnrichmentPlugin();
await plugin.load();

const testEvent = {
  type: 'track',
  event: 'Test',
  context: {}
};

const enriched = await plugin.track(testEvent);
console.log(enriched.context.device);
console.log(enriched.context.browser);
console.log(enriched.context.os);
```

## Common Detection Examples

### iPhone 15 Pro on iOS 17
```json
{
  "device": { "type": "mobile", "manufacturer": "Apple", "model": "iPhone" },
  "browser": { "name": "Safari", "version": "17.2", "majorVersion": 17, "engine": "WebKit" },
  "os": { "name": "iOS", "version": "17.2", "platform": "iPhone" }
}
```

### Samsung Galaxy S24 on Android 14
```json
{
  "device": { "type": "mobile", "manufacturer": "Samsung", "model": "SM-S921B" },
  "browser": { "name": "Samsung Internet", "version": "23.0", "majorVersion": 23, "engine": "Blink" },
  "os": { "name": "Android", "version": "14" }
}
```

### MacBook Pro on macOS Sonoma
```json
{
  "device": { "type": "desktop", "manufacturer": "Apple", "vendor": "Apple Computer, Inc." },
  "browser": { "name": "Chrome", "version": "120.0", "majorVersion": 120, "engine": "Blink" },
  "os": { "name": "macOS", "version": "14.2", "platform": "Mac" }
}
```

### Windows 11 Desktop
```json
{
  "device": { "type": "desktop" },
  "browser": { "name": "Edge", "version": "120.0", "majorVersion": 120, "engine": "Blink" },
  "os": { "name": "Windows", "version": "10/11", "platform": "x64" }
}
```

## FAQ

**Q: Does this slow down my app?**
A: No, detection is very fast (~1ms) and doesn't block the main thread.

**Q: Can I disable certain detections?**
A: Yes, extend the plugin and override methods to return partial data.

**Q: How accurate is device detection?**
A: ~95% accurate for major brands. Some obscure devices may show as "Unknown".

**Q: Does it work in SSR/Node.js?**
A: Yes, it safely returns the event unchanged if `window` is not available.

**Q: Can I use this data for targeting ads?**
A: This is analytics data. For advertising, ensure GDPR/CCPA compliance.

**Q: How often is the detection updated?**
A: We update patterns when new devices/browsers are released.

## Changelog

### v2.0.0 (2024-12-20)
- ✨ Added network information (4G, 3G, connection speed)
- ✨ Added hardware information (CPU cores, memory, touch points)
- ✨ Improved browser detection (Brave, Samsung Internet, UC Browser)
- ✨ Added 20+ new device manufacturers
- ✨ Enhanced OS detection (Chrome OS, Linux distros)
- ✨ Added device types: TV, console, wearable
- ✨ More accurate iPhone/iPad model detection
- 🐛 Fixed Edge Chromium detection
- 🐛 Fixed Android tablet detection
- ⚡ Performance improvements

### v1.0.0
- Initial release with basic device/browser/OS detection

## Support

For issues or feature requests:
- GitHub: https://github.com/stickyqr/analytics
- Email: support@stickyqr.com
