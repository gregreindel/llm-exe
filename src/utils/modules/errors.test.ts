import { LlmExeError } from "./errors";

describe('LlmExeError', () => {
  it('should create an error with default unknown code and empty context', () => {
    const error = new LlmExeError();
    expect(error.code).toBe('unknown');
    expect(error.context).toBe(undefined);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('LlmExeError');
  });

  it('should create an error with custom message, code, and context', () => {
    const context = { provider: "google", model: "gemini", error: "Custom message" };
    const error = new LlmExeError('Custom message', 'llm', context);
    expect(error.message).toBe('Custom message');
    expect(error.code).toBe('llm');
    expect(error.context).toBe(context);
  });

  it('should inherit stack trace capture functionality', () => {
    const error = new LlmExeError();
    expect(error.stack).toBeDefined();
  });
});
