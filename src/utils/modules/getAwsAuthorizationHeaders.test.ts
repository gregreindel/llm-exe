import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@smithy/signature-v4";
// @ts-expect-error - this needs to be imported or the test fails
import { Sha256 } from "@aws-crypto/sha256-js";
import { runWithTemporaryEnv } from "@/utils/modules/runWithTemporaryEnv";
import { getAwsAuthorizationHeaders } from "@/utils/modules/getAwsAuthorizationHeaders";

jest.mock("@aws-sdk/credential-providers", () => ({
  fromNodeProviderChain: jest.fn(),
}));

jest.mock("@smithy/signature-v4", () => ({
  SignatureV4: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
  })),
}));

jest.mock("@aws-crypto/sha256-js");

jest.mock("@/utils/modules/runWithTemporaryEnv", () => ({
  runWithTemporaryEnv: jest.fn(),
}));

describe("getAwsAuthorizationHeaders", () => {
  const fromNodeProviderChainMock = fromNodeProviderChain as jest.Mock;
  const runWithTemporaryEnvMock = runWithTemporaryEnv as jest.Mock;
  const SignatureV4Mock = SignatureV4 as jest.Mock;

  beforeEach(() => {
    fromNodeProviderChainMock.mockClear();
    runWithTemporaryEnvMock.mockClear();
    SignatureV4Mock.mockClear();
  });

  it("should set temporary environment variables when access keys are provided", async () => {
    const props = {
      url: "https://example.com",
      regionName: "us-east-1",
      awsAccessKey: "testAccessKey",
      awsSecretKey: "testSecretKey",
      awsSessionToken: "testSessionToken",
    };
    const req: RequestInit = {
      method: "GET",
      headers: { "custom-header": "value" },
    };

    runWithTemporaryEnvMock.mockImplementation((setup, fn) => {
      setup();
      expect(process.env["AWS_ACCESS_KEY_ID"]).toBe(props.awsAccessKey);
      expect(process.env["AWS_SECRET_ACCESS_KEY"]).toBe(props.awsSecretKey);
      expect(process.env["AWS_SESSION_TOKEN"]).toBe(props.awsSessionToken);
      return fn();
    });

    const mockCredentials = { accessKeyId: "mockAccessKeyId" };
    fromNodeProviderChainMock.mockReturnValue(() =>
      Promise.resolve(mockCredentials)
    );

    const mockSign = jest.fn().mockResolvedValue({
      headers: { Authorization: "signed-header-value" },
    });

    SignatureV4Mock.mockImplementation(() => ({
      sign: mockSign,
    }));

    const headers = await getAwsAuthorizationHeaders(req, props);
    expect(headers).toEqual({ Authorization: "signed-header-value" });
  });

  it("should handle missing headers in request", async () => {
    const props = {
      url: "https://example.com",
      regionName: "us-east-1",
      awsAccessKey: "testAccessKey",
      awsSecretKey: "testSecretKey",
      awsSessionToken: "testSessionToken",
    };

    const req: RequestInit = {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    };

    runWithTemporaryEnvMock.mockImplementation((setup, fn) => {
      setup();
      return fn();
    });

    const mockCredentials = { accessKeyId: "mockAccessKeyId" };
    fromNodeProviderChainMock.mockReturnValue(() =>
      Promise.resolve(mockCredentials)
    );

    const mockSign = jest.fn().mockResolvedValue({
      headers: { Authorization: "signed-header-value" },
    });

    SignatureV4Mock.mockImplementation(() => ({
      sign: mockSign,
    }));

    const headers = await getAwsAuthorizationHeaders(req, props);
    expect(headers).toEqual({ Authorization: "signed-header-value" });
  });

  it("should handle additional headers iteration", async () => {
    const props = {
      url: "https://example.com",
      regionName: "us-east-1",
      awsAccessKey: "testAccessKey",
      awsSecretKey: "testSecretKey",
      awsSessionToken: "testSessionToken",
    };

    const req: RequestInit = {
      method: "GET",
      headers: new Headers({ "custom-header": "value" }),
    };

    runWithTemporaryEnvMock.mockImplementation((setup, fn) => {
      setup();
      return fn();
    });

    const mockCredentials = { accessKeyId: "mockAccessKeyId" };
    fromNodeProviderChainMock.mockReturnValue(() =>
      Promise.resolve(mockCredentials)
    );

    const mockSign = jest.fn().mockResolvedValue({
      headers: { Authorization: "signed-header-value" },
    });

    SignatureV4Mock.mockImplementation(() => ({
      sign: mockSign,
    }));

    const headers = await getAwsAuthorizationHeaders(req, props);
    expect(headers).toEqual({ Authorization: "signed-header-value" });
  });

  it("should delete connection header if present", async () => {
    const props = {
      url: "https://example.com",
      regionName: "us-east-1",
      awsAccessKey: "testAccessKey",
      awsSecretKey: "testSecretKey",
      awsSessionToken: "testSessionToken",
    };

    const req: RequestInit = {
      method: "PUT",
      headers: { connection: "keep-alive" },
    };

    runWithTemporaryEnvMock.mockImplementation((setup, fn) => {
      setup();
      return fn();
    });

    const mockCredentials = { accessKeyId: "mockAccessKeyId" };
    fromNodeProviderChainMock.mockReturnValue(() =>
      Promise.resolve(mockCredentials)
    );

    const mockSign = jest.fn().mockResolvedValue({
      headers: { Authorization: "signed-header-value" },
    });

    SignatureV4Mock.mockImplementation(() => ({
      sign: mockSign,
    }));

    const headers = await getAwsAuthorizationHeaders(req, props);
    expect(headers).toEqual({ Authorization: "signed-header-value" });
    expect(mockSign).toHaveBeenCalled();
    const reqArgs = mockSign.mock.calls[0][0];
    expect(reqArgs.headers.connection).toBeUndefined();
  });
});
