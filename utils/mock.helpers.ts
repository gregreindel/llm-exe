import { useLlm } from "@/llm";

export function getLlmForScenario(_scenario: any, options: any = {}) {
  const { provider, model, shorthand, ...defaultOptions } = _scenario;
  return useLlm(provider, Object.assign({ model }, defaultOptions, options));
}

export function testUsingModels(
  name: string,
  models: any[],
  cb: (...args: any[]) => any
) {
  for (let index = 0; index < models.length; index++) {
    const model = models[index];
    it(`${name} (${model.shorthand})`, async () => {
      return cb(model);
    });
  }
}

export function debug(...args: any[]) {
  if (process.env.DEBUG) {
    console.log(...args);
  }
}