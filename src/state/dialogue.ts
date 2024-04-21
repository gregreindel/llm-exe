import {
  IChatMessageContentDetailed,
  IChatMessages,
  IChatUserMessage,
} from "@/types";
import { BaseStateItem } from "./item";
import { maybeStringifyJSON } from "@/utils";

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

  setAssistantMessage(content: string) {
    if (content) {
      this.value.push({
        role: "assistant",
        content,
      });
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

  setFunctionMessage(content: string, name: string) {
    if (content) {
      this.value.push({
        role: "function",
        name,
        content,
      });
    }
    return this;
  }
  setFunctionCallMessage(input: {
    function_call: { name: string; arguments: string };
  }) {
    this.value.push({
      role: "assistant",
      function_call: {
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
        case "assistant":
          if (message.function_call) {
            this.setFunctionCallMessage({
              function_call: message.function_call,
            });
          } else if (message?.content) {
            this.setAssistantMessage(message?.content);
          }
          break;
        case "system":
          this.setSystemMessage(message?.content);
          break;
        case "function":
          this.setFunctionMessage(message?.content, message.name);
          break;
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
