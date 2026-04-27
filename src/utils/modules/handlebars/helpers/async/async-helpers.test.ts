import { asyncCoreOverrideHelpers } from "./async-helpers";
import { ifFnAsync } from "./if";
import { withFnAsync } from "./with";
import { eachFnAsync } from "./each";
import { unlessFnAsync } from "./unless";

describe("asyncCoreOverrideHelpers", () => {
  it("should export all four async helper overrides", () => {
    expect(asyncCoreOverrideHelpers).toEqual({
      if: ifFnAsync,
      with: withFnAsync,
      each: eachFnAsync,
      unless: unlessFnAsync,
    });
  });

  it("should export exactly four helpers", () => {
    expect(Object.keys(asyncCoreOverrideHelpers)).toHaveLength(4);
  });
});
