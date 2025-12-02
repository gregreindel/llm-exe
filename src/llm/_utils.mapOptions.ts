import { Config, LlmExecutorWithFunctionsOptions } from "@/interfaces";

export function mapOptions(
  input: Record<string, any>,
  options: LlmExecutorWithFunctionsOptions<any> | undefined,
  config: Config
): Record<string, any> {
  if (!config?.mapOptions || !options) {
    return input;
  }

  // Start with the input we already have
  let result = { ...input };
  let processedOptions = options;

  // Apply all transformations directly
  if (options.functionCall && config.mapOptions.functionCall) {
    const mapping = config.mapOptions.functionCall(
      options.functionCall,
      options,
      result,
      config
    );

    if (mapping._clearFunctions) {
      processedOptions = { ...options, functions: [] };
      const { _clearFunctions, ...rest } = mapping;
      result = { ...result, ...rest };
    } else {
      result = { ...result, ...mapping };
    }
  }

  if (processedOptions.functions?.length && config.mapOptions.functions) {
    result = {
      ...result,
      ...config.mapOptions.functions(
        processedOptions.functions,
        processedOptions,
        result,
        config
      ),
    };
  }

  if (options.jsonSchema && config.mapOptions.jsonSchema) {
    result = {
      ...result,
      ...config.mapOptions.jsonSchema(options.jsonSchema, options, result, config),
    };
  }

  return result;
}
