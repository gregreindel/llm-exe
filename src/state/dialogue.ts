import {
  IChatMessageContentDetailed,
  IChatMessages,
  IChatUserMessage,
  OutputResultsText,
  OutputResult,
  BaseLlCall,
} from "@/types";
import { BaseStateItem } from "./item";
import { maybeStringifyJSON } from "@/utils";
import { LlmExeError } from "@/utils/modules/errors";
import { isOutputResultContentText } from "@/utils/guards";

export class Dialogue extends BaseStateItem<IChatMessages> {
  public name: string;

  constructor(name: string) {
    super(name, []);
    this.name = name;
  }

  setUserMessage(
    content: string | IChatMessageContentDetailed[],
    name?: string
  ) {
    if (content) {
      const msg: IChatUserMessage = {
        role: "user",
        content,
      };
      if (name) {
        msg.name = name;
      }
      this.value.push(msg);
    }
    return this;
  }

  setAssistantMessage(content: string | OutputResultsText) {
    if (content) {
      if (isOutputResultContentText(content)) {
        this.value.push({
          role: "assistant",
          content: content.text,
        });
      } else {
        this.value.push({
          role: "assistant",
          content,
        });
      }
    }
    return this;
  }

  setSystemMessage(content: string) {
    if (content) {
      this.value.push({
        role: "system",
        content,
      });
    }
    return this;
  }

  setToolCallMessage(name: string, args: string, id?: string) {
    this.setFunctionCallMessage({
      function_call: {
        name,
        arguments: args,
        id,
      },
    });
  }

  setToolMessage(content: string, name: string, id?: string) {
    this.setFunctionMessage(content, name, id);
  }

  setFunctionMessage(content: string, name: string, id?: string) {
    if (content) {
      this.value.push({
        role: "function",
        id,
        name,
        content,
      });
    }
    return this;
  }

  setFunctionCallMessage(input: {
    function_call: { name: string; arguments: string; id?: string };
  }) {
    if (!input?.function_call) {
      throw new LlmExeError(`Invalid arguments`, "state", {
        error: `Invalid arguments: missing required function_call`,
        module: "dialogue",
      });
    }
    this.value.push({
      role: "function_call",
      function_call: {
        id: input?.function_call.id,
        name: input?.function_call.name,
        arguments: maybeStringifyJSON(input?.function_call.arguments),
      },
      content: null,
    });
    return this;
  }

  setMessageTurn(
    userMessage: string,
    assistantMessage: string,
    systemMessage: string = ""
  ) {
    this.setUserMessage(userMessage);
    this.setAssistantMessage(assistantMessage);
    this.setSystemMessage(systemMessage);
    return this;
  }

  setHistory(messages: IChatMessages) {
    for (const message of messages) {
      switch (message?.role) {
        case "user":
          this.setUserMessage(message?.content, message?.name);
          break;
        case "model":
        case "assistant":
          this.setAssistantMessage(message?.content);
          break;
        case "system":
          this.setSystemMessage(message?.content);
          break;
        case "function_call":
          this.setFunctionCallMessage({
            function_call: message.function_call,
          });
          break;
        case "function":
          this.setFunctionMessage(message?.content, message.name);
          break;
        default:
          this.value.push({
            role: (message as any).role,
            content: (message as any).content || "",
          });
      }
    }
    return this;
  }

  getHistory() {
    return this.getValue();
  }

  serialize() {
    return {
      class: "Dialogue",
      name: this.name,
      value: [...this.value],
    };
  }
  // deserialize() {}

  /**
   * Add LLM output to dialogue history in the order it was returned
   * 
   * @param output - The LLM output result from llm.call()
   * @returns this for chaining
   */
  addFromOutput(output: OutputResult | BaseLlCall) {
    // Handle both raw OutputResult and the wrapped BaseLlCall
    const result = 'getResult' in output ? output.getResult() : output;
    
    // Just add everything in order, exactly as returned
    for (const item of result.content) {
      if (item.type === "text") {
        this.setAssistantMessage(item.text);
      } else if (item.type === "function_use") {
        this.setToolCallMessage(
          item.name,
          maybeStringifyJSON(item.input),
          item.callId
        );
      }
    }

    return this;
  }

  /**
   * Add function results back to the dialogue
   * Helper method for adding tool/function responses
   * 
   * @param results - Array of function results
   * @returns this for chaining
   */
  addFunctionResults(
    results: Array<{
      name: string;
      content: string;
      id?: string;
    }>
  ) {
    for (const result of results) {
      this.setToolMessage(result.content, result.name, result.id);
    }
    return this;
  }
}
