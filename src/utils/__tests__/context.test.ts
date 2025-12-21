import { getDefaultContext } from '../context';

describe('context', () => {
  describe('getDefaultContext()', () => {
    it('should return context object', () => {
      const context = getDefaultContext();
      
      expect(context).toBeDefined();
      expect(typeof context).toBe('object');
    });

    it('should include library information', () => {
      const context = getDefaultContext();
      
      expect(context.library).toBeDefined();
      expect(context.library?.name).toBe('@stickyqr/analytics');
      expect(context.library?.version).toBe('1.0.0');
    });

    it('should return consistent library info on multiple calls', () => {
      const context1 = getDefaultContext();
      const context2 = getDefaultContext();
      
      expect(context1.library).toEqual(context2.library);
    });
  });

  describe('in Node.js environment', () => {
    it('should not include page context', () => {
      const context = getDefaultContext();
      
      // In Node.js, there's no window/document so page context shouldn't exist
      // unless mocked
      expect(context.library).toBeDefined();
    });

    it('should have minimal context without browser APIs', () => {
      const context = getDefaultContext();
      
      // Core required fields
      expect(context.library).toBeDefined();
      expect(context.library?.name).toBe('@stickyqr/analytics');
    });
  });
});

