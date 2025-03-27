export const provider = `openai`;
export const chatV1 = [`gpt-4o-mini`, `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`];

const models = [
  ...chatV1.map((model) => ({
    shorthand: `${provider}.${model}`,
    provider: `${provider}.chat.v1`,
    model: model,
    openAiApiKey: process.env.OPEN_AI_API_KEY,
  })),
];

export const llm = models;

export function useOpenAiModel(model: string) {
  return models.find((m) => m.model === model || m.shorthand === model);
}

export function useOpenAiModels(models: string[]) {
  return models.map(useOpenAiModel);
}
