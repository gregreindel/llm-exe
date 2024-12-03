import { ifFn } from "@/utils/modules/handlebars/helpers/if";
import { unless } from "@/utils/modules/handlebars/helpers/unless";

jest.mock("@/utils/modules/handlebars/helpers/if", () => ({
    ifFn: jest.fn(),
}));

describe("unless", () => {
    const ifFnMock = ifFn as jest.Mock;

    const options = {
      fn: jest.fn().mockReturnValue("fn result"),
      inverse: jest.fn().mockReturnValue("inverse result"),
      hash: {
        key: "value",
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error when called with incorrect number of arguments", () => {
      expect(() => (unless as any).call({}, true)).toThrow(
        "#unless requires exactly one argument"
      );
    });

    it("should call ifFn with correct arguments when conditional is true", () => {
      const context = {
        key: "context value"
      };
      
      const conditional = true;
      
      unless.call(context, conditional, options);

      expect(ifFnMock).toHaveBeenCalledWith(conditional, {
        fn: options.inverse,
        inverse: options.fn,
        hash: options.hash,
      });
    });

    it("should call ifFn with correct arguments when conditional is false", () => {
      const context = {
        key: "context value"
      };
      
      const conditional = false;

      unless.call(context, conditional, options);

      expect(ifFnMock).toHaveBeenCalledWith(conditional, {
        fn: options.inverse,
        inverse: options.fn,
        hash: options.hash,
      });
    });

    it("should correctly handle the provided context", () => {
      const context = {
        key: "context value"
      };

      const conditional = true;
      ifFnMock.mockReturnValue("resolved value");

      const result = unless.call(context, conditional, options);

      expect(ifFnMock).toHaveBeenCalledWith(conditional, {
        fn: options.inverse,
        inverse: options.fn,
        hash: options.hash,
      });

      expect(result).toBe("resolved value");
    });

    it("should return the result of ifFn", () => {
      const conditional = true;
      ifFnMock.mockReturnValue("expected result");

      const result = unless.call({}, conditional, options);

      expect(result).toBe("expected result");
    });
  });