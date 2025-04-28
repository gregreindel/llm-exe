import { debug } from "./debug";
import { isValidUrl } from "./isValidUrl";

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
  };

  try {
    debug(url, finalOptions);
    
    if(!url || !isValidUrl(url)) {
      throw new Error("Invalid URL");
    }

    const response: Response = await fetch(url, finalOptions);
    if (!response.ok) {
      let message = `HTTP error. Status: ${response.status}. Error Message: ${
        response?.statusText || "Unknown error."
      }`;
      if (url.startsWith("https://api.openai.com/")) {
        try {
          const body = await response.json();
          message = `HTTP error. Status Code: ${
            response.status
          }. Error Message: ${
            body?.error?.message || "No further details provided."
          }`;
        } catch (error) {
          // just use default error messaging
        }
      }
      throw new Error(message);
    }

    if (response.headers.get("content-type")?.includes("application/json")) {
      const responseData = (await response.json()) as unknown as Record<
        string,
        any
      >;
      return responseData as T;
    } else {
      const responseData = (await response.text()) as unknown as Record<
        string,
        any
      >;
      return responseData as T;
    }
  } catch (error: unknown) {
    /* istanbul ignore next */
    const message = error instanceof Error ? error.message : "Error";
    throw new Error(`Request to ${url} failed: ${message}`);
  }
}
