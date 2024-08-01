import { get, pick, set } from "@/utils";
import { Config, GenericLLm, LlmProvider, LlmProviderKey } from "@/types";

export function stateFromOptions(options: Partial<GenericLLm>, config: Config) {
  const state = Object.assign(pick(options, Object.keys(config.options)), {
    provider: config.provider,
    key: config.key,
    model: options.model,
  }) as unknown as GenericLLm & { provider: LlmProvider; key: LlmProviderKey };

  const keys = Object.keys(config.options) as (keyof typeof config.options)[];

  for (const key of keys) {
    const thisConfig = config.options[key];
    const thisValue = get(state, key);
    if (typeof thisValue === "undefined") {
      if (typeof thisConfig?.default !== "undefined") {
        set(state, key, thisConfig.default);
      }
    }

    if (thisConfig?.required && typeof get(state, key) === "undefined") {
      const [required, message = `Error: [${key}] is required`] =
        thisConfig?.required;
      if (required) {
        throw new Error(message);
      }
    }
  }

  return state;
}
