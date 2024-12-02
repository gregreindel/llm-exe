import { apiRequest } from "@/utils/modules/request";

describe("apiRequest", () => {
  const url = "https://api.example.com/data";
  const dummyData = { key: "value" };

  const jsonMock = jest.fn();
  const textMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock.mockResolvedValue(dummyData);
    textMock.mockResolvedValue("Some error message");
    global.fetch = jest.fn();
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