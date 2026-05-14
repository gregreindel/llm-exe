import { anthropic } from "@/llm/config/anthropic";
import { anthropicPromptSanitize } from "./promptSanitize";
import { mapBody } from "@/llm/_utils.mapBody";

describe("anthropic config", () => {
  const config = anthropic["anthropic.chat.v1"];

  it("should have correct configuration properties", () => {
    expect(config).toEqual(
      expect.objectContaining({
        key: "anthropic.chat.v1",
        provider: "anthropic.chat",
        endpoint: "https://api.anthropic.com/v1/messages",
        headers: expect.any(String),
        method: "POST",
        options: expect.objectContaining({
          prompt: expect.any(Object),
          system: expect.any(Object),
          effort: expect.any(Object),
          maxTokens: expect.any(Object),
          anthropicApiKey: expect.any(Object),
        }),
        mapBody: expect.objectContaining({
          model: expect.any(Object),
          maxTokens: expect.any(Object),
          system: expect.any(Object),
          effort: expect.any(Object),
          prompt: expect.objectContaining({
            key: "messages",
            transform: anthropicPromptSanitize,
          }),
        }),
      })
    );
  });

  it("should have the correct header structure", () => {
    const headers = JSON.parse(config.headers);
    expect(headers).toEqual(
      expect.objectContaining({
        "x-api-key": "{{anthropicApiKey}}",
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      })
    );
  });

  it("should have correct options required properties", () => {
    expect(config.options.maxTokens.required).toEqual(
      expect.arrayContaining([true, "maxTokens required"])
    );
  });

  describe("effort transform", () => {
    const effortTransform = config.mapBody.effort.transform as (
      v: any,
      s: any,
      output: any
    ) => any;

    describe("adaptive thinking (4.6+ models)", () => {
      it.each([
        ["claude-opus-4-6", "low", "low"],
        ["claude-opus-4-6", "minimal", "low"],
        ["claude-opus-4-6", "medium", "medium"],
        ["claude-opus-4-6", "high", "high"],
        ["claude-sonnet-4-6", "low", "low"],
        ["claude-sonnet-4-6", "high", "high"],
      ] as const)(
        "%s with effort '%s' should return '%s'",
        (model, effort, expected) => {
          const output: Record<string, any> = {};
          const result = effortTransform(effort, { model }, output);
          expect(result).toBe(expected);
          expect(output.thinking).toEqual({ type: "adaptive" });
        }
      );
    });

    describe("adaptive thinking maps high to xhigh for Opus 4.7", () => {
      it("should map high to xhigh for opus-4-7", () => {
        const output: Record<string, any> = {};
        const result = effortTransform("high", { model: "claude-opus-4-7" }, output);
        expect(result).toBe("xhigh");
        expect(output.thinking).toEqual({ type: "adaptive" });
      });

      it("should map medium normally for opus-4-7", () => {
        const output: Record<string, any> = {};
        const result = effortTransform("medium", { model: "claude-opus-4-7" }, output);
        expect(result).toBe("medium");
        expect(output.thinking).toEqual({ type: "adaptive" });
      });
    });

    describe("legacy thinking (4.5 models)", () => {
      it.each([
        ["claude-sonnet-4-5-20250929", "minimal", 1024],
        ["claude-sonnet-4-5-20250929", "low", 4096],
        ["claude-sonnet-4-5-20250929", "medium", 10240],
        ["claude-sonnet-4-5-20250929", "high", 32768],
        ["claude-haiku-4-5-20251001", "medium", 10240],
        ["claude-opus-4-5-20251101", "high", 32768],
      ] as const)(
        "%s with effort '%s' should set budget_tokens to %d",
        (model, effort, expectedBudget) => {
          const output: Record<string, any> = {};
          const result = effortTransform(effort, { model }, output);
          expect(result).toBeUndefined();
          expect(output.thinking).toEqual({
            type: "enabled",
            budget_tokens: expectedBudget,
          });
        }
      );
    });

    describe("unsupported models (3.x)", () => {
      it.each([
        "claude-3-5-sonnet-latest",
        "claude-3-5-haiku-latest",
        "claude-3-opus-20240229",
        "claude-3-7-sonnet-20250219",
      ])("%s should return undefined and not set thinking", (model) => {
        const output: Record<string, any> = {};
        const result = effortTransform("high", { model }, output);
        expect(result).toBeUndefined();
        expect(output.thinking).toBeUndefined();
      });
    });

    describe("invalid effort values", () => {
      it("should return undefined for non-string value", () => {
        const output: Record<string, any> = {};
        expect(effortTransform(123, { model: "claude-opus-4-6" }, output)).toBeUndefined();
        expect(output.thinking).toBeUndefined();
      });

      it("should return undefined for unsupported effort string", () => {
        const output: Record<string, any> = {};
        expect(effortTransform("max", { model: "claude-opus-4-6" }, output)).toBeUndefined();
        expect(output.thinking).toBeUndefined();
      });

      it("should return undefined when effort is undefined", () => {
        const output: Record<string, any> = {};
        expect(effortTransform(undefined, { model: "claude-opus-4-6" }, output)).toBeUndefined();
        expect(output.thinking).toBeUndefined();
      });
    });
  });

  describe("effort mapBody integration", () => {
    const prompt = [{ role: "user", content: "Hello" }];

    it("should produce adaptive thinking body for opus-4-6", () => {
      const body = mapBody(config.mapBody, {
        model: "claude-opus-4-6",
        maxTokens: 4096,
        effort: "high",
        prompt,
      });
      expect(body).toEqual(
        expect.objectContaining({
          model: "claude-opus-4-6",
          thinking: { type: "adaptive" },
          output_config: { effort: "high" },
        })
      );
    });

    it("should produce legacy thinking body for sonnet-4-5", () => {
      const body = mapBody(config.mapBody, {
        model: "claude-sonnet-4-5-20250929",
        maxTokens: 4096,
        effort: "medium",
        prompt,
      });
      expect(body).toEqual(
        expect.objectContaining({
          model: "claude-sonnet-4-5-20250929",
          thinking: { type: "enabled", budget_tokens: 10240 },
        })
      );
      expect(body).not.toHaveProperty("output_config");
    });

    it("should not add thinking fields for claude-3 models", () => {
      const body = mapBody(config.mapBody, {
        model: "claude-3-5-sonnet-latest",
        maxTokens: 4096,
        effort: "high",
        prompt,
      });
      expect(body).not.toHaveProperty("thinking");
      expect(body).not.toHaveProperty("output_config");
    });
  });

  describe("deprecated shorthands still resolve", () => {
    it.each([
      ["anthropic.claude-sonnet-4", "claude-sonnet-4-0"],
      ["anthropic.claude-opus-4", "claude-opus-4-0"],
      ["anthropic.claude-3-7-sonnet", "claude-3-7-sonnet-20250219"],
      ["anthropic.claude-3-5-sonnet", "claude-3-5-sonnet-latest"],
      ["anthropic.claude-3-5-haiku", "claude-3-5-haiku-latest"],
      ["anthropic.claude-3-opus", "claude-3-opus-20240229"],
    ] as const)(
      "%s should resolve to %s",
      (shorthand, expectedModel) => {
        const cfg = anthropic[shorthand];
        expect(cfg).toBeDefined();
        expect(cfg.options.model.default).toBe(expectedModel);
      }
    );
  });

  describe("active shorthands", () => {
    it.each([
      ["anthropic.claude-opus-4-6", "claude-opus-4-6"],
      ["anthropic.claude-sonnet-4-6", "claude-sonnet-4-6"],
      ["anthropic.claude-haiku-4-5", "claude-haiku-4-5-20251001"],
      ["anthropic.claude-opus-4-5", "claude-opus-4-5-20251101"],
      ["anthropic.claude-sonnet-4-5", "claude-sonnet-4-5-20250929"],
      ["anthropic.claude-opus-4-1", "claude-opus-4-1-20250805"],
      ["anthropic.claude-sonnet-4", "claude-sonnet-4-0"],
      ["anthropic.claude-opus-4", "claude-opus-4-0"],
    ] as const)(
      "%s should resolve to %s",
      (shorthand, expectedModel) => {
        const cfg = anthropic[shorthand];
        expect(cfg).toBeDefined();
        expect(cfg.options.model.default).toBe(expectedModel);
      }
    );
  });
});
