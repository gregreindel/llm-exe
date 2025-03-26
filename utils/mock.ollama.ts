export const provider = `ollama`;
export const chatV1 = [`deepseek-r1`, `meta-3.3`, `meta-3.2`, `meta-3.1`];

const models = [
  ...chatV1.map((model) => ({
    shorthand: `${provider}.${model}`,
    provider: `${provider}.chat.v1`,
    model: model,
  })),
];

export const llm = models;

export function useOllamaModel(model: string) {
  return models.find((m) => m.model === model || m.shorthand === model);
}

export function useOllamaModels(models: string[]) {
  return models.map(useOllamaModel);
}
