import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { getAwsAuthorizationHeaders } from "@/utils/modules/getAwsAuthorizationHeaders";
import { Config } from "@/types";
import { parseHeaders } from "@/llm/_utils.parseHeaders";

jest.mock("@/utils/modules/replaceTemplateStringSimple");
jest.mock("@/utils/modules/getEnvironmentVariable");
jest.mock("@/utils");
jest.mock("@/utils/modules/getAwsAuthorizationHeaders");

describe("parseHeaders", () => {
  let config: Config;
  let replacements: Record<string, any>;
  let payload: { url: string; headers: Record<string, any>; body: string };

  beforeEach(() => {
    config = {
      headers: '{"Authorization": "Bearer {{token}}"}',
      endpoint: "",
      options: {},
      mapBody: {},
      method: "POST",
      provider: "openai.chat-mock",
      key: "openai.chat-mock.v1",
      transformResponse: () => ({
        id: "",
        name: "",
        created: 0,
        content: [],
        usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        stopReason: "stop",
      }),
    };
    replacements = {
      token: "test-token",
      awsSecretKey: "test-secret",
      awsAccessKey: "test-access",
      awsRegion: "test-region",
    };
    payload = {
      url: "https://example.com",
      headers: { "User-Agent": "test-agent" },
      body: '{"data":"test"}',
    };

    (replaceTemplateStringSimple as jest.Mock).mockReturnValue(
      '{"Authorization": "Bearer test-token"}'
    );
    (getEnvironmentVariable as jest.Mock).mockReturnValue("default-region");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should merge headers and return them when provider is not amazon", async () => {
    config.provider = "openai.chat";

    const headers = await parseHeaders(config, replacements, payload);

    expect(headers).toEqual({
      "User-Agent": "test-agent",
      Authorization: "Bearer test-token",
    });
  });

  it("Should call getAwsAuthorizationHeaders when provider starts with amazon", async () => {
    config.provider = "amazon:anthropic.chat";
    const expectedHeaders = {
      "User-Agent": "test-agent",
      Authorization: "AWS4-HMAC-SHA256",
    };

    (getAwsAuthorizationHeaders as jest.Mock).mockResolvedValue(
      expectedHeaders
    );

    const headers = await parseHeaders(config, replacements, payload);

    expect(getAwsAuthorizationHeaders).toHaveBeenCalledWith(
      {
        method: "POST",
        headers: {
          "User-Agent": "test-agent",
          Authorization: "Bearer test-token",
        },
        body: '{"data":"test"}',
      },
      {
        url: "https://example.com",
        regionName: "test-region",
        awsSecretKey: "test-secret",
        awsAccessKey: "test-access",
      }
    );

    expect(headers).toEqual(expectedHeaders);
  });

  it("Should use default AWS region when replacements do not contain a region", async () => {
    config.provider = "amazon:anthropic.chat";
    delete replacements.awsRegion;

    const expectedHeaders = {
      "User-Agent": "test-agent",
      Authorization: "AWS4-HMAC-SHA256",
    };

    (getAwsAuthorizationHeaders as jest.Mock).mockResolvedValue(
      expectedHeaders
    );

    const headers = await parseHeaders(config, replacements, payload);

    expect(getEnvironmentVariable).toHaveBeenCalledWith("AWS_REGION");

    expect(getAwsAuthorizationHeaders).toHaveBeenCalledWith(
      {
        method: "POST",
        headers: {
          "User-Agent": "test-agent",
          Authorization: "Bearer test-token",
        },
        body: '{"data":"test"}',
      },
      {
        url: "https://example.com",
        regionName: "default-region",
        awsSecretKey: "test-secret",
        awsAccessKey: "test-access",
      }
    );

    expect(headers).toEqual(expectedHeaders);
  });

  it("Should return parsed headers when replaceTemplateStringSimple returns an empty string", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue("");

    const headers = await parseHeaders(config, replacements, payload);

    expect(headers).toEqual(payload.headers);
  });
});
