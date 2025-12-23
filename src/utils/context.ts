 
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generate default context for events
 * Supports Web and React Native environments
 */
import { AnalyticsContext } from '../types';
import { isWeb, isReactNative } from './platform';

export function getDefaultContext(): AnalyticsContext {
  const context: AnalyticsContext = {
    library: {
      name: '@stickyqr/analytics',
      version: '1.0.0'
    }
  };

  // Web environment
  if (isWeb()) {
    context.userAgent = navigator.userAgent;
    context.locale = navigator.language;
    context.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Page context
    if (typeof document !== 'undefined') {
      context.page = {
        path: window.location.pathname,
        referrer: document.referrer,
        search: window.location.search,
        title: document.title,
        url: window.location.href
      };
    }

    // Screen context
    if (window.screen) {
      context.screen = {
        width: window.screen.width,
        height: window.screen.height,
        density: window.devicePixelRatio || 1
      };
    }

    // Campaign tracking (UTM parameters)
    if (window.location) {
      const searchParams = new URLSearchParams(window.location.search);
      const campaignParams = {
        name: searchParams.get('utm_campaign'),
        source: searchParams.get('utm_source'),
        medium: searchParams.get('utm_medium'),
        term: searchParams.get('utm_term'),
        content: searchParams.get('utm_content')
      };

      if (Object.values(campaignParams).some(v => v !== null)) {
        context.campaign = campaignParams as any;
      }
    }
  }

  // React Native environment
  if (isReactNative()) {
    context.userAgent = navigator.userAgent;
    context.locale = navigator.language || 'en-US';

    // Try to get screen dimensions from React Native
    try {
      // Dimensions API available in React Native
      const Dimensions = require('react-native').Dimensions;
      const window = Dimensions.get('window');
      const screen = Dimensions.get('screen');

      context.screen = {
        width: screen.width,
        height: screen.height,
        density: screen.scale || 1
      };

      // App context (instead of page for RN)
      context.app = {
        width: window.width,
        height: window.height
      };
    } catch (e) {
      // Dimensions not available
    }

    // Get app info if available
    try {
      const Constants = require('expo-constants').default;
      if (Constants) {
        context.app = {
          ...context.app,
          name: Constants.expoConfig?.name,
          version: Constants.expoConfig?.version,
          build: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode,
          namespace: Constants.expoConfig?.ios?.bundleIdentifier || Constants.expoConfig?.android?.package
        };
      }
    } catch (e) {
      // Expo Constants not available
    }

    // Get device info if available
    try {
      const Device = require('expo-device');
      if (Device) {
        context.device = {
          ...context.device,
          manufacturer: Device.manufacturer,
          modelName: Device.modelName,
          modelId: Device.modelId,
          osName: Device.osName,
          osVersion: Device.osVersion,
          platformApiLevel: Device.platformApiLevel
        };
      }
    } catch (e) {
      // expo-device not available
    }
  }

  return context;
}
