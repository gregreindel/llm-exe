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
