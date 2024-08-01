import { apiRequest } from "@/utils/modules/request";
import fetch, { Response } from "node-fetch-commonjs";

jest.mock("node-fetch-commonjs", () => jest.fn());

describe("apiRequest", () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const url = "https://api.example.com/data";
  const dummyData = { key: "value" } 
  
  const jsonMock = jest.fn();
  const textMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock.mockResolvedValue(dummyData);
    textMock.mockResolvedValue("Some error message");
  });

  it("should make a request and return the data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jsonMock
    } as unknown as Response);

    const data = await apiRequest<typeof dummyData>(url);
    expect(data).toEqual(dummyData);
    expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({ agent: expect.anything() }));
  });

  it("should handle HTTP errors correctly", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: textMock,
      json: jest.fn(),
    } as unknown as Response);

    await expect(apiRequest(url)).rejects.toThrow("HTTP error! Status: 404. Some error message");
    expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({ agent: expect.anything() }));
  });

  it("should throw a generic error if the request fails", async () => {
    mockFetch.mockRejectedValue(new Error("Fetch failed"));

    await expect(apiRequest(url)).rejects.toThrow("Request to https://api.example.com/data failed: Fetch failed");
    expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({ agent: expect.anything() }));
  });

  it("should handle null responses correctly", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(null),
    } as unknown as Response);

    const data = await apiRequest<null>(url);
    expect(data).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({ agent: expect.anything() }));
  });

  it("should accept and merge custom request options", async () => {
    const customOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: jsonMock
    } as unknown as Response);

    await apiRequest(url, customOptions);
    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        agent: expect.anything(),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
});