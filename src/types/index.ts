/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Core types for Analytics SDK
 */

export interface JsonMap {
  [key: string]: any;
}

export interface AnalyticsContext {
  page?: PageContext;
  screen?: ScreenContext;
  userAgent?: string;
  locale?: string;
  library?: LibraryContext;
  timezone?: string;
  campaign?: CampaignContext;
  [key: string]: any;
}

export interface PageContext {
  path?: string;
  referrer?: string;
  search?: string;
  title?: string;
  url?: string;
  [key: string]: any;
}

export interface ScreenContext {
  width?: number;
  height?: number;
  density?: number;
  [key: string]: any;
}

export interface LibraryContext {
  name: string;
  version: string;
}

export interface CampaignContext {
  name?: string;
  source?: string;
  medium?: string;
  term?: string;
  content?: string;
  [key: string]: any;
}

export interface UserTraits extends JsonMap {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  [key: string]: any;
}

export interface EventProperties extends JsonMap {
  revenue?: number;
  currency?: string;
  value?: number;
  [key: string]: any;
}

export interface EventOptions {
  timestamp?: Date | string;
  context?: Partial<AnalyticsContext>;
  integrations?: {
    [key: string]: boolean | JsonMap;
  };
  anonymousId?: string;
  userId?: string;
}

export interface IdentifyEvent {
  type: 'identify';
  userId?: string;
  anonymousId?: string;
  traits?: UserTraits;
  context?: AnalyticsContext;
  timestamp: string;
  messageId: string;
}

export interface TrackEvent {
  type: 'track';
  event: string;
  properties?: EventProperties;
  userId?: string;
  anonymousId?: string;
  context?: AnalyticsContext;
  timestamp: string;
  messageId: string;
}

export interface PageEvent {
  type: 'page';
  name?: string;
  category?: string;
  properties?: EventProperties;
  userId?: string;
  anonymousId?: string;
  context?: AnalyticsContext;
  timestamp: string;
  messageId: string;
}

export interface ScreenEvent {
  type: 'screen';
  name?: string;
  category?: string;
  properties?: EventProperties;
  userId?: string;
  anonymousId?: string;
  context?: AnalyticsContext;
  timestamp: string;
  messageId: string;
}

export interface AliasEvent {
  type: 'alias';
  userId: string;
  previousId: string;
  context?: AnalyticsContext;
  timestamp: string;
  messageId: string;
}

export interface GroupEvent {
  type: 'group';
  groupId: string;
  traits?: JsonMap;
  userId?: string;
  anonymousId?: string;
  context?: AnalyticsContext;
  timestamp: string;
  messageId: string;
}

export type AnalyticsEvent =
  | IdentifyEvent
  | TrackEvent
  | PageEvent
  | ScreenEvent
  | AliasEvent
  | GroupEvent;

export interface Plugin {
  name: string;
  type: 'before' | 'enrichment' | 'destination' | 'after';
  version?: string;
  isLoaded(): boolean;
  load(analytics: any): Promise<void>;
  identify?(event: IdentifyEvent): Promise<IdentifyEvent | null>;
  track?(event: TrackEvent): Promise<TrackEvent | null>;
  page?(event: PageEvent): Promise<PageEvent | null>;
  screen?(event: ScreenEvent): Promise<ScreenEvent | null>;
  alias?(event: AliasEvent): Promise<AliasEvent | null>;
  group?(event: GroupEvent): Promise<GroupEvent | null>;
}

export interface AnalyticsConfig {
  writeKey: string;
  apiHost?: string;
  flushAt?: number;
  flushInterval?: number;
  maxQueueSize?: number;
  retryAttempts?: number;
  debug?: boolean;
  trackPageViews?: boolean;
  anonymousIdKey?: string;
  userIdKey?: string;
  plugins?: Plugin[];
  integrations?: {
    [key: string]: boolean | JsonMap;
  };
}

export interface QueueItem {
  event: AnalyticsEvent;
  attempts: number;
  timestamp: number;
}
