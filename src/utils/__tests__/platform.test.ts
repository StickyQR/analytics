import { getPlatform, isWeb, isReactNative, isNode } from '../platform';

describe('platform', () => {
  // Store original globals
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalNavigator = global.navigator;
  const originalProcess = global.process;

  afterEach(() => {
    // Restore globals after each test
    if (originalWindow !== undefined) {
      (global as any).window = originalWindow;
    }
    if (originalDocument !== undefined) {
      (global as any).document = originalDocument;
    }
    if (originalNavigator !== undefined) {
      (global as any).navigator = originalNavigator;
    }
    if (originalProcess !== undefined) {
      global.process = originalProcess;
    }
  });

  describe('getPlatform() in Node.js environment', () => {
    it('should detect Node.js environment', () => {
      // In Jest/Node.js, we don't have window/document
      const platform = getPlatform();
      
      expect(platform).toHaveProperty('type');
      expect(platform).toHaveProperty('isWeb');
      expect(platform).toHaveProperty('isReactNative');
      expect(platform).toHaveProperty('isNode');
      expect(platform).toHaveProperty('hasWindow');
      expect(platform).toHaveProperty('hasDocument');
      expect(platform).toHaveProperty('hasNavigator');
    });

    it('should cache platform detection result', () => {
      const platform1 = getPlatform();
      const platform2 = getPlatform();
      
      expect(platform1).toBe(platform2);
    });
  });

  describe('isNode()', () => {
    it('should return boolean', () => {
      expect(typeof isNode()).toBe('boolean');
    });
  });

  describe('isWeb()', () => {
    it('should return boolean', () => {
      expect(typeof isWeb()).toBe('boolean');
    });
  });

  describe('isReactNative()', () => {
    it('should return boolean', () => {
      expect(typeof isReactNative()).toBe('boolean');
    });
  });

  describe('PlatformInfo structure', () => {
    it('should have correct property types', () => {
      const platform = getPlatform();
      
      expect(['web', 'react-native', 'node']).toContain(platform.type);
      expect(typeof platform.isWeb).toBe('boolean');
      expect(typeof platform.isReactNative).toBe('boolean');
      expect(typeof platform.isNode).toBe('boolean');
      expect(typeof platform.hasWindow).toBe('boolean');
      expect(typeof platform.hasDocument).toBe('boolean');
      expect(typeof platform.hasNavigator).toBe('boolean');
    });
  });
});

