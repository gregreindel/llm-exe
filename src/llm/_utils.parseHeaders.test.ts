import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { getAwsAuthorizationHeaders } from "@/utils/modules/getAwsAuthorizationHeaders";
import { Config } from "@/types";
import { parseHeaders } from "@/llm/_utils.parseHeaders";

jest.mock('@/utils/modules/replaceTemplateStringSimple');
jest.mock('@/utils/modules/getEnvironmentVariable');
jest.mock('@/utils');
jest.mock('@/utils/modules/getAwsAuthorizationHeaders');

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
      method: 'POST',
      provider: "openai.chat-mock",
      key: "openai.chat-mock.v1",
    };
    replacements = {
      token: "test-token",
      awsSecretKey: "test-secret",
      awsAccessKey: "test-access",
      awsRegion: "test-region",
    };
    payload = {
      url: 'https://example.com',
      headers: { 'User-Agent': 'test-agent' },
      body: '{"data":"test"}',
    };

    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('{"Authorization": "Bearer test-token"}');
    (getEnvironmentVariable as jest.Mock).mockReturnValue('default-region');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should merge headers and return them when provider is not amazon", async () => {
    config.provider = "openai.chat";

    const headers = await parseHeaders(config, replacements, payload);

    expect(headers).toEqual({
      'User-Agent': 'test-agent',
      'Authorization': 'Bearer test-token'
    });
  });

  it("Should call getAwsAuthorizationHeaders when provider starts with amazon", async () => {
    config.provider = "amazon:anthropic.chat";
    const expectedHeaders = {
      'User-Agent': 'test-agent',
      'Authorization': 'AWS4-HMAC-SHA256'
    };

    (getAwsAuthorizationHeaders as jest.Mock).mockResolvedValue(expectedHeaders);

    const headers = await parseHeaders(config, replacements, payload);

    expect(getAwsAuthorizationHeaders).toHaveBeenCalledWith({
      method: 'POST',
      headers: {
        'User-Agent': 'test-agent',
        'Authorization': 'Bearer test-token',
      },
      body: '{"data":"test"}'
    }, {
      url: 'https://example.com',
      regionName: 'test-region',
      awsSecretKey: "test-secret",
      awsAccessKey: "test-access"
    });

    expect(headers).toEqual(expectedHeaders);
  });

  it("Should use default AWS region when replacements do not contain a region", async () => {
    config.provider = "amazon:anthropic.chat";
    delete replacements.awsRegion;

    const expectedHeaders = {
      'User-Agent': 'test-agent',
      'Authorization': 'AWS4-HMAC-SHA256'
    };

    (getAwsAuthorizationHeaders as jest.Mock).mockResolvedValue(expectedHeaders);

    const headers = await parseHeaders(config, replacements, payload);

    expect(getEnvironmentVariable).toHaveBeenCalledWith('AWS_REGION');

    expect(getAwsAuthorizationHeaders).toHaveBeenCalledWith({
      method: 'POST',
      headers: {
        'User-Agent': 'test-agent',
        'Authorization': 'Bearer test-token',
      },
      body: '{"data":"test"}'
    }, {
      url: 'https://example.com',
      regionName: 'default-region',
      awsSecretKey: "test-secret",
      awsAccessKey: "test-access"
    });

    expect(headers).toEqual(expectedHeaders);
  });

  it("Should return parsed headers when replaceTemplateStringSimple returns an empty string", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('');

    const headers = await parseHeaders(config, replacements, payload);

    expect(headers).toEqual(payload.headers);
  });

  it("Should throw an error when headers contain invalid JSON", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('{"Authorization": invalid json}');

    await expect(parseHeaders(config, replacements, payload)).rejects.toThrow(
      /Failed to parse headers configuration: .* Headers template: "{"Authorization": "Bearer {{token}}"}". After replacement: "{"Authorization": invalid json}"/
    );
  });

  it("Should throw an error when headers parse to an array", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('["header1", "header2"]');

    await expect(parseHeaders(config, replacements, payload)).rejects.toThrow(
      'Failed to parse headers configuration: Headers must be a JSON object. ' +
      'Headers template: "{"Authorization": "Bearer {{token}}"}". ' +
      'After replacement: "["header1", "header2"]"'
    );
  });

  it("Should throw an error when headers parse to null", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('null');

    await expect(parseHeaders(config, replacements, payload)).rejects.toThrow(
      'Failed to parse headers configuration: Headers must be a JSON object. ' +
      'Headers template: "{"Authorization": "Bearer {{token}}"}". ' +
      'After replacement: "null"'
    );
  });

  it("Should throw an error when headers parse to a primitive value", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('"just a string"');

    await expect(parseHeaders(config, replacements, payload)).rejects.toThrow(
      'Failed to parse headers configuration: Headers must be a JSON object. ' +
      'Headers template: "{"Authorization": "Bearer {{token}}"}". ' +
      'After replacement: ""just a string""'
    );
  });

  it("Should throw an error when headers parse to a number", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('123');

    await expect(parseHeaders(config, replacements, payload)).rejects.toThrow(
      'Failed to parse headers configuration: Headers must be a JSON object. ' +
      'Headers template: "{"Authorization": "Bearer {{token}}"}". ' +
      'After replacement: "123"'
    );
  });

  it("Should handle nested JSON objects correctly", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('{"Authorization": "Bearer test", "X-Custom": {"nested": "value"}}');
    config.provider = "openai.chat";

    const headers = await parseHeaders(config, replacements, payload);

    expect(headers).toEqual({
      'User-Agent': 'test-agent',
      'Authorization': 'Bearer test',
      'X-Custom': { nested: 'value' }
    });
  });

  it("Should handle empty JSON object", async () => {
    (replaceTemplateStringSimple as jest.Mock).mockReturnValue('{}');
    config.provider = "openai.chat";

    const headers = await parseHeaders(config, replacements, payload);

    expect(headers).toEqual({
      'User-Agent': 'test-agent'
    });
  });
});