import { useExecutors } from "@/plugins/callable";
import {
  CallableExecutor,
  UseExecutorsBase,
} from "@/plugins/callable/callable";

const callableFnConfig = {
  key: "get_appointments",
  name: "get_appointments",
  description: "Used to get appointments.",
  input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
  handler: async (_input: any) => {
    return "Hello world";
  },
};
const callableFn = new CallableExecutor(callableFnConfig);

describe("llm-exe:callable/useExecutors", () => {
  it("CallableExecutor throws is invalid handler", () => {
    const executors = useExecutors([]);
    expect(executors).toBeInstanceOf(UseExecutorsBase);
  });
  it("CallableExecutor throws is invalid handler", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.handlers).toHaveLength(1);
    expect(executors).toHaveProperty("hasFunction");
    expect(typeof executors.hasFunction).toEqual("function");
    expect(executors).toHaveProperty("getFunction");
    expect(typeof executors.getFunction).toEqual("function");
    expect(executors).toHaveProperty("getFunctions");
    expect(typeof executors.getFunctions).toEqual("function");
    expect(executors).toHaveProperty("getVisibleFunctions");
    expect(typeof executors.getVisibleFunctions).toEqual("function");
    expect(executors).toHaveProperty("callFunction");
    expect(typeof executors.callFunction).toEqual("function");
  });
  it("CallableExecutor hasFunction will be true if exists", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.hasFunction("get_appointments")).toEqual(true);
  });

  it("CallableExecutor hasFunction will be true if exists if created from object", () => {
    const executors = useExecutors([callableFnConfig]);
    expect(executors.hasFunction("get_appointments")).toEqual(true);
  });

  it("CallableExecutor hasFunction will be false if not exists", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.hasFunction("does_not_exist")).toEqual(false);
  });
  it("CallableExecutor hasFunction will be false if undefined", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.hasFunction(undefined as any)).toEqual(false);
  });

  it("CallableExecutor getFunction will be true if exists", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.getFunction("get_appointments")).toBeInstanceOf(
      CallableExecutor
    );
  });
  it("CallableExecutor getFunction will be false if not exists", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.getFunction("does_not_exist")).toEqual(undefined);
  });
  it("CallableExecutor getFunction will be false if undefined", () => {
    const executors = useExecutors([callableFn]);
    expect(executors.getFunction(undefined as any)).toEqual(undefined);
  });

  it("CallableExecutor getFunction will be false if undefined", () => {
    const executors = useExecutors([callableFn]);
    const visible = executors.getVisibleFunctions({});
    expect(visible).toHaveLength(1);
  });

  it("CallableExecutor getFunction will be false if undefined", async () => {
    const executors = useExecutors([callableFn]);
    const result = await executors.callFunction("get_appointments", "Hello");
    expect(result).toEqual({ result: "Hello world", attributes: {} });
  });

  it("CallableExecutor returns error if handler throws", async () => {
    const callableFn1 = new CallableExecutor({
      key: "get_appointments",
      name: "get_appointments",
      description: "Used to get appointments.",
      input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
      handler: async (_input: any) => {
        throw new Error("Error from callable");
      },
    });
    const executors = useExecutors([callableFn1]);
    const result = await executors.callFunction("get_appointments", "Hello");
    expect(result).toEqual("Error from callable");
  });

  it("CallableExecutor validateFunctionInput true if undefined", async () => {
    const executors = useExecutors([
      new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
      }),
    ]);
    const result = await executors.validateFunctionInput(
      "get_appointments",
      "Hello"
    );
    expect(result).toEqual({ result: true, attributes: {} });
  });

  it("CallableExecutor validateFunctionInput ", async () => {
    const executors = useExecutors([
      new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
        validateInput: async (_input: any) => {
          return { result: true, attributes: { hello: "world" } };
        },
      }),
    ]);
    const result = await executors.validateFunctionInput(
      "get_appointments",
      "Hello"
    );
    expect(result).toEqual({ result: true, attributes: { hello: "world" } });
  });

  it("CallableExecutor validateFunctionInput returns error message if throws", async () => {
    const executors = useExecutors([
      new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
        validateInput: async () => {
          throw new Error("validateInput threw an error!");
        },
      }),
    ]);
    const result = await executors.validateFunctionInput(
      "get_appointments",
      "Hello"
    );
    expect(result).toEqual({
      result: false,
      attributes: { error: "validateInput threw an error!" },
    });
  });

  it("CallableExecutor validateFunctionInput returns error message if throws", async () => {
    const executors = useExecutors([
      new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
        validateInput: async (_input: any) => {
          throw new Error("validateInput threw an error!");
        },
      }),
    ]);
    const result = await executors.validateFunctionInput(
      "invalid_name",
      "Hello"
    );
    expect(result).toEqual({
      result: false,
      attributes: {
        error: "[invalid handler] The handler (invalid_name) does not exist.",
      },
    });
  });
});

