import { Storage } from '../storage';

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    // Create new storage instance for each test
    storage = new Storage();
  });

  describe('in Node.js environment (Memory storage)', () => {
    describe('setSync() and getSync()', () => {
      it('should store and retrieve string values', () => {
        storage.setSync('key1', 'value1');
        expect(storage.getSync('key1')).toBe('value1');
      });

      it('should store and retrieve object values', () => {
        const obj = { name: 'John', age: 30 };
        storage.setSync('user', obj);
        expect(storage.getSync('user')).toEqual(obj);
      });

      it('should store and retrieve array values', () => {
        const arr = [1, 2, 3, 'test'];
        storage.setSync('array', arr);
        expect(storage.getSync('array')).toEqual(arr);
      });

      it('should store and retrieve number values', () => {
        storage.setSync('count', 42);
        expect(storage.getSync('count')).toBe(42);
      });

      it('should store and retrieve boolean values', () => {
        storage.setSync('flag', true);
        expect(storage.getSync('flag')).toBe(true);
      });

      it('should return null for non-existent keys', () => {
        expect(storage.getSync('nonexistent')).toBeNull();
      });

      it('should overwrite existing values', () => {
        storage.setSync('key', 'value1');
        storage.setSync('key', 'value2');
        expect(storage.getSync('key')).toBe('value2');
      });
    });

    describe('set() and get() async methods', () => {
      it('should store and retrieve values asynchronously', async () => {
        await storage.set('asyncKey', 'asyncValue');
        const value = await storage.get('asyncKey');
        expect(value).toBe('asyncValue');
      });

      it('should store and retrieve objects asynchronously', async () => {
        const obj = { foo: 'bar', baz: 123 };
        await storage.set('asyncObj', obj);
        const value = await storage.get('asyncObj');
        expect(value).toEqual(obj);
      });

      it('should return null for non-existent async keys', async () => {
        const value = await storage.get('nonexistent');
        expect(value).toBeNull();
      });
    });

    describe('removeSync()', () => {
      it('should remove stored values', () => {
        storage.setSync('toRemove', 'value');
        expect(storage.getSync('toRemove')).toBe('value');
        
        storage.removeSync('toRemove');
        expect(storage.getSync('toRemove')).toBeNull();
      });

      it('should not throw when removing non-existent key', () => {
        expect(() => storage.removeSync('nonexistent')).not.toThrow();
      });
    });

    describe('remove() async', () => {
      it('should remove values asynchronously', async () => {
        await storage.set('asyncRemove', 'value');
        expect(await storage.get('asyncRemove')).toBe('value');
        
        await storage.remove('asyncRemove');
        expect(await storage.get('asyncRemove')).toBeNull();
      });
    });

    describe('complex data types', () => {
      it('should handle nested objects', () => {
        const nested = {
          level1: {
            level2: {
              level3: 'deep'
            }
          }
        };
        storage.setSync('nested', nested);
        expect(storage.getSync('nested')).toEqual(nested);
      });

      it('should handle null values in objects', () => {
        const obj = { a: null, b: 'value' };
        storage.setSync('withNull', obj);
        expect(storage.getSync('withNull')).toEqual(obj);
      });

      it('should handle empty objects', () => {
        storage.setSync('empty', {});
        expect(storage.getSync('empty')).toEqual({});
      });

      it('should handle empty arrays', () => {
        storage.setSync('emptyArray', []);
        expect(storage.getSync('emptyArray')).toEqual([]);
      });
    });
  });
});

