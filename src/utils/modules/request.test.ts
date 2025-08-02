import { apiRequest } from "@/utils/modules/request";

const fetchMock = jest.fn();

jest.mock('node:fetch', () => ({
  __esModule: true,
  default: fetchMock
}));

const originalFetch = global.fetch;
Object.defineProperty(global, 'fetch', {
  configurable: true,
  get: () => fetchMock
});

afterAll(() => {
  Object.defineProperty(global, "fetch", {
    configurable: true,
    get: () => originalFetch,
  });
});

describe("apiRequest", () => {
  const url = "https://api.example.com/data";
  const dummyData = { key: "value" };

  const jsonMock = jest.fn();
  const textMock = jest.fn();
  const globalFetch = fetchMock as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock.mockResolvedValue(dummyData);
    textMock.mockResolvedValue("Some error message");
  });
  it("should make error early without a url", async () => {
    await expect(apiRequest("")).rejects.toThrow(`Invalid URL`);
  });
  it("should make error early without a valid url", async () => {
    await expect(apiRequest("not-a-url")).rejects.toThrow(`Invalid URL`);
  });
  it("should make a request and return the data", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jsonMock,
      headers: new Headers({
        "content-type": "application/json",
      }),
    } as unknown as Response);

    const data = await apiRequest<typeof dummyData>(url);
    expect(data).toEqual(dummyData);
    expect(fetchMock).toHaveBeenCalledWith(url, {});
  });

  it("should make a request and return the data as text according to headers ", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jsonMock,
      text: textMock,
      headers: new Headers({
        "content-type": "application/x-ndjson", // not json
      }),
    } as unknown as Response);
    const mockJsonl = JSON.stringify({ testing: "jsonl" });
    textMock.mockResolvedValue(mockJsonl);
    const data = await apiRequest<typeof dummyData>(url);
    expect(data).toEqual(mockJsonl);
    expect(fetchMock).toHaveBeenCalledWith(url, {});
  });

  it("should handle HTTP errors correctly", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      text: textMock,
      json: jest.fn(),
      headers: new Headers({
        "content-type": "application/json",
      }),
    } as unknown as Response);

    await expect(apiRequest(url)).rejects.toThrow(
      `Request to ${url} failed: HTTP error. Status: 404. Error Message: Unknown error.`
    );
    expect(fetchMock).toHaveBeenCalledWith(url, {});
  });

  it("should throw a generic error if the request fails", async () => {
    fetchMock.mockRejectedValue(new Error("Fetch failed"));

    await expect(apiRequest(url)).rejects.toThrow(
      "Request to https://api.example.com/data failed: Fetch failed"
    );
    expect(fetchMock).toHaveBeenCalledWith(url, {});
  });


  it("should handle HTTP errors correctly", async () => {
    globalFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: textMock,
      json: jest
        .fn()
        .mockResolvedValue(
          JSON.stringify({ error: { message: "No further details provided." } })
        ),
      headers: new Headers({
        "content-type": "application/json",
      }),
    } as unknown as Response);

    const oaiUrl = `https://api.openai.com/something`;

    await expect(apiRequest(oaiUrl)).rejects.toThrow(
      `Request to ${oaiUrl} failed: HTTP error. Status Code: 404. Error Message: No further details provided.`
    );
  });
  

  it("should handle null responses correctly", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(null),
      headers: new Headers({
        "content-type": "application/json",
      }),
    } as unknown as Response);

    const data = await apiRequest<null>(url);
    expect(data).toBe(null);
    expect(fetchMock).toHaveBeenCalledWith(url, {});
  });

  it("should accept and merge custom request options", async () => {
    const customOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: jsonMock,
      headers: new Headers({
        "content-type": "application/json",
      }),
    } as unknown as Response);

    await apiRequest(url, customOptions);
    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

});