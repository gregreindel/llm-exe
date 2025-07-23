import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";
import { replaceTemplateStringAsync } from "@/utils/modules/replaceTemplateStringAsync";
import {
  PromptOptions,
  PromptType,
  PromptPartial,
  PromptHelper,
} from "@/types";
import {
  InternalMessage,
  ContentPart,
  TextContentPart,
} from "@/converters/types";
import { toInternal } from "@/converters";

// Type guard for text content parts
function isTextContentPart(part: ContentPart): part is TextContentPart {
  return part.type === "text";
}

/**
 * BasePrompt should be extended.
 */
export abstract class BasePrompt<I extends Record<string, any>> {
  readonly type: PromptType = "text";

  public messages: InternalMessage[] = [];

  public partials: PromptPartial[] = [];
  public helpers: PromptHelper[] = [];

  public replaceTemplateString = replaceTemplateString;
  public replaceTemplateStringAsync = replaceTemplateStringAsync;

  public filters: {
    pre: ((prompt: string) => string)[];
    post: ((prompt: string) => string)[];
  } = {
    pre: [],
    post: [],
  };

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
      if (options.preFilters && Array.isArray(options.preFilters)) {
        this.filters.pre.push(...options.preFilters);
      }
      if (options.postFilters && Array.isArray(options.postFilters)) {
        this.filters.post.push(...options.postFilters);
      }
      if (options.replaceTemplateString) {
        this.replaceTemplateString = options.replaceTemplateString;
      }
    }
  }

  /**
   * addToPrompt description
   * @param content The message content
   * @param role The role of the user. Defaults to system for base text prompt.
   * @return instance of BasePrompt.
   */
  addToPrompt(content: string, role = "system") {
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
    this.messages.push(
      ...toInternal({
        role: "system",
        content,
      })
    );
    return this;
  }

  /**
   * registerPartial description
   * @param partialOrPartials Additional partials that can be made available to the template parser.
   * @return BasePrompt so it can be chained.
   */
  registerPartial(partialOrPartials: PromptPartial | PromptPartial[]) {
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
  registerHelpers(helperOrHelpers: PromptHelper | PromptHelper[]) {
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
  format(values: I, separator: string = "\n\n"): string | InternalMessage[] {
    const replacements = this.getReplacements(values);
    /* istanbul ignore next */
    const messages = this.messages
      .map((message) => {
        // Extract text content from ContentPart array
        if (!message.content || !Array.isArray(message.content)) {
          return "";
        }
        
        const textParts = message.content
          .filter(isTextContentPart)
          .map((part) => part.text)
          .join("\n");

        return textParts
          ? this.replaceTemplateString(
              this.runPromptFilter(textParts, this.filters.pre, values),
              replacements,
              {
                partials: this.partials,
                helpers: this.helpers,
              }
            )
          : "";
      })
      .join(separator);

    return this.runPromptFilter(messages, this.filters.post, values);
  }

  /**
   * format description
   * @param values The message content
   * @param separator The separator between messages. defaults to "\n\n"
   * @return returns messages formatted with template replacement
   */
  async formatAsync(
    values: I,
    separator: string = "\n\n"
  ): Promise<string | InternalMessage[]> {
    const replacements = this.getReplacements(values);
    const _messages = await Promise.all(
      this.messages.map((message) => {
        // Extract text content from ContentPart array
        if (!message.content || !Array.isArray(message.content)) {
          return "";
        }
        
        const textParts = message.content
          .filter(isTextContentPart)
          .map((part) => part.text)
          .join("\n");

        return textParts
          ? this.replaceTemplateStringAsync(
              this.runPromptFilter(textParts, this.filters.pre, values),
              replacements,
              {
                partials: this.partials,
                helpers: this.helpers,
              }
            )
          : "";
      })
    );

    const messages = _messages.join(separator);
    return this.runPromptFilter(messages, this.filters.post, values);
  }

  runPromptFilter(
    prompt: string,
    filters: ((prompt: string, values: I) => string)[],
    values: I
  ): string {
    let promptValue = prompt;
    for (const filter of filters) {
      promptValue = filter(promptValue, values);
    }
    return promptValue;
  }

  getReplacements(values: I) {
    const { input = "", ...restOfValues } = values;
    const replacements = Object.assign(
      {},
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
