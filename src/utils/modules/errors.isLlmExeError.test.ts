import { LlmExeError } from "./errors";
import { isLlmExeError } from "./errors.isLlmExeError";


jest.mock("./errors", () => ({
  LlmExeError: jest
    .fn()
    .mockImplementation(function (this: any, code: string) {
      this.code = code;
    }),
}));

describe("isLlmExeError", () => {
  const LlmExeErrorMock = LlmExeError as unknown as jest.Mock;

  beforeEach(() => {
    LlmExeErrorMock.mockClear();
  });

  it("returns true when error is an instance of LlmExeError and code matches", () => {
    const error = new LlmExeErrorMock("CODE1");

    expect(isLlmExeError(error, "CODE1" as any)).toBe(true);
  });

  it("returns true when error is an instance of LlmExeError and no code is provided", () => {
    const error = new LlmExeErrorMock("CODE1");
    expect(isLlmExeError(error)).toBe(true);
  });

  it("returns false when error is not an instance of LlmExeError", () => {
    const error = new Error();

    expect(isLlmExeError(error, "CODE1" as any)).toBe(false);
  });

  it("returns false when error is an instance of LlmExeError but code does not match", () => {
    const error = new LlmExeErrorMock("CODE3");

    expect(isLlmExeError(error, "CODE1" as any)).toBe(false);
  });

  it("returns false when error is an instance of LlmExeError but code is not in the array", () => {
    const error = new LlmExeErrorMock("CODE4");

    expect(isLlmExeError(error, ["CODE1", "CODE2"] as any)).toBe(false);
  });
});
