import { OpenAIOptions } from "@/types";
import { BaseLlm } from "./_base";
import { OutputOpenAIChat } from "@/llm/output";

export class OpenAIMock extends BaseLlm<null> {
  private model: string;

  constructor(options: Partial<OpenAIOptions> = {}) {
    super(options);

    this.model = options?.modelName ? `mock-${options.modelName}` : "mock-model";
    this.promptType = options.promptType ?? "chat";

    this.client = null;
  }

  async _call(_input: any) {
    return new OutputOpenAIChat({
      id: "0123-45-6789",
      model: this.model,
      created: new Date().getTime(),
      usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
      choices: [
        {
          message: {
            role: "assistant",
            content: `Hello world from LLM! The input was ${JSON.stringify(
              _input
            )}`,
          },
        },
      ],
    });
  }
}
