/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Console Logger Plugin - Logs all events to console (useful for debugging)
 */
import { Plugin, AnalyticsEvent } from '../types';

export class ConsoleLoggerPlugin implements Plugin {
  name = 'console-logger';
  type = 'after' as const;
  version = '1.0.0';
  private loaded = false;

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    this.loaded = true;
  }

  private logEvent(event: AnalyticsEvent): AnalyticsEvent {
    console.group(`[Analytics Event] ${event.type}`);
    console.log('Event:', event);
    console.groupEnd();
    return event;
  }

  async identify(event: any): Promise<any> {
    return this.logEvent(event);
  }

  async track(event: any): Promise<any> {
    return this.logEvent(event);
  }

  async page(event: any): Promise<any> {
    return this.logEvent(event);
  }

  async screen(event: any): Promise<any> {
    return this.logEvent(event);
  }

  async alias(event: any): Promise<any> {
    return this.logEvent(event);
  }

  async group(event: any): Promise<any> {
    return this.logEvent(event);
  }
}
