import { generateUniqueNameId } from "./generateUniqueNameId";

describe('generateUniqueNameId', () => {
    it('should generate a unique ID with no prefix and no suffix', () => {
      const id1 = generateUniqueNameId();
      const id2 = generateUniqueNameId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
    });
  
    it('should generate a unique ID with a prefix only', () => {
      const prefix = 'prefix-';
      const id1 = generateUniqueNameId(prefix);
      const id2 = generateUniqueNameId(prefix);
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1.startsWith(prefix)).toBe(true);
      expect(id2.startsWith(prefix)).toBe(true);
    });
  
    it('should generate a unique ID with a suffix only', () => {
      const suffix = '-suffix';
      const id1 = generateUniqueNameId('', suffix);
      const id2 = generateUniqueNameId('', suffix);
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1.endsWith(suffix)).toBe(true);
      expect(id2.endsWith(suffix)).toBe(true);
    });
  
    it('should generate a unique ID with both prefix and suffix', () => {
      const prefix = 'prefix-';
      const suffix = '-suffix';
      const id1 = generateUniqueNameId(prefix, suffix);
      const id2 = generateUniqueNameId(prefix, suffix);
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1.startsWith(prefix)).toBe(true);
      expect(id2.startsWith(prefix)).toBe(true);
      expect(id1.endsWith(suffix)).toBe(true);
      expect(id2.endsWith(suffix)).toBe(true);
    });
  
    it('should generate unique IDs for multiple calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueNameId());
      }
      expect(ids.size).toEqual(100);
    });
  });