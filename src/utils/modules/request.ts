
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
    const response: Response = await fetch(url, finalOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}. Error`);
    }
    const responseData = (await response.json()) as unknown as Record<
      string,
      any
    >;
    return responseData as T;
  } catch (error: unknown) {
    /* istanbul ignore next */
    const message = error instanceof Error ? error.message : "Error";
    throw new Error(`Request to ${url} failed: ${message}`);
  }
}
