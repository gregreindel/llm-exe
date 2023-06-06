import { replaceTemplateString } from "@/utils";
import {
  IChatMessages,
  PromptOptions,
  PromptType,
  PromptPartial,
  PromptHelper,
  IPromptMessages,
  IPromptChatMessages,
} from "@/types";

/**
 * BasePrompt should be extended.
 */
export abstract class BasePrompt<I extends Record<string, any>> {
  readonly type: PromptType = "text";

  public messages: IPromptMessages | IPromptChatMessages = [];

  public partials: PromptPartial[] = [];
  public helpers: PromptHelper[] = [];

  /**
   * constructor description
   * @param initialPromptMessage An initial message to add to the prompt.
   */
  constructor(initialPromptMessage?: string, options?: PromptOptions) {
    if (initialPromptMessage) {
      this.addToPrompt(initialPromptMessage, "system");
    }

    if (options) {
      if (options.partials) {
        this.registerPartial(options.partials);
      }
      if (options.helpers) {
        this.registerHelpers(options.helpers);
      }
    }
  }

  /**
   * addToPrompt description
   * @param content The message content
   * @param role The role of the user. Defaults to system for base text prompt.
   * @return instance of BasePrompt.
   */
  addToPrompt(content: string, role = "system"): BasePrompt<I> {
    if (content) {
      switch (role) {
        case "system":
        default:
          this.addSystemMessage(content);
          break;
      }
    }
    return this;
  }

  /**
   * addSystemMessage description
   * @param content The message content
   * @return returns BasePrompt so it can be chained.
   */
  addSystemMessage(content: string) {
    this.messages.push({
      role: "system",
      content,
    });
    return this;
  }

  /**
   * registerPartial description
   * @param partialOrPartials Additional partials that can be made available to the template parser.
   * @return BasePrompt so it can be chained.
   */
  registerPartial(
    partialOrPartials: PromptPartial | PromptPartial[]
  ) {
    const partials = Array.isArray(partialOrPartials)
      ? partialOrPartials
      : [partialOrPartials];
    this.partials.push(...partials);
    return this;
  }

  /**
   * registerHelpers description
   * @param helperOrHelpers Additional helper functions that can be made available to the template parser.
   * @return BasePrompt so it can be chained.
   */
  registerHelpers(
    helperOrHelpers: PromptHelper | PromptHelper[]
  ) {
    const helpers = Array.isArray(helperOrHelpers)
      ? helperOrHelpers
      : [helperOrHelpers];
    this.helpers.push(...helpers);
    return this;
  }

  /**
   * format description
   * @param values The message content
   * @param separator The separator between messages. defaults to "\n\n"
   * @return returns messages formatted with template replacement
   */
  format(values: I, separator: string = "\n\n"): string | IChatMessages {
    const replacements = this.getReplacements(values);
    /* istanbul ignore next */
    return this.messages
      .map((message) => {
        return replaceTemplateString(message.content, replacements, {
          partials: this.partials,
          helpers: this.helpers,
        });
      })
      .join(separator);
  }

  getReplacements(values: I) {
    const { input = "", ...restOfValues } = values;
    const replacements = Object.assign({},
      { ...restOfValues },
      {
        input: input,
        _input: input,
      }
    );
    return replacements;
  }

  /**
   * validate description
   * @return {boolean} Returns false if the template is not valid.
   */
  validate(): boolean {
    // add validation for missing tokens, etc
    return true;
  }
}
