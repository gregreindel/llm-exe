import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { getAwsAuthorizationHeaders } from "@/utils/modules/getAwsAuthorizationHeaders";
import { Config, EmbeddingProviderKey, LlmProviderKey } from "@/types";

export async function parseHeaders(
  config: Config<EmbeddingProviderKey | LlmProviderKey>,
  replacements: Record<string, any>,
  payload: { url: string; headers: Record<string, any>; body: string }
): Promise<Record<string, any>> {
  const replace = replaceTemplateStringSimple(config.headers, replacements);
  
  let parsedHeaders: Record<string, any> = {};
  if (replace) {
    try {
      parsedHeaders = JSON.parse(replace);
      
      // Validate that the parsed result is an object
      if (typeof parsedHeaders !== 'object' || parsedHeaders === null || Array.isArray(parsedHeaders)) {
        throw new Error('Headers must be a JSON object');
      }
    } catch (error) {
      // Provide detailed error context for debugging header configuration issues
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to parse headers configuration: ${errorMessage}. ` +
        `Headers template: "${config.headers}". ` +
        `After replacement: "${replace}"`
      );
    }
  }
  
  const headers = Object.assign({}, payload.headers, parsedHeaders);

  if (
    config.provider.startsWith("amazon:") ||
    config.provider.startsWith("amazon.")
  ) {
    const url = payload.url;
    return getAwsAuthorizationHeaders(
      {
        method: config.method,
        headers: headers,
        body: payload.body,
      },
      {
        url: url,
        regionName:
          replacements?.awsRegion || getEnvironmentVariable("AWS_REGION"),
        awsSecretKey: replacements.awsSecretKey,
        awsAccessKey: replacements.awsAccessKey,
      } as any
    );
  } else {
    return headers;
  }
}
