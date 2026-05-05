import {
  emitDeprecationWarning,
  withDeprecation,
  _resetDeprecationWarnings,
} from "./_utils.deprecationWarning";
import { Config } from "@/types";

function makeConfig(
  key: string,
  deprecated?: Config<any>["deprecated"]
): Config<any> {
  return {
    key,
    provider: "google.chat",
    method: "POST",
    endpoint: "",
    headers: "{}",
    options: {},
    mapBody: {},
    transformResponse: () => ({} as any),
    deprecated,
  };
}

describe("_utils.deprecationWarning", () => {
  let warningSpy: jest.SpyInstance;

  beforeEach(() => {
    _resetDeprecationWarnings();
    warningSpy = jest.spyOn(process, "emitWarning").mockImplementation();
  });

  afterEach(() => {
    warningSpy.mockRestore();
  });

  describe("emitDeprecationWarning", () => {
    it("does nothing if config is not deprecated", () => {
      const config = makeConfig("google.chat.v1");
      emitDeprecationWarning(config);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it("emits a warning for deprecated config", () => {
      const config = makeConfig("google.gemini-2.5-pro", {
        message: "This model is deprecated",
        shutdownDate: "2026-06-17",
      });
      emitDeprecationWarning(config);
      expect(warningSpy).toHaveBeenCalledWith("This model is deprecated", {
        type: "DeprecationWarning",
        code: "LLM_EXE_DEPRECATED_google.gemini-2.5-pro",
      });
    });

    it("only warns once per config key", () => {
      const config = makeConfig("google.gemini-2.5-flash", {
        message: "Deprecated",
      });
      emitDeprecationWarning(config);
      emitDeprecationWarning(config);
      emitDeprecationWarning(config);
      expect(warningSpy).toHaveBeenCalledTimes(1);
    });

    it("warns separately for different config keys", () => {
      const config1 = makeConfig("google.gemini-2.5-pro", {
        message: "Pro deprecated",
      });
      const config2 = makeConfig("google.gemini-2.5-flash", {
        message: "Flash deprecated",
      });
      emitDeprecationWarning(config1);
      emitDeprecationWarning(config2);
      expect(warningSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("withDeprecation", () => {
    it("adds deprecated field to config", () => {
      const config = makeConfig("google.gemini-2.5-pro");
      const result = withDeprecation(config, {
        message: "Deprecated",
        shutdownDate: "2026-06-17",
      });
      expect(result.deprecated).toEqual({
        message: "Deprecated",
        shutdownDate: "2026-06-17",
      });
    });

    it("preserves all other config fields", () => {
      const config = makeConfig("google.gemini-2.5-pro");
      const result = withDeprecation(config, { message: "Deprecated" });
      expect(result.key).toBe(config.key);
      expect(result.provider).toBe(config.provider);
      expect(result.method).toBe(config.method);
    });

    it("does not mutate the original config", () => {
      const config = makeConfig("google.gemini-2.5-pro");
      withDeprecation(config, { message: "Deprecated" });
      expect(config.deprecated).toBeUndefined();
    });
  });

  describe("_resetDeprecationWarnings", () => {
    it("allows warnings to fire again after reset", () => {
      const config = makeConfig("google.gemini-2.5-pro", {
        message: "Deprecated",
      });
      emitDeprecationWarning(config);
      _resetDeprecationWarnings();
      emitDeprecationWarning(config);
      expect(warningSpy).toHaveBeenCalledTimes(2);
    });
  });
});
