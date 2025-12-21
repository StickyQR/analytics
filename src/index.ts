/**
 * Analytics SDK for Browser, React Native & Node.js
 * A Segment.js alternative with identity, track, page, screen tracking
 */

export { Analytics } from './core/analytics';
export { Queue } from './core/queue';
export { Storage } from './utils/storage';
export { uuid, messageId } from './utils/uuid';
export { getDefaultContext } from './utils/context';
export { getPlatform, isWeb, isReactNative, isNode } from './utils/platform';
export type { PlatformType, PlatformInfo } from './utils/platform';

// Plugins
export { ConsoleLoggerPlugin } from './plugins/console-logger';
export { GoogleAnalyticsPlugin } from './plugins/google-analytics';
export { DeviceEnrichmentPlugin } from './plugins/device-enrichment';

// Types
export * from './types';

// Default export for convenience
import { Analytics } from './core/analytics';
export default Analytics;
