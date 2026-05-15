import { asyncCoreOverrideHelpers } from "@/utils/modules/handlebars/helpers/async/async-helpers";
import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";
import { withFnAsync } from "@/utils/modules/handlebars/helpers/async/with";
import { eachFnAsync } from "@/utils/modules/handlebars/helpers/async/each";
import { unlessFnAsync } from "@/utils/modules/handlebars/helpers/async/unless";

describe("asyncCoreOverrideHelpers", () => {
  it("should export if helper as ifFnAsync", () => {
    expect(asyncCoreOverrideHelpers.if).toBe(ifFnAsync);
  });

  it("should export with helper as withFnAsync", () => {
    expect(asyncCoreOverrideHelpers.with).toBe(withFnAsync);
  });

  it("should export each helper as eachFnAsync", () => {
    expect(asyncCoreOverrideHelpers.each).toBe(eachFnAsync);
  });

  it("should export unless helper as unlessFnAsync", () => {
    expect(asyncCoreOverrideHelpers.unless).toBe(unlessFnAsync);
  });

  it("should export exactly four helpers", () => {
    expect(Object.keys(asyncCoreOverrideHelpers)).toHaveLength(4);
  });
});
