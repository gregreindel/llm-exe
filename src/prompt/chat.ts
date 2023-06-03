import {
  extractPromptPlaceholderToken,
  get,
  pick,
  replaceTemplateString,
} from "@/utils";
import { BasePrompt } from "./_base";
import {
  IChatMessages,
  IChatUserMessage,
  IChatMessageRole,
  ChatPromptType,
  ChatPromptOptions,
  IPromptChatMessages,
} from "@/types";

export interface ChatPrompt<I extends Record<string, any>>
  extends BasePrompt<I> {
  messages: IPromptChatMessages;
}

/**
 * `ChatPrompt` provides a conversation-style prompt enabling various roles.
 * The chat prompt can be used with models such as gpt-3.5.turbo and gpt-4.
 * @extends BasePrompt
 */
export class ChatPrompt<I extends Record<string, any>> extends BasePrompt<I> {
  /**
   * @property type - Prompt type (chat)
   */
  readonly type: ChatPromptType = "chat";

  /**
   * @property parseUserTemplates - Whether or not to allow parsing
   * user messages with the template engine. This could be a risk,
   * so we only parse user messages if explicitly set.
   */
  private parseUserTemplates = false;

  /**
   * new `ChatPrompt`
   * @param initialSystemPromptMessage (optional) An initial system message to add to the new prompt.
   * @param options (optional) Options to pass in when creating the prompt.
   */
  constructor(
    initialSystemPromptMessage?: string,
    options?: ChatPromptOptions
  ) {
    super(initialSystemPromptMessage);
    if (options?.allowUnsafeUserTemplate) {
      this.parseUserTemplates = true;
    }
  }

  /**
   * addToPrompt Adds a message to the prompt based on role.
   * @param content The message content.
   * @param role The role of the chat user. Must be one of: assistant, system, user.
   * @param name (optional) The name of the user. Only accepted if role is `user`.
   * @return instance of BasePrompt.
   */
  addToPrompt(
    content: string,
    role: Extract<IChatMessageRole, "assistant">,
    name?: undefined
  ): BasePrompt<I>;
  addToPrompt(
    content: string,
    role: Extract<IChatMessageRole, "system">,
    name?: undefined
  ): BasePrompt<I>;
  addToPrompt(
    content: string,
    role: Extract<IChatMessageRole, "user">,
    name?: string
  ): BasePrompt<I>;
  addToPrompt(
    content: string,
    role: IChatMessageRole,
    name?: string
  ): BasePrompt<I> {
    if (content) {
      switch (role) {
        case "system":
          this.addSystemMessage(content);
          break;
        case "user":
          this.addUserMessage(content, name);
          break;
        case "assistant":
          this.addAssistantMessage(content);
          break;
      }
    }
    return this;
  }

  /**
   * addUserMessage Helper to add a user message to the prompt.
   * @param content The message content.
   * @param name (optional) The name of the user.
   * @return instance of BasePrompt.
   */
  addUserMessage(content: string, name?: string): ChatPrompt<I> {
    const message: IChatUserMessage = {
      role: "user",
      content,
    };
    if (name) {
      message.name = name;
    }
    this.messages.push(message);
    return this;
  }

  /**
   * addAssistantMessage Helper to add an assistant message to the prompt.
   * @param content The message content.
   * @return ChatPrompt so it can be chained.
   */
  addAssistantMessage(content: string): ChatPrompt<I> {
    this.messages.push({
      role: "assistant",
      content,
    });
    return this;
  }

  /**
   * addFromHistory Adds multiple messages at one time.
   * @param history History of chat messages.
   * @return ChatPrompt so it can be chained.
   */
  addFromHistory(history: IChatMessages): ChatPrompt<I> {
    if (history && Array.isArray(history)) {
      for (const message of history) {
        switch (message.role) {
          case "user":
            this.addUserMessage(message.content, message?.name);
            break;
          case "assistant":
            this.addAssistantMessage(message.content);
            break;
          case "system":
            this.addSystemMessage(message.content);
            break;
        }
      }
    }
    return this;
  }

  /**
   * addPlaceholder description
   * @param content The message content
   * @return returns ChatPrompt so it can be chained.
   */
  addChatHistoryPlaceholder(key: keyof I): ChatPrompt<I> {
    const start = `{{> DialogueHistory `;
    const params = [`key='${String(key)}'`];
    const end = `}}`;
    this.messages.push({
      role: "placeholder",
      content: `${start}${params.join(" ")}${end}`,
    });
    return this;
  }

  /**
   * format formats the stored prompt based on input values.
   * Uses template engine.
   * Output is intended for LLM.
   * @param values input values.
   * @return formatted prompt.
   */
  format(values: I): IChatMessages {
    const messagesOut: IChatMessages = [];
    const replacements = this.getReplacements(values);
    const safeToParseTemplate = ["assistant", "system"];

    if (this.parseUserTemplates) {
      safeToParseTemplate.push("user");
    }

    for (const message of this.messages) {
      if (message.role === "placeholder") {
        const { token, ...data } = extractPromptPlaceholderToken(
          message.content
        );
        switch (token) {
          case ">DialogueHistory": {
            /* istanbul ignore next */
            const { key = "" } = data;
            const history: IChatMessages = get(replacements, key, []);
            if (history && Array.isArray(history)) {
              for (const message of history) {
                switch (message.role) {
                  case "user":
                    messagesOut.push(pick(message, ["role", "content", "name"]));
                    break;
                  case "assistant":
                    messagesOut.push({
                      role: "assistant",
                      content: message.content,
                    });
                    break;
                  case "system":
                    messagesOut.push({
                      role: "system",
                      content: message.content,
                    });
                    break;
                }
              }
            }
            break;
          }
        }
      } else {
        if (safeToParseTemplate.includes(message.role)) {
          messagesOut.push(
            Object.assign({}, message, {
              content: replaceTemplateString(message.content, replacements, {
                partials: this.partials,
                helpers: this.helpers,
              }),
            })
          );
        } else {
          messagesOut.push(message);
        }
      }
    }
    return messagesOut;
  }

  /**
   * validate Ensures there are not unresolved tokens in prompt.
   * @TODO Make this work!
   * @return Returns false if the template is not valid.
   */
  validate(): boolean {
    // add validation for missing tokens, etc.
    return true;
  }
}
