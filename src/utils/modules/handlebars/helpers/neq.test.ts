import { neq } from "@/utils/modules/handlebars/helpers";

describe('neq', () => {
    const mockOptions = {
      fn: jest.fn((_value) => 'true'),
      inverse: jest.fn((_value) => 'false'),
    };
  
    beforeEach(() => {
      jest.resetAllMocks();
    });
  
    test('should return true when arg1 is not equal to any value in arg2', () => {
      neq('apple', 'banana,orange', mockOptions);
      expect(mockOptions.fn).toHaveBeenCalled();
      expect(mockOptions.inverse).not.toHaveBeenCalled();
    });
  
    test('should return false when arg1 is equal to any value in arg2', () => {
      neq('banana', 'banana,orange', mockOptions);
      expect(mockOptions.fn).not.toHaveBeenCalled();
      expect(mockOptions.inverse).toHaveBeenCalled();
    });
    test('should return false when arg1 is an empty string and arg2 contains an empty string', () => {
        neq('', 'banana,orange,', mockOptions);
        expect(mockOptions.fn).not.toHaveBeenCalled();
        expect(mockOptions.inverse).toHaveBeenCalled();
      });
});