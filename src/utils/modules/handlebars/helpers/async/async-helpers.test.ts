import { asyncCoreOverrideHelpers } from "@/utils/modules/handlebars/helpers/async/async-helpers";
import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";
import { withFnAsync } from "@/utils/modules/handlebars/helpers/async/with";
import { eachFnAsync } from "@/utils/modules/handlebars/helpers/async/each";
import { unlessFnAsync } from "@/utils/modules/handlebars/helpers/async/unless";

describe("asyncCoreOverrideHelpers", () => {
  it("should export all four async helpers", () => {
    expect(asyncCoreOverrideHelpers).toHaveProperty("if");
    expect(asyncCoreOverrideHelpers).toHaveProperty("with");
    expect(asyncCoreOverrideHelpers).toHaveProperty("each");
    expect(asyncCoreOverrideHelpers).toHaveProperty("unless");
  });

  it("should reference the correct async implementations", () => {
    expect(asyncCoreOverrideHelpers.if).toBe(ifFnAsync);
    expect(asyncCoreOverrideHelpers.with).toBe(withFnAsync);
    expect(asyncCoreOverrideHelpers.each).toBe(eachFnAsync);
    expect(asyncCoreOverrideHelpers.unless).toBe(unlessFnAsync);
  });

  it("should have exactly four helpers", () => {
    expect(Object.keys(asyncCoreOverrideHelpers)).toHaveLength(4);
  });
});
