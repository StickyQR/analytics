/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Platform detection utility
 * Detects browser, React Native, Node.js environments
 */

export type PlatformType = 'web' | 'react-native' | 'node';

export interface PlatformInfo {
  type: PlatformType;
  isWeb: boolean;
  isReactNative: boolean;
  isNode: boolean;
  hasWindow: boolean;
  hasDocument: boolean;
  hasNavigator: boolean;
}

let cachedPlatform: PlatformInfo | null = null;

export function getPlatform(): PlatformInfo {
  if (cachedPlatform) {
    return cachedPlatform;
  }

  const hasWindow = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';
  const hasNavigator = typeof navigator !== 'undefined';

  // React Native detection
  const isReactNative =
    hasNavigator &&
    (navigator as any).product === 'ReactNative';

  // Web detection
  const isWeb = hasWindow && hasDocument && !isReactNative;

  // Node.js detection
  const isNode = !hasWindow && typeof process !== 'undefined';

  let type: PlatformType = 'node';
  if (isReactNative) {
    type = 'react-native';
  } else if (isWeb) {
    type = 'web';
  }

  cachedPlatform = {
    type,
    isWeb,
    isReactNative,
    isNode,
    hasWindow,
    hasDocument,
    hasNavigator
  };

  return cachedPlatform;
}

export function isWeb(): boolean {
  return getPlatform().isWeb;
}

export function isReactNative(): boolean {
  return getPlatform().isReactNative;
}

export function isNode(): boolean {
  return getPlatform().isNode;
}
