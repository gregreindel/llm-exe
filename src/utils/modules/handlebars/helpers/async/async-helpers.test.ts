import { asyncCoreOverrideHelpers } from "@/utils/modules/handlebars/helpers/async/async-helpers";
import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";
import { withFnAsync } from "@/utils/modules/handlebars/helpers/async/with";
import { eachFnAsync } from "@/utils/modules/handlebars/helpers/async/each";
import { unlessFnAsync } from "@/utils/modules/handlebars/helpers/async/unless";

describe("asyncCoreOverrideHelpers", () => {
  it("should export the correct set of helper keys", () => {
    expect(Object.keys(asyncCoreOverrideHelpers).sort()).toEqual(
      ["each", "if", "unless", "with"]
    );
  });

  it("should map 'if' to ifFnAsync", () => {
    expect(asyncCoreOverrideHelpers.if).toBe(ifFnAsync);
  });

  it("should map 'with' to withFnAsync", () => {
    expect(asyncCoreOverrideHelpers.with).toBe(withFnAsync);
  });

  it("should map 'each' to eachFnAsync", () => {
    expect(asyncCoreOverrideHelpers.each).toBe(eachFnAsync);
  });

  it("should map 'unless' to unlessFnAsync", () => {
    expect(asyncCoreOverrideHelpers.unless).toBe(unlessFnAsync);
  });
});
