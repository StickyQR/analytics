/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-rest-params */
/**
 * Google Analytics 4 Plugin
 * Sends events to GA4 using gtag.js
 */
import { Plugin, TrackEvent, PageEvent, IdentifyEvent } from '../types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface GoogleAnalyticsConfig {
  measurementId: string;
}

export class GoogleAnalyticsPlugin implements Plugin {
  name = 'google-analytics';
  type = 'destination' as const;
  version = '1.0.0';
  private loaded = false;
  private config: GoogleAnalyticsConfig;

  constructor(config: GoogleAnalyticsConfig) {
    this.config = config;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer!.push(...arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.config.measurementId);

    this.loaded = true;
  }

  async identify(event: IdentifyEvent): Promise<IdentifyEvent> {
    if (window.gtag && event.userId) {
      window.gtag('set', 'user_properties', {
        user_id: event.userId,
        ...event.traits
      });
    }
    return event;
  }

  async track(event: TrackEvent): Promise<TrackEvent> {
    if (window.gtag) {
      window.gtag('event', event.event, {
        ...event.properties,
        user_id: event.userId
      });
    }
    return event;
  }

  async page(event: PageEvent): Promise<PageEvent> {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: event.name || event.context?.page?.title,
        page_location: event.context?.page?.url,
        page_path: event.context?.page?.path,
        ...event.properties
      });
    }
    return event;
  }
}
