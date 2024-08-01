import { ifCond,  } from "@/utils/modules/handlebars/helpers";


describe('ifCond', () => {
  const mockOptions = {
    fn: jest.fn((_value) => 'true'),
    inverse: jest.fn((_value) => 'false'),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should return true when arg1 is not equal to any value in arg2', () => {
    ifCond('apple', '==', 'apple', mockOptions);
    expect(mockOptions.fn).toHaveBeenCalled();
    expect(mockOptions.inverse).not.toHaveBeenCalled();
  });
  test('should return true when arg1 is not equal to any value in arg2', () => {
    ifCond('apple', '==', 'orange', mockOptions);
    expect(mockOptions.fn).not.toHaveBeenCalled();
    expect(mockOptions.inverse).toHaveBeenCalled();
  });

  test('should return true when arg1 is not equal to any value in arg2', () => {
    ifCond('apple', '!=', 'apple', mockOptions);
    expect(mockOptions.fn).not.toHaveBeenCalled();
    expect(mockOptions.inverse).toHaveBeenCalled();
  });
  test('should return true when arg1 is not equal to any value in arg2', () => {
    ifCond('apple', '!==', 'apple', mockOptions);
    expect(mockOptions.fn).not.toHaveBeenCalled();
    expect(mockOptions.inverse).toHaveBeenCalled();
  });
});
