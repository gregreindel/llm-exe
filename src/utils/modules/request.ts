import { Agent } from "https";
import fetch, { RequestInit, Response } from "node-fetch-commonjs";

// Create a single instance of the https.Agent
const httpsAgent = new Agent({
  keepAlive: true,
});

/**
 * Makes an API request with the given URL and options, using a persistent HTTPS agent.
 *
 * @param {string} url - The endpoint to which the request is sent.
 * @param {RequestInit} [options] - Optional custom request options.
 * @returns {Promise<T>} The parsed JSON response wrapped in a Promise.
 * @throws Will throw an error if the HTTP request fails.
 */
export async function apiRequest<T extends Record<string, any> | null>(
  url: string,
  options?: Omit<RequestInit, "headers"> & {
    headers: Record<string, any>;
  }
): Promise<T> {
  const finalOptions: RequestInit = {
    ...options,
    agent: httpsAgent,
  };

  try {
    const response: Response = await fetch(url, finalOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
    }
    const responseData = (await response.json()) as unknown as Record<
      string,
      any
    >;
    // console.log({options, responseData})
    return responseData as T;
  } catch (error: unknown) {
    /* istanbul ignore next */
    const message = error instanceof Error ? error.message : "Error";
    throw new Error(`Request to ${url} failed: ${message}`);
  }
}