describe("llm-exe:callable/CallableExecutor constructor", () => {
  it("throws on invalid handler (not function or executor)", () => {
    expect(() => {
      new CallableExecutor({
        name: "bad",
        description: "should fail",
        input: "none",
        handler: "not a function" as any,
      });
    }).toThrow("Invalid handler");
  });

  it("defaults key to name when key is not provided", () => {
    const callable = new CallableExecutor({
      name: "my_func",
      description: "test",
      input: "none",
      handler: async () => "ok",
    });
    expect(callable.key).toEqual("my_func");
  });

  it("uses provided key over name", () => {
    const callable = new CallableExecutor({
      name: "my_func",
      key: "custom_key",
      description: "test",
      input: "none",
      handler: async () => "ok",
    });
    expect(callable.key).toEqual("custom_key");
  });

  it("defaults parameters to empty object", () => {
    const callable = new CallableExecutor({
      name: "my_func",
      description: "test",
      input: "none",
      handler: async () => "ok",
    });
    expect(callable.parameters).toEqual({});
  });

  it("defaults attributes to empty object", () => {
    const callable = new CallableExecutor({
      name: "my_func",
      description: "test",
      input: "none",
      handler: async () => "ok",
    });
    expect(callable.attributes).toEqual({});
  });

  it("stores provided parameters", () => {
    const params = { type: "string", required: true };
    const callable = new CallableExecutor({
      name: "my_func",
      description: "test",
      input: "none",
      parameters: params,
      handler: async () => "ok",
    });
    expect(callable.parameters).toEqual(params);
  });

  it("stores provided attributes", () => {
    const attrs = { category: "search" };
    const callable = new CallableExecutor({
      name: "my_func",
      description: "test",
      input: "none",
      attributes: attrs,
      handler: async () => "ok",
    });
    expect(callable.attributes).toEqual(attrs);
  });
});

describe("llm-exe:callable/CallableExecutor visibilityHandler", () => {
  it("returns true by default when no visibilityHandler provided", () => {
    const callable = new CallableExecutor({
      name: "visible_fn",
      description: "always visible",
      input: "none",
      handler: async () => "ok",
    });
    expect(callable.visibilityHandler({}, {})).toBe(true);
  });

  it("calls custom visibilityHandler with input and attributes", () => {
    const visibilityHandler = jest.fn().mockReturnValue(false);
    const callable = new CallableExecutor({
      name: "conditional_fn",
      description: "conditionally visible",
      input: "none",
      handler: async () => "ok",
      visibilityHandler,
    });
    const result = callable.visibilityHandler({ role: "admin" }, { level: 5 });
    expect(result).toBe(false);
    expect(visibilityHandler).toHaveBeenCalled();
  });

  it("getVisibleFunctions filters based on visibilityHandler", () => {
    const alwaysVisible = new CallableExecutor({
      name: "always",
      description: "always visible",
      input: "none",
      handler: async () => "ok",
    });
    const neverVisible = new CallableExecutor({
      name: "never",
      description: "never visible",
      input: "none",
      handler: async () => "ok",
      visibilityHandler: () => false,
    });
    const executors = useExecutors([alwaysVisible, neverVisible]);
    const visible = executors.getVisibleFunctions({});
    expect(visible).toHaveLength(1);
    expect(visible[0].name).toEqual("always");
  });
});

describe("llm-exe:callable/CallableExecutor execute", () => {
  it("executes handler and wraps result with enforceResultAttributes", async () => {
    const callable = new CallableExecutor({
      name: "exec_fn",
      description: "test execute",
      input: "none",
      handler: async (input: any) => ({ doubled: input.value * 2 }),
    });
    const result = await callable.execute({ value: 5 } as any);
    expect(result).toEqual({
      result: { doubled: 10 },
      attributes: {},
    });
  });

  it("execute passes string input through ensureInputIsObject", async () => {
    const callable = new CallableExecutor({
      name: "string_fn",
      description: "test string input",
      input: "none",
      handler: async (input: any) => input,
    });
    const result = await callable.execute("hello" as any);
    expect(result.result).toEqual({ input: "hello" });
  });
});

describe("llm-exe:callable/UseExecutorsBase callFunction", () => {
  it("returns error message string when handler does not exist", async () => {
    const executors = useExecutors([]);
    const result = await executors.callFunction("nonexistent", "test");
    expect(result).toEqual(
      "[invalid handler] The handler (nonexistent) does not exist."
    );
  });

  it("getFunctions returns a copy of handlers array", () => {
    const callable = new CallableExecutor({
      name: "fn1",
      description: "test",
      input: "none",
      handler: async () => "ok",
    });
    const executors = useExecutors([callable]);
    const fns = executors.getFunctions();
    expect(fns).toHaveLength(1);
    expect(fns).not.toBe(executors.handlers); // should be a copy
    fns.push(callable);
    expect(executors.handlers).toHaveLength(1); // original unchanged
  });
});
