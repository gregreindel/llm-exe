import { get, pick, set } from "@/utils";
import { Config, GenericLLm, LlmProvidor } from "@/types";

export function stateFromOptions(options: Partial<GenericLLm>, config: Config) {
  const state = Object.assign(pick(options, Object.keys(config.options)), {
    providor: config.provider,
    model: options.model,
  }) as unknown as GenericLLm & { providor: LlmProvidor };

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
