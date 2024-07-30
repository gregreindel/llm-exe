import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getEnvironmentVariable } from "@/utils";
import { Config } from "@/types";
import { getAwsAuthorizationHeaders } from "@/utils/modules/getAwsAuthorizationHeaders";

export async function parseHeaders(
  config: Config,
  replacements: Record<string, any>,
  payload: { url: string; headers: Record<string, any>; body: string }
): Promise<Record<string, any>> {
  const replace = replaceTemplateStringSimple(config.headers, replacements);
  const parse = replace ? JSON.parse(replace) : {};
  const headers = Object.assign({}, payload.headers, parse);

  if (config.provider.startsWith("amazon")) {
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