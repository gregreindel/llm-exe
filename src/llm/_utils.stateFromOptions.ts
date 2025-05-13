import { get } from "@/utils/modules/get";
import { Config, GenericLLm, LlmProvider, LlmProviderKey } from "@/types";
import { pick } from "@/utils/modules/pick";

export function stateFromOptions(options: Partial<GenericLLm>, config: Config) {
  const optionsKeys = Object.keys(config.options) as (keyof typeof options)[];
  const state = Object.assign(pick(options, optionsKeys), {
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
        (state as any)[key] = thisConfig.default;
      }
    }

    const value = get(state, key);

    if (Array.isArray(thisConfig?.required)) {
      const [required, message = `Error: [${key}] is required`] =
        thisConfig.required;

      if (required && typeof value === "undefined") {
        throw new Error(message);
      }
    }
  }

  return state;
}
