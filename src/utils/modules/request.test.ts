import { apiRequest } from "@/utils/modules/request";

global.fetch = jest.fn();

describe("apiRequest", () => {
  const url = "https://api.example.com/data";
  const dummyData = { key: "value" };

  const jsonMock = jest.fn();
  const textMock = jest.fn();
  const globalFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock.mockResolvedValue(dummyData);
    textMock.mockResolvedValue("Some error message");
  });

  it("should make a request and return the data", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jsonMock
    } as unknown as Response);

    const data = await apiRequest<typeof dummyData>(url);
    expect(data).toEqual(dummyData);
    expect(global.fetch).toHaveBeenCalledWith(url, {});
  });

  it("should handle HTTP errors correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      text: textMock,
      json: jest.fn(),
    } as unknown as Response);

    await expect(apiRequest(url)).rejects.toThrow(`Request to ${url} failed: HTTP error. Status: 404. Error Message: Unknown error.`);
    expect(global.fetch).toHaveBeenCalledWith(url,  {})
  });

  it("should throw a generic error if the request fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

    await expect(apiRequest(url)).rejects.toThrow("Request to https://api.example.com/data failed: Fetch failed");
    expect(global.fetch).toHaveBeenCalledWith(url, {});
  });


  // it("should throw a useful error if the request is openai and it fails", async () => {
  //   (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));
  //   const iaiUrl = `https://api.openai.com/something`
  //   await expect(apiRequest(iaiUrl)).rejects.toThrow("Request to "+iaiUrl+" failed: Fetch failed");
  //   expect(global.fetch).toHaveBeenCalledWith(url, {});
  // });
  it("should handle HTTP errors correctly", async () => {
    (globalFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      text: textMock,
      json: jest.fn().mockResolvedValue(JSON.stringify({error: {message: 'No further details provided.'}})),
    } as unknown as Response);

     const oaiUrl = `https://api.openai.com/something`

    await expect(apiRequest(oaiUrl)).rejects.toThrow(`Request to ${oaiUrl} failed: HTTP error. Status Code: 404. Error Message: No further details provided.`);
  });
  

  it("should handle null responses correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(null),
    } as unknown as Response);

    const data = await apiRequest<null>(url);
    expect(data).toBe(null);
    expect(global.fetch).toHaveBeenCalledWith(url, {});
  });

  it("should accept and merge custom request options", async () => {
    const customOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jsonMock
    } as unknown as Response);

    await apiRequest(url, customOptions);
    expect(global.fetch).toHaveBeenCalledWith(
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