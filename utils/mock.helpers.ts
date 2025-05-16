import { useLlm } from "@/llm";
import { configs } from "@/llm/config";

export function getLlmForScenario(_scenario: any, options: any = {}) {
  const { provider, key, ...defaultOptions } = _scenario;
  const { model, ...restOfOptions } = options;

  if (model) {
    return useLlm(key, Object.assign(defaultOptions, options, { model }));
  }

  const modelName = defaultOptions.options.model?.default;

  return useLlm(
    key,
    Object.assign(defaultOptions, restOfOptions, { model: modelName })
  );
}

export function useModel(model: keyof typeof configs) {
  return configs[model];
}

export function useModels(models: (keyof typeof configs)[]) {
  return models.map(useModel);
}

export function testUsingModels(
  name: string,
  models: any[],
  cb: (...args: any[]) => any
) {
  for (let index = 0; index < models.length; index++) {
    const modelOrModels = models[index];

    if (Array.isArray(modelOrModels)) {
      for (const model of modelOrModels) {
        it(`${name} (${model.key})`, async () => {
          // this is the execution of the test
          return cb(model);
        });
      }
    } else {
      const model = modelOrModels;
      it(`${name} (${model.key})`, async () => {
        // this is the execution of the test
        return cb(model);
      });
    }
  }
}

export function debug(...args: any[]) {
  if (process.env.DEBUG) {
    console.log(...args);
  }
}

export function itWithUseLlmMocked(
  instruction: string,
  _models: keyof typeof configs | (keyof typeof configs)[],
  cb: (...args: any[]) => any
) {
  const models = useModels(Array.isArray(_models) ? _models : [_models]);

  for (let index = 0; index < models.length; index++) {
    const _scenario = models[index];
    const { provider, key, ...defaultOptions } = _scenario;
    const modelName = defaultOptions.options.model?.default;

    it(`${instruction} (${modelName})`, async () => {
      return cb(Object.assign(defaultOptions, { key, model: modelName }));
    });
  }
}
