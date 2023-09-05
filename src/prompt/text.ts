import { PromptOptions } from "@/types";
import { BasePrompt } from "./_base";

/**
 * `TextPrompt` provides a standard text-based prompt.
 * The text prompt can be used with models such as davinci.
 * @extends BasePrompt
 */
export class TextPrompt<I extends Record<string, any>> extends BasePrompt<I> {
  constructor(base?: string, options?: PromptOptions) {
    super(base, options);
  }
}
