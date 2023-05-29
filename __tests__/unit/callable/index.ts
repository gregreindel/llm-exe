import { CoreExecutor, LlmExecutor } from "@/executor";
import { OpenAIMock } from "@/llm/openai.mock";
import { createCallableExecutor } from "@/plugins/callable";
import { CallableExecutor,  } from "@/plugins/callable/callable";
import { createChatPrompt } from "@/prompt";


describe("llm-exe:callable/CallableExecutor", () => {

  
  it("CallableExecutor created with createCallableExecutor", () => {
    const executor = createCallableExecutor({
      key: "get_appointments",
      name: "get_appointments",
      description: "Used to get appointments.",
      input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
      handler: async (_input: any) => {
        return "Hello world";
      },
    })
    expect(executor).toBeInstanceOf(CallableExecutor)
  })

  it("CallableExecutor throws is invalid handler", () => {
    expect(() => new CallableExecutor({
      key: "get_appointments",
      name: "get_appointments",
      description: "Used to get appointments.",
      input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
      handler: {} as any
    })).toThrowError("Invalid handler");
  })
    it("CallableExecutor from async", () => {
      const callableFn1 = new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
      });

      expect(callableFn1.name).toEqual("get_appointments");
      expect(callableFn1.key).toEqual("get_appointments");
      expect(callableFn1.description).toEqual("Used to get appointments.");
      expect(callableFn1.input).toEqual(`Must be JSON: ${JSON.stringify({ accountId: "12345" })}`);
      expect(callableFn1._handler).toBeInstanceOf(CoreExecutor);
    })
    it("CallableExecutor from async", async () => {
      const callableFn1 = new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
      });

      expect(callableFn1.name).toEqual("get_appointments");
      const res = await callableFn1.execute({})
      expect(res).toEqual({ result: 'Hello world', attributes: {} });
    })
    it("CallableExecutor from visibility defaults true", async () => {
      const callableFn1 = new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
      });

      expect(callableFn1.name).toEqual("get_appointments");
      const res =  callableFn1.visibilityHandler({}, {}, {})
      expect(res).toEqual(true);
    })

    it("CallableExecutor respects visibility", async () => {
      const callableFn1 = new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: async (_input: any) => {
          return "Hello world";
        },
        visibilityHandler: () => false
      });

      expect(callableFn1.name).toEqual("get_appointments");
      const res =  callableFn1.visibilityHandler({}, {}, {})
      expect(res).toEqual(false);
    })

    it("CallableExecutor from llm", async () => {
      const llm = new OpenAIMock();
      const prompt = createChatPrompt("This is a prompt.");
      const executor = new LlmExecutor({ llm, prompt });

      const callableFn1 = new CallableExecutor({
        key: "get_appointments",
        name: "get_appointments",
        description: "Used to get appointments.",
        input: `Must be JSON: ${JSON.stringify({ accountId: "12345" })}`,
        handler: executor
      });

      const res = await callableFn1.execute({})
      expect(res).toEqual({ result: 'Hello world from LLM! The input was [{\"role\":\"system\",\"content\":\"This is a prompt.\"}]', attributes: {} });
    })
})