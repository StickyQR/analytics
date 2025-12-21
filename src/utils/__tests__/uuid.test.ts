import { uuid, messageId } from '../uuid';

describe('uuid', () => {
  describe('uuid()', () => {
    it('should generate a valid UUID v4 format', () => {
      const id = uuid();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        uuids.add(uuid());
      }
      expect(uuids.size).toBe(1000);
    });

    it('should have version 4 in the correct position', () => {
      const id = uuid();
      // Position 14 should be '4'
      expect(id[14]).toBe('4');
    });

    it('should have correct variant bits', () => {
      const id = uuid();
      // Position 19 should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(id[19].toLowerCase());
    });
  });

  describe('messageId()', () => {
    it('should generate a message ID with correct prefix', () => {
      const id = messageId();
      expect(id).toMatch(/^analytics-\d+-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should include a timestamp', () => {
      const before = Date.now();
      const id = messageId();
      const after = Date.now();

      const timestampMatch = id.match(/^analytics-(\d+)-/);
      expect(timestampMatch).not.toBeNull();
      
      const timestamp = parseInt(timestampMatch![1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should generate unique message IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(messageId());
      }
      expect(ids.size).toBe(100);
    });
  });
});

