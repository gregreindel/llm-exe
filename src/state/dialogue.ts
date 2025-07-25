import {
  IChatMessageContentDetailed,
  IChatMessages,
  IChatUserMessage,
  OutputResultsText,
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
}
