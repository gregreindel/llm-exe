import { eq } from "@/utils/modules/handlebars/helpers";

describe("eq", () => {
  const mockOptions = {
    fn: jest.fn((_value) => "true"),
    inverse: jest.fn((_value) => "false"),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should return true when arg1 is not equal to any value in arg2", () => {
    eq("apple", "banana,orange", mockOptions);
    expect(mockOptions.fn).not.toHaveBeenCalled();
    expect(mockOptions.inverse).toHaveBeenCalled();
  });

  test("should return false when arg1 is equal to any value in arg2", () => {
    eq("banana", "banana,orange", mockOptions);
    expect(mockOptions.fn).toHaveBeenCalled();
    expect(mockOptions.inverse).not.toHaveBeenCalled();
  });
  test("should return false when arg1 is an empty string and arg2 contains an empty string", () => {
    eq("", "banana,orange,", mockOptions);
    expect(mockOptions.fn).toHaveBeenCalled();
    expect(mockOptions.inverse).not.toHaveBeenCalled();
  });
  test("should return false when both arg1 and arg2 are empty strings", () => {
    eq("", "", mockOptions);
    expect(mockOptions.fn).toHaveBeenCalled();
    expect(mockOptions.inverse).not.toHaveBeenCalled();
  });
  test("should return false when both arg1 and arg2 are undefined", () => {
    eq(undefined, undefined, mockOptions);
    expect(mockOptions.fn).toHaveBeenCalled();
    expect(mockOptions.inverse).not.toHaveBeenCalled();
  });
  test("should return true when arg1 is an empty string and arg2 does not contain an empty string", () => {
    eq("", "apple,banana", mockOptions);
    expect(mockOptions.fn).not.toHaveBeenCalled();
    expect(mockOptions.inverse).toHaveBeenCalled();
  });

  test("should return false when arg1 is an empty string and arg2 contains an empty string", () => {
    eq("", "apple,banana,", mockOptions);
    expect(mockOptions.fn).toHaveBeenCalled();
    expect(mockOptions.inverse).not.toHaveBeenCalled();
  });
});
