import { mapBody } from "@/llm/_utils.mapBody";
import { Config } from "@/types";

describe("mapBody", () => {
  beforeEach(() => {});

  it("should return an empty object if template is empty", () => {
    const template: Config["mapBody"] = {};
    const body: Record<string, any> = {};

    const result = mapBody(template, body);

    expect(result).toEqual({});
  });

  it("should map body keys based on the template", () => {
    const template: Config["mapBody"] = {
      name: { key: "userName" },
      age: { key: "userAge", default: 18 },
    };
    const body: Record<string, any> = {
      name: "John",
    };

    const result = mapBody(template, body);

    expect(result).toHaveProperty("userName");
    expect(result.userName).toEqual("John");

    expect(result).toHaveProperty("userAge");
    expect(result.userAge).toEqual(18);
  });

  it("should transform the value if transform function is provided", () => {
    const transformFn = jest.fn().mockReturnValue("SANITIZED");
    const template: Config["mapBody"] = {
      password: { key: "securePassword", transform: transformFn },
    };
    const body: Record<string, any> = {
      password: "untransformed_password",
    };

    const result = mapBody(template, body);

    expect(result).toHaveProperty("securePassword");
    expect(result.securePassword).toEqual("SANITIZED");
    expect(transformFn).toHaveBeenCalledWith(body.password, body, {
      securePassword: "SANITIZED",
    });
  });

  it("should not map if providerSpecificKey is not present in template", () => {
    const template: Config["mapBody"] = {
      name: { default: "NoNameProvided" }, // No key provided
    } as any;
    const body: Record<string, any> = {
      name: "John",
    };

    const result = mapBody(template, body);
    expect(result).toEqual({});
  });

  it("should use default value if body value is undefined", () => {
    const template: Config["mapBody"] = {
      name: { key: "userName", default: "DefaultName" },
    };
    const body: Record<string, any> = {}; // name is missing in body

    const result = mapBody(template, body);
    expect(result.userName).toEqual(template.name.default);
  });

  it("should not map key if value is undefined and no default is provided", () => {
    const template: Config["mapBody"] = {
      name: { key: "userName" },
    };
    const body: Record<string, any> = {};

    const result = mapBody(template, body);

    expect(result).toEqual({});
  });

  it("should fall back to default value when transform returns undefined", () => {
    const template: Config["mapBody"] = {
      stream: {
        key: "stream",
        default: false,
        transform: () => undefined,
      },
    };
    const body: Record<string, any> = { stream: true };

    const result = mapBody(template, body);

    // transform returning undefined triggers the default branch
    expect(result).toEqual({ stream: false });
  });

  it("should preserve null values returned by transform (null is not undefined)", () => {
    const template: Config["mapBody"] = {
      stopSequences: {
        key: "stop",
        default: ["__FALLBACK__"],
        transform: () => null as any,
      },
    };
    const body: Record<string, any> = { stopSequences: ["foo"] };

    const result = mapBody(template, body);

    // null should be written through, default should NOT kick in
    expect(result).toEqual({ stop: null });
  });

  it("should preserve falsy values (0, false, empty string)", () => {
    const template: Config["mapBody"] = {
      temperature: { key: "temperature" },
      stream: { key: "stream" },
      suffix: { key: "suffix" },
    };
    const body: Record<string, any> = {
      temperature: 0,
      stream: false,
      suffix: "",
    };

    const result = mapBody(template, body);

    expect(result).toEqual({ temperature: 0, stream: false, suffix: "" });
  });

  it("should apply falsy default values when body value is undefined", () => {
    const template: Config["mapBody"] = {
      temperature: { key: "temperature", default: 0 },
      stream: { key: "stream", default: false },
      suffix: { key: "suffix", default: "" },
    };
    const body: Record<string, any> = {};

    const result = mapBody(template, body);

    expect(result).toEqual({ temperature: 0, stream: false, suffix: "" });
  });

  it("should freeze the body snapshot passed to transform", () => {
    const frozenSnapshots: Record<string, any>[] = [];
    const template: Config["mapBody"] = {
      name: {
        key: "userName",
        transform: (value, bodySnapshot) => {
          frozenSnapshots.push(bodySnapshot);
          return value;
        },
      },
    };
    const body: Record<string, any> = { name: "Ada", extra: "data" };

    mapBody(template, body);

    expect(frozenSnapshots).toHaveLength(1);
    expect(Object.isFrozen(frozenSnapshots[0])).toBe(true);
    // The snapshot must include ALL keys from body, not just the mapped one
    expect(frozenSnapshots[0]).toEqual({ name: "Ada", extra: "data" });
    // The snapshot must be a clone, not the original reference
    expect(frozenSnapshots[0]).not.toBe(body);
    expect(Object.isFrozen(body)).toBe(false);
  });

  it("should let transform read previously-mapped keys from the output object", () => {
    const template: Config["mapBody"] = {
      firstName: { key: "firstName" },
      lastName: { key: "lastName" },
      fullName: {
        key: "fullName",
        transform: (_v, _body, output) =>
          `${output.firstName} ${output.lastName}`,
      },
    };
    const body: Record<string, any> = {
      firstName: "Grace",
      lastName: "Hopper",
    };

    const result = mapBody(template, body);

    // Template iteration order matters: fullName runs LAST and sees the
    // accumulated output. This is what providers like OpenAI/Anthropic rely on
    // when deriving a synthesized field from earlier mapped ones.
    expect(result).toEqual({
      firstName: "Grace",
      lastName: "Hopper",
      fullName: "Grace Hopper",
    });
  });

  it("should skip template entries that have no providerSpecificKey (transform is not called)", () => {
    const transform = jest.fn();
    const template: Config["mapBody"] = {
      ignored: { default: "x", transform } as any,
    };
    const body: Record<string, any> = { ignored: "present" };

    const result = mapBody(template, body);

    expect(result).toEqual({});
    expect(transform).not.toHaveBeenCalled();
  });

  it("should invoke transform even when body does not contain the generic key", () => {
    // Capture args at call time — the output object is passed by reference
    // and mutated after transform returns, so jest.fn's recorded args reflect
    // the final state, not the state at invocation.
    const calls: { value: any; body: Record<string, any>; output: Record<string, any> }[] = [];
    const transform = jest.fn((value, body, output) => {
      calls.push({ value, body: { ...body }, output: { ...output } });
      return value === undefined ? "synthesized" : value;
    });
    const template: Config["mapBody"] = {
      virtual: { key: "virtual", transform },
    };
    const body: Record<string, any> = {};

    const result = mapBody(template, body);

    expect(transform).toHaveBeenCalledTimes(1);
    expect(calls[0].value).toBeUndefined();
    expect(calls[0].body).toEqual({});
    expect(calls[0].output).toEqual({});
    expect(result).toEqual({ virtual: "synthesized" });
  });

  it("should nest dot-notation provider keys into the output object", () => {
    const template: Config["mapBody"] = {
      topP: { key: "generationConfig.topP" },
      temperature: { key: "generationConfig.temperature", default: 0.2 },
      model: { key: "model" },
    };
    const body: Record<string, any> = { topP: 0.9, model: "gemini-pro" };

    const result = mapBody(template, body);

    // convertDotNotation should collapse the dotted provider keys into
    // a nested generationConfig object — this is how Gemini-style providers
    // get their request body built.
    expect(result).toEqual({
      model: "gemini-pro",
      generationConfig: { topP: 0.9, temperature: 0.2 },
    });
  });

  it("should not include keys when body value is undefined, no default, and no transform", () => {
    const template: Config["mapBody"] = {
      a: { key: "a" },
      b: { key: "b", default: "B" },
      c: { key: "c" },
    };
    const body: Record<string, any> = { b: undefined };

    const result = mapBody(template, body);

    // a and c have nothing to map, b falls back to the default
    expect(result).toEqual({ b: "B" });
  });

  it("should not mutate the input body", () => {
    const template: Config["mapBody"] = {
      messages: {
        key: "messages",
        transform: (value) => {
          // Transforms commonly reshape arrays — the output must not leak
          // back into the caller's body.
          const next = [...(value || []), { role: "system", content: "added" }];
          return next;
        },
      },
    };
    const body: Record<string, any> = {
      messages: [{ role: "user", content: "hi" }],
    };
    const snapshot = JSON.parse(JSON.stringify(body));

    mapBody(template, body);

    expect(body).toEqual(snapshot);
  });
});
