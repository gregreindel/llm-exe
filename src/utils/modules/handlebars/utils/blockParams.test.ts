import { blockParams } from "@/utils/modules/handlebars/utils/blockParams";

describe("blockParams", () => {
  it("should add the ids to params with key 'path'", () => {
    // Arrange
    const params = { someKey: "someValue" };
    const ids = [1, 2, 3];

    // Act
    const result = blockParams(params, ids);

    // Assert
    expect(result).toEqual({ someKey: "someValue", path: ids });
  });

  it("should override the existing 'path' key in params", () => {
    // Arrange
    const params = { path: "oldPath", otherKey: "otherValue" };
    const ids = [4, 5, 6];

    // Act
    const result = blockParams(params, ids);

    // Assert
    expect(result).toEqual({ path: ids, otherKey: "otherValue" });
  });

  it("should work with an empty params object", () => {
    // Arrange
    const params = {};
    const ids = [7, 8, 9];

    // Act
    const result = blockParams(params, ids);

    // Assert
    expect(result).toEqual({ path: ids });
  });

  it("should handle null ids", () => {
    // Arrange
    const params = { key: "value" };
    const ids = null;

    // Act
    const result = blockParams(params, ids);

    // Assert
    expect(result).toEqual({ key: "value", path: null });
  });

  it("should handle ids of various data types", () => {
    // Arrange
    const params = { key: "value" };
    const ids = "stringId";

    // Act
    const result = blockParams(params, ids);

    // Assert
    expect(result).toEqual({ key: "value", path: "stringId" });
  });

  it("should not modify the original params object", () => {
    // Arrange
    const params = { someKey: "someValue" };
    const originalParams = { ...params };
    const ids = [10, 11, 12];

    // Act
    blockParams(params, ids); // Do not store result

    // Assert
    expect(params).toEqual(originalParams); // Ensure no mutation
  });
});