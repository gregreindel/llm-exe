import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@smithy/signature-v4";
import { HttpRequest } from "@smithy/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { runWithTemporaryEnv } from "@/utils/modules/runWithTemporaryEnv";

type AuthProps = {
  url: string;
  regionName: string;
  awsAccessKey: string | null | undefined;
  awsSecretKey: string | null | undefined;
  awsSessionToken: string | null | undefined;
};

export async function getAwsAuthorizationHeaders(
  req: RequestInit,
  props: AuthProps
): Promise<Record<string, string>> {
  const providerChain = fromNodeProviderChain();
  const credentials = await runWithTemporaryEnv(
    () => {
      if (props.awsAccessKey) {
        process.env["AWS_ACCESS_KEY_ID"] = props.awsAccessKey;
      }
      if (props.awsSecretKey) {
        process.env["AWS_SECRET_ACCESS_KEY"] = props.awsSecretKey;
      }
      if (props.awsSessionToken) {
        process.env["AWS_SESSION_TOKEN"] = props.awsSessionToken;
      }
    },
    () => providerChain()
  );

  const signer = new SignatureV4({
    service: "bedrock",
    region: props.regionName,
    credentials,
    sha256: Sha256,
  });

  const url = new URL(props.url);

  const headers: Record<string, any> = !req.headers
    ? {}
    : Symbol.iterator in req.headers
    ? Object.fromEntries(Array.from(req.headers).map((header) => [...header]))
    : { ...req.headers };

  // The connection header may be stripped by a proxy somewhere, so the receiver
  // of this message may not see this header, so we remove it from the set of headers
  // that are signed.
  delete headers["connection"];
  headers["host"] = url.hostname;

  const request = new HttpRequest({
    method: req?.method?.toUpperCase(),
    protocol: url.protocol,
    path: url.pathname,
    body: req.body,
    headers,
  });

  const signed = await signer.sign(request);
  return signed.headers;
}
