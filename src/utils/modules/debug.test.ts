import { debug } from "./debug";

describe("debug", () => {
let originalDebugEnv: string | undefined;
let consoleDebugSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
originalDebugEnv = process.env.LLM_EXE_DEBUG;
});

beforeEach(() => {
consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
consoleDebugSpy.mockRestore();
consoleErrorSpy.mockRestore();
process.env.LLM_EXE_DEBUG = originalDebugEnv;
});

it("does not log anything if LLM_EXE_DEBUG is undefined", () => {
delete process.env.LLM_EXE_DEBUG;
debug("Hello World");
expect(consoleDebugSpy).not.toHaveBeenCalled();
});

it("does not log anything if LLM_EXE_DEBUG is empty string", () => {
process.env.LLM_EXE_DEBUG = "";
debug("Hello World");
expect(consoleDebugSpy).not.toHaveBeenCalled();
});

it("does not log anything if LLM_EXE_DEBUG is 'undefined'", () => {
process.env.LLM_EXE_DEBUG = "undefined";
debug("Hello World");
expect(consoleDebugSpy).not.toHaveBeenCalled();
});

it("does not log anything if LLM_EXE_DEBUG is 'null'", () => {
process.env.LLM_EXE_DEBUG = "null";
debug("Hello World");
expect(consoleDebugSpy).not.toHaveBeenCalled();
});

it("logs when LLM_EXE_DEBUG is a non-empty, non-'null', non-'undefined' string", () => {
process.env.LLM_EXE_DEBUG = "true";
debug("Hello World");
expect(consoleDebugSpy).toHaveBeenCalledWith("Hello World");
});

it("handles string arguments", () => {
process.env.LLM_EXE_DEBUG = "true";
debug("test-string");
expect(consoleDebugSpy).toHaveBeenCalledWith("test-string");
});

it("handles numeric arguments", () => {
process.env.LLM_EXE_DEBUG = "true";
debug(1234);
expect(consoleDebugSpy).toHaveBeenCalledWith(1234);
});

it("handles boolean arguments", () => {
process.env.LLM_EXE_DEBUG = "true";
debug(true);
debug(false);
expect(consoleDebugSpy).toHaveBeenCalledWith(true);
expect(consoleDebugSpy).toHaveBeenCalledWith(false);
});

it("handles Error objects (does not push them to logs)", () => {
process.env.LLM_EXE_DEBUG = "true";
const error = new Error("test error");
debug(error);
// The function has a branch for Error, but adds nothing to logs
expect(consoleDebugSpy).toHaveBeenCalledWith(); // no args printed
});

it("handles arrays", () => {
process.env.LLM_EXE_DEBUG = "true";
debug([1, 2, 3]);
// We expect each item in array to be stringified
expect(consoleDebugSpy).toHaveBeenCalledWith([
JSON.stringify(1, null, 2),
JSON.stringify(2, null, 2),
JSON.stringify(3, null, 2),
]);
});

it("handles Maps", () => {
process.env.LLM_EXE_DEBUG = "true";
const testMap = new Map();
testMap.set("key1", "value1");
testMap.set("key2", { nested: true });
debug(testMap);
// The map is turned into an array of "key: value" strings
expect(consoleDebugSpy).toHaveBeenCalledWith([
`key1: ${JSON.stringify("value1", null, 2)}`,
`key2: ${JSON.stringify({ nested: true }, null, 2)}`,
]);
});

it("handles Sets", () => {
process.env.LLM_EXE_DEBUG = "true";
const testSet = new Set([1, { a: "b" }, true]);
debug(testSet);
// The set is turned into an array of JSON-ified items
expect(consoleDebugSpy).toHaveBeenCalledWith([
JSON.stringify(1, null, 2),
JSON.stringify({ a: "b" }, null, 2),
JSON.stringify(true, null, 2),
]);
});

it("handles Dates", () => {
process.env.LLM_EXE_DEBUG = "true";
const date = new Date("2020-01-01T00:00:00.000Z");
debug(date);
// It should log ISO string
expect(consoleDebugSpy).toHaveBeenCalledWith(date.toISOString());
});

it("handles RegExp", () => {
process.env.LLM_EXE_DEBUG = "true";
const regex = /test/i;
debug(regex);
expect(consoleDebugSpy).toHaveBeenCalledWith(regex.toString());
});

it("handles generic objects", () => {
process.env.LLM_EXE_DEBUG = "true";
const obj = { foo: "bar" };
debug(obj);
expect(consoleDebugSpy).toHaveBeenCalledWith(JSON.stringify(obj, null, 2));
});

it("handles circular object (triggers JSON parse error)", () => {
process.env.LLM_EXE_DEBUG = "true";
const circularObj: any = {};
circularObj.ref = circularObj;
debug(circularObj);
expect(consoleErrorSpy).toHaveBeenCalledWith(
"Error parsing object:",
expect.any(Error)
);
// No final push for console.debug on the circular object value
expect(consoleDebugSpy).toHaveBeenCalledWith();
});
});