import { maybeStringifyJSON } from "@/utils";
import { assert } from "@/utils/modules/assert";
import { BasePrompt } from "./_base";
import {
  IChatMessageRole,
  ChatPromptType,
  ChatPromptOptions,
  IChatMessageContentDetailed,
} from "@/types";
import { extractPromptPlaceholderToken } from "@/utils/modules/extractPromptPlaceholderToken";
import { get } from "@/utils/modules/get";
import { escape } from "@/utils/modules/escape";
import { isPlaceholderMessage } from "@/utils/guards";
import { toInternal } from "@/converters";
import {
  InternalMessage,
  ContentPart,
  TextContentPart,
} from "@/converters/types";

// Type guard for text content parts
function isTextContentPart(part: ContentPart): part is TextContentPart {
  return part.type === "text";
}

/**
 * `ChatPrompt` provides a conversation-style prompt enabling various roles.
 * The chat prompt can be used with models such as gpt-3.5.turbo and gpt-4+.
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
  private parseUserTemplates = true;

  /**
   * new `ChatPrompt`
   * @param initialSystemPromptMessage (optional) An initial system message to add to the new prompt.
   * @param options (optional) Options to pass in when creating the prompt.
   */
  constructor(
    initialSystemPromptMessage?: string,
    options?: ChatPromptOptions
  ) {
    super(initialSystemPromptMessage, options);

    if (typeof options?.allowUnsafeUserTemplate === "boolean") {
      this.parseUserTemplates = options?.allowUnsafeUserTemplate;
    }
  }

  /**
   * addToPrompt Adds a message to the prompt based on role.
   * @param content The message content.
   * @param role The role of the chat user. Must be one of: assistant, system, user.
   * @param name (optional) The name of the user. Only accepted if role is `user`.
   * @return instance of ChatPrompt.
   */
  addToPrompt(content: string, role: string, name?: string) {
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
        case "function":
          assert(name, "Function message requires name");
          this.addFunctionMessage(content, name);
          break;
        case "function_call":
          assert(name, "Function message requires name");
          this.addFunctionCallMessage({ name: name, arguments: content });
          break;
      }
    }
    return this;
  }

  /**
   * addUserMessage Helper to add a user message to the prompt.
   * @param content The message content.
   * @param name (optional) The name of the user.
   * @return instance of ChatPrompt.
   */
  addUserMessage(
    content: string | IChatMessageContentDetailed[],
    name?: string
  ): ChatPrompt<I> {
    this.messages.push(
      ...toInternal({
        role: "user",
        content,
        name,
      })
    );
    return this;
  }

  /**
   * addAssistantMessage Helper to add an assistant message to the prompt.
   * @param content The message content.
   * @return ChatPrompt so it can be chained.
   */
  addAssistantMessage(content: string): ChatPrompt<I> {
    this.messages.push(
      ...toInternal({
        role: "assistant",
        content,
      })
    );
    return this;
  }

  /**
   * addFunctionMessage Helper to add an assistant message to the prompt.
   * @param content The message content.
   * @param name The function name.
   * @param tool_call_id (optional) The tool call ID for matching with tool responses.
   * @return ChatPrompt so it can be chained.
   */
  addFunctionMessage(
    content: string,
    name: string,
    tool_call_id?: string
  ): ChatPrompt<I> {
    this.messages.push(
      ...toInternal({
        role: "function",
        name,
        content,
        tool_call_id,
      })
    );

    return this;
  }
  /**
   * addFunctionCallMessage Helper to add an assistant message to the prompt.
   * @param content The message content.
   * @return ChatPrompt so it can be chained.
   */

  addFunctionCallMessage(function_call?: { name: string; arguments: string }) {
    if (function_call) {
      this.messages.push(
        ...toInternal({
          role: "assistant",
          function_call: {
            name: function_call.name,
            arguments: maybeStringifyJSON(function_call.arguments),
          },
          content: null,
        })
      );
    }

    return this;
  }
  /**
   * addFromHistory Adds multiple messages at one time.
   * Normalizes various provider-specific message formats into our internal format.
   * @param history History of chat messages (can be from any provider).
   * @return ChatPrompt so it can be chained.
   */
  addFromHistory(history: any[]): ChatPrompt<I> {
    if (!history || !Array.isArray(history)) {
      return this;
    }

    for (const message of history) {
      this.messages.push(...toInternal(message));
    }

    return this;
  }

  /**
   * addPlaceholder description
   * @param content The message content
   * @return returns ChatPrompt so it can be chained.
   */
  addChatHistoryPlaceholder(
    key: keyof I,
    options?: { assistant?: string; user?: string }
  ): ChatPrompt<I> {
    const start = `{{> DialogueHistory `;
    const params = [`key='${String(key)}'`];
    const end = `}}`;

    if (options?.assistant) {
      params.push(`assistant='${options.assistant}'`);
    }
    if (options?.user) {
      params.push(`user='${options.user}'`);
    }
    this.messages.push({
      role: "placeholder",
      content: [{ type: "text", text: `${start}${params.join(" ")}${end}` }],
    });
    return this;
  }

  /**
   * addTokenPlaceholder description
   * @param content The message content
   * @return returns ChatPrompt so it can be chained.
   */
  addMessagePlaceholder(
    content: string,
    role: IChatMessageRole = "user",
    name?: string
  ) {
    if (content) {
      const start = `{{> SingleChatMessage `;
      const params = [`role='${role}'`, `content='${escape(content)}'`];
      const end = `}}`;
      if (name) {
        params.push(`name='${name}'`);
      }
      this.messages.push({
        role: "placeholder",
        content: [{ type: "text", text: `${start}${params.join(" ")}${end}` }],
      });
    }
    return this;
  }

  private _format_placeholderDialogueHistory(
    data: Omit<ReturnType<typeof extractPromptPlaceholderToken>, "token">,
    replacements: any
  ) {
    const messagesOut: InternalMessage[] = [];

    /* istanbul ignore next */
    const { key = "", user } = data;
    const history: any[] = get(replacements, key, []);
    if (history && Array.isArray(history)) {
      for (const message of history) {
        // Convert each message to internal format
        const internalMessages = toInternal(message);

        // Apply user name override if specified
        if (
          user &&
          internalMessages.length > 0 &&
          internalMessages[0].role === "user"
        ) {
          internalMessages[0].name = user;
        }

        messagesOut.push(...internalMessages);
      }
    }

    return messagesOut;
  }

  /**
   * format formats the stored prompt based on input values.
   * Uses template engine.
   * Output is intended for LLM.
   * @param values input values.
   * @return formatted prompt.
   */
  format(values: I): InternalMessage[] {
    const messagesOut: InternalMessage[] = [];
    const replacements = this.getReplacements(values);
    const safeToParseTemplate = ["assistant", "system"];

    if (this.parseUserTemplates) {
      safeToParseTemplate.push("user");
    }

    for (const message of this.messages) {
      if (
        message.role === "placeholder" &&
        message.content &&
        isPlaceholderMessage(message)
      ) {
        const tokenData = extractPromptPlaceholderToken(
          message.content[0].text
        );
        switch (tokenData.token) {
          case ">DialogueHistory": {
            messagesOut.push(
              ...this._format_placeholderDialogueHistory(
                tokenData,
                replacements
              )
            );

            break;
          }
          case ">SingleChatMessage": {
            const { name, content, role } = tokenData;
            if (role && content) {
              const processedContent = this.replaceTemplateString(
                content,
                replacements,
                {
                  partials: this.partials,
                  helpers: this.helpers,
                }
              );

              const message: InternalMessage = {
                role,
                content: [{ type: "text", text: processedContent }],
              };

              if (name && role === "user") {
                message.name = name;
              }
              messagesOut.push(message);
            }
            break;
          }
        }
      } else if (message.role === "function") {
        // Process text content parts for function messages
        const processedContent = message.content.map((part) => {
          if (isTextContentPart(part)) {
            return {
              type: "text" as const,
              text: this.replaceTemplateString(part.text, replacements, {
                partials: this.partials,
                helpers: this.helpers,
              }),
            };
          }
          return part;
        });
        messagesOut.push(
          Object.assign({}, message, {
            content: processedContent,
          })
        );
      } else {
        if (safeToParseTemplate.includes(message.role)) {
          // Process content parts array
          const content = message.content.map((part) => {
            if (isTextContentPart(part)) {
              return {
                type: "text" as const,
                text: this.runPromptFilter(
                  this.replaceTemplateString(
                    this.runPromptFilter(part.text, this.filters.pre, values),
                    replacements,
                    {
                      partials: this.partials,
                      helpers: this.helpers,
                    }
                  ),
                  this.filters.post,
                  values
                ),
              };
            }
            // Non-text content parts pass through unchanged
            return part;
          });
          messagesOut.push(Object.assign({}, message, { content }));
        } else {
          // For roles that shouldn't be parsed, still apply filters to text parts
          const content = message.content.map((part) => {
            if (isTextContentPart(part)) {
              return {
                type: "text" as const,
                text: this.runPromptFilter(
                  this.runPromptFilter(part.text, this.filters.pre, values),
                  this.filters.post,
                  values
                ),
              };
            }
            return part;
          });
          messagesOut.push(Object.assign({}, message, { content }));
        }
      }
    }
    return messagesOut;
  }

  /**
   * format formats the stored prompt based on input values.
   * Uses template engine.
   * Output is intended for LLM.
   * @param values input values.
   * @return formatted prompt.
   */
  async formatAsync(values: I): Promise<InternalMessage[]> {
    const messagesOut: InternalMessage[] = [];
    const replacements = this.getReplacements(values);
    const safeToParseTemplate = ["assistant", "system"];

    if (this.parseUserTemplates) {
      safeToParseTemplate.push("user");
    }

    for (const message of this.messages) {
      if (message.role === "placeholder" && isPlaceholderMessage(message)) {
        const { token, ...data } = extractPromptPlaceholderToken(
          message.content[0].text
        );
        switch (token) {
          case ">DialogueHistory": {
            messagesOut.push(
              ...this._format_placeholderDialogueHistory(data, replacements)
            );
            break;
          }
          case ">SingleChatMessage": {
            const { name, content, role } = data;
            if (role && content) {
              const processedContent = await this.replaceTemplateStringAsync(
                content,
                replacements,
                {
                  partials: this.partials,
                  helpers: this.helpers,
                }
              );

              const message: InternalMessage = {
                role,
                content: [{ type: "text", text: processedContent }],
              };

              if (name && role === "user") {
                message.name = name;
              }
              messagesOut.push(message);
            }
            break;
          }
        }
      } else if (message.role === "function") {
        // Process text content parts for function messages
        const processedContent = await Promise.all(
          message.content.map(async (part) => {
            if (isTextContentPart(part)) {
              return {
                type: "text" as const,
                text: await this.replaceTemplateStringAsync(
                  part.text,
                  replacements,
                  {
                    partials: this.partials,
                    helpers: this.helpers,
                  }
                ),
              };
            }
            return part;
          })
        );
        messagesOut.push(
          Object.assign({}, message, {
            content: processedContent,
          })
        );
      } else {
        if (safeToParseTemplate.includes(message.role)) {
          // Process content parts array
          const content = await Promise.all(
            message.content.map(async (part) => {
              if (isTextContentPart(part)) {
                return {
                  type: "text" as const,
                  text: this.runPromptFilter(
                    await this.replaceTemplateStringAsync(
                      this.runPromptFilter(part.text, this.filters.pre, values),
                      replacements,
                      {
                        partials: this.partials,
                        helpers: this.helpers,
                      }
                    ),
                    this.filters.post,
                    values
                  ),
                };
              }
              // Non-text content parts pass through unchanged
              return part;
            })
          );
          messagesOut.push(Object.assign({}, message, { content }));
        } else {
          // For roles that shouldn't be parsed, still apply filters to text parts
          const content = message.content.map((part) => {
            if (isTextContentPart(part)) {
              return {
                type: "text" as const,
                text: this.runPromptFilter(
                  this.runPromptFilter(part.text, this.filters.pre, values),
                  this.filters.post,
                  values
                ),
              };
            }
            return part;
          });
          messagesOut.push(Object.assign({}, message, { content }));
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
