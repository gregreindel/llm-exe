export const provider = `anthropic`;
export const chatV1 = [`claude-3-5-sonnet-20240620`, `claude-3-5-haiku-latest`];

const models = [
  ...chatV1.map((model) => ({
    shorthand: `${provider}.${model}`,
    provider: `${provider}.chat.v1`,
    model: model,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  })),
];

export const llm = models;

export function useAnthropicModel(model: string) {
  return models.find((m) => m.model === model || m.shorthand === model);
}

export function useAnthropicModels(models: string[]) {
  return models.map(useAnthropicModel);
}