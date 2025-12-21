/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
/**
 * Device Enrichment Plugin
 * Adds comprehensive device, browser, OS, and connection information to all events
 * Supports modern browsers and devices (2024+)
 */
import { Plugin, AnalyticsEvent } from '../types';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable' | 'console';
  manufacturer?: string;
  model?: string;
  vendor?: string;
}

interface BrowserInfo {
  name: string;
  version: string;
  majorVersion: number;
  engine?: string;
  engineVersion?: string;
}

interface OSInfo {
  name: string;
  version: string;
  platform?: string;
  architecture?: string;
}

interface NetworkInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface HardwareInfo {
  cores?: number;
  memory?: number;
  touchPoints?: number;
  devicePixelRatio?: number;
}

export class DeviceEnrichmentPlugin implements Plugin {
  name = 'device-enrichment';
  type = 'enrichment' as const;
  version = '2.0.0';
  private loaded = false;

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    this.loaded = true;
  }

  private enrichEvent<T extends AnalyticsEvent>(event: T): T {
    if (typeof window === 'undefined') return event;

    const ua = navigator.userAgent;

    return {
      ...event,
      context: {
        ...event.context,
        device: this.getDeviceInfo(ua),
        browser: this.getBrowserInfo(ua),
        os: this.getOSInfo(ua),
        network: this.getNetworkInfo(),
        hardware: this.getHardwareInfo()
      }
    };
  }

  private getDeviceInfo(ua: string): DeviceInfo {
    const device: DeviceInfo = {
      type: this.getDeviceType(ua),
      manufacturer: this.getManufacturer(ua),
      model: this.getModel(ua),
      vendor: navigator.vendor || undefined
    };

    return device;
  }

  private getDeviceType(ua: string): DeviceInfo['type'] {
    // Smart TV detection
    if (/(TV|WebTV|SmartTV|GoogleTV|AppleTV|HbbTV)/i.test(ua)) {
      return 'tv';
    }

    // Console detection
    if (/(PlayStation|Xbox|Nintendo)/i.test(ua)) {
      return 'console';
    }

    // Wearable detection
    if (/(Watch|Wear OS|watchOS)/i.test(ua)) {
      return 'wearable';
    }

    // Tablet detection (improved)
    if (/(tablet|ipad|playbook|silk)/i.test(ua)) {
      return 'tablet';
    }

    // Android tablet (no 'mobile' in UA)
    if (/android/i.test(ua) && !/mobile/i.test(ua)) {
      return 'tablet';
    }

    // Mobile detection (comprehensive)
    if (/Mobile|Android|iP(hone|od)|Windows Phone|BlackBerry|webOS|Opera M(obi|ini)/i.test(ua)) {
      return 'mobile';
    }

    return 'desktop';
  }

  private getManufacturer(ua: string): string | undefined {
    const manufacturers = [
      // Apple
      { pattern: /iPhone|iPad|iPod|Macintosh/i, name: 'Apple' },

      // Samsung
      { pattern: /Samsung|SM-[A-Z0-9]+|Galaxy/i, name: 'Samsung' },

      // Google
      { pattern: /Pixel|Nexus/i, name: 'Google' },

      // Chinese brands
      { pattern: /Huawei|Honor/i, name: 'Huawei' },
      { pattern: /Xiaomi|Mi\s|Redmi|POCO/i, name: 'Xiaomi' },
      { pattern: /OPPO/i, name: 'OPPO' },
      { pattern: /vivo|V\d{4}/i, name: 'Vivo' },
      { pattern: /OnePlus/i, name: 'OnePlus' },
      { pattern: /Realme/i, name: 'Realme' },

      // Other Asian brands
      { pattern: /Sony|SO-\d+/i, name: 'Sony' },
      { pattern: /LG|LM-[A-Z0-9]+/i, name: 'LG' },
      { pattern: /Lenovo|Motorola|Moto/i, name: 'Lenovo' },
      { pattern: /ASUS|ZenFone/i, name: 'ASUS' },
      { pattern: /HTC/i, name: 'HTC' },
      { pattern: /Nokia/i, name: 'Nokia' },

      // Western brands
      { pattern: /Microsoft/i, name: 'Microsoft' },
      { pattern: /Dell/i, name: 'Dell' },
      { pattern: /HP|Hewlett-Packard/i, name: 'HP' },

      // Gaming consoles
      { pattern: /PlayStation/i, name: 'Sony PlayStation' },
      { pattern: /Xbox/i, name: 'Microsoft Xbox' },
      { pattern: /Nintendo/i, name: 'Nintendo' }
    ];

    for (const { pattern, name } of manufacturers) {
      if (pattern.test(ua)) {
        return name;
      }
    }

    return undefined;
  }

  private getModel(ua: string): string | undefined {
    // iPhone/iPad models
    if (/iPhone/.test(ua)) {
      const match = ua.match(/iPhone\s?(\d+[,\s]\d+)?/);
      return match ? `iPhone ${match[1] || ''}`.trim() : 'iPhone';
    }

    if (/iPad/.test(ua)) {
      const match = ua.match(/iPad\d+[,\s]\d+/);
      return match ? match[0] : 'iPad';
    }

    // Samsung models
    const samsungMatch = ua.match(/SM-[A-Z0-9]+|Galaxy\s[A-Za-z0-9\s]+/);
    if (samsungMatch) return samsungMatch[0];

    // Google Pixel
    const pixelMatch = ua.match(/Pixel\s?\d+[a-z]?(\sXL)?/i);
    if (pixelMatch) return pixelMatch[0];

    return undefined;
  }

  private getBrowserInfo(ua: string): BrowserInfo {
    let name = 'Unknown';
    let version = '';
    let engine = '';
    let engineVersion = '';

    // Edge (Chromium)
    if (/Edg\//i.test(ua)) {
      name = 'Edge';
      const match = ua.match(/Edg[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
      engine = 'Blink';
    }
    // Opera
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
      name = 'Opera';
      const match = ua.match(/(?:OPR|Opera)[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
      engine = 'Blink';
    }
    // Chrome
    else if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) {
      name = 'Chrome';
      const match = ua.match(/Chrome[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
      engine = 'Blink';

      // Check if it's Chrome on iOS (actually Safari WebKit)
      if (/CriOS/i.test(ua)) {
        name = 'Chrome iOS';
        engine = 'WebKit';
      }
    }
    // Safari
    else if (/Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR/i.test(ua)) {
      name = 'Safari';
      const match = ua.match(/Version[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
      engine = 'WebKit';
    }
    // Firefox
    else if (/Firefox/i.test(ua)) {
      name = 'Firefox';
      const match = ua.match(/Firefox[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
      engine = 'Gecko';
    }
    // Samsung Internet
    else if (/SamsungBrowser/i.test(ua)) {
      name = 'Samsung Internet';
      const match = ua.match(/SamsungBrowser[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
      engine = 'Blink';
    }
    // UC Browser
    else if (/UCBrowser/i.test(ua)) {
      name = 'UC Browser';
      const match = ua.match(/UCBrowser[\/\s](\d+)\.(\d+)/);
      version = match ? `${match[1]}.${match[2]}` : '';
    }
    // Brave (hard to detect, reports as Chrome)
    else if ((navigator as any).brave !== undefined) {
      name = 'Brave';
      engine = 'Blink';
    }
    // IE 11
    else if (/Trident/i.test(ua) && /rv:11/i.test(ua)) {
      name = 'Internet Explorer';
      version = '11';
      engine = 'Trident';
    }
    // Old IE
    else if (/MSIE/i.test(ua)) {
      name = 'Internet Explorer';
      const match = ua.match(/MSIE\s(\d+)/);
      version = match ? match[1] : '';
      engine = 'Trident';
    }

    // Get engine version
    if (engine === 'WebKit') {
      const match = ua.match(/AppleWebKit[\/\s](\d+)/);
      engineVersion = match ? match[1] : '';
    } else if (engine === 'Blink') {
      const match = ua.match(/Chrome[\/\s](\d+)/);
      engineVersion = match ? match[1] : '';
    } else if (engine === 'Gecko') {
      const match = ua.match(/rv:(\d+)/);
      engineVersion = match ? match[1] : '';
    }

    const majorVersion = parseInt(version.split('.')[0], 10) || 0;

    return {
      name,
      version,
      majorVersion,
      engine: engine || undefined,
      engineVersion: engineVersion || undefined
    };
  }

  private getOSInfo(ua: string): OSInfo {
    let name = 'Unknown';
    let version = '';
    let platform = '';
    let architecture = '';

    // iOS
    if (/iPhone|iPad|iPod/i.test(ua)) {
      name = 'iOS';
      const match = ua.match(/OS\s([\d_]+)/);
      version = match ? match[1].replace(/_/g, '.') : '';
      platform = /iPhone/i.test(ua) ? 'iPhone' : /iPad/i.test(ua) ? 'iPad' : 'iPod';
    }
    // Android
    else if (/Android/i.test(ua)) {
      name = 'Android';
      const match = ua.match(/Android\s([\d.]+)/);
      version = match ? match[1] : '';
    }
    // Windows
    else if (/Windows/i.test(ua)) {
      name = 'Windows';

      if (/Windows NT 10/i.test(ua)) {
        version = ua.includes('Windows NT 10.0') ? '10/11' : '10';
      } else if (/Windows NT 6.3/i.test(ua)) {
        version = '8.1';
      } else if (/Windows NT 6.2/i.test(ua)) {
        version = '8';
      } else if (/Windows NT 6.1/i.test(ua)) {
        version = '7';
      } else if (/Windows NT 6.0/i.test(ua)) {
        version = 'Vista';
      }

      platform = /Win64|x64|WOW64/i.test(ua) ? 'x64' : 'x86';
    }
    // macOS
    else if (/Mac OS X/i.test(ua)) {
      name = 'macOS';
      const match = ua.match(/Mac OS X\s([\d_]+)/);
      version = match ? match[1].replace(/_/g, '.') : '';
      platform = 'Mac';
    }
    // Linux
    else if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
      name = 'Linux';

      if (/Ubuntu/i.test(ua)) platform = 'Ubuntu';
      else if (/Debian/i.test(ua)) platform = 'Debian';
      else if (/Fedora/i.test(ua)) platform = 'Fedora';
      else if (/CentOS/i.test(ua)) platform = 'CentOS';

      architecture = /x86_64|x64/i.test(ua) ? 'x64' : /i686|i386/i.test(ua) ? 'x86' : '';
    }
    // Chrome OS
    else if (/CrOS/i.test(ua)) {
      name = 'Chrome OS';
      const match = ua.match(/CrOS\s[\w]+\s([\d.]+)/);
      version = match ? match[1] : '';
    }

    // Try to get architecture from platform API
    if (typeof navigator !== 'undefined' && (navigator as any).userAgentData) {
      const uaData = (navigator as any).userAgentData;
      architecture = uaData.platform || architecture;
    }

    return {
      name,
      version,
      platform: platform || undefined,
      architecture: architecture || undefined
    };
  }

  private getNetworkInfo(): NetworkInfo | undefined {
    if (typeof navigator === 'undefined') return undefined;

    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (!connection) return undefined;

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  private getHardwareInfo(): HardwareInfo {
    const info: HardwareInfo = {
      devicePixelRatio: window.devicePixelRatio
    };

    // CPU cores
    if (navigator.hardwareConcurrency) {
      info.cores = navigator.hardwareConcurrency;
    }

    // Memory (in GB)
    if ((navigator as any).deviceMemory) {
      info.memory = (navigator as any).deviceMemory;
    }

    // Touch support
    if (navigator.maxTouchPoints !== undefined) {
      info.touchPoints = navigator.maxTouchPoints;
    } else if ('ontouchstart' in window) {
      info.touchPoints = 1;
    }

    return info;
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

  async alias(event: any): Promise<any> {
    return this.enrichEvent(event);
  }

  async group(event: any): Promise<any> {
    return this.enrichEvent(event);
  }
}
