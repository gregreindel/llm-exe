import { mapBody } from "@/llm/_utils.mapBody";
import { Config } from "@/types";

describe("mapBody", () => {
  beforeEach(() => {});

  it("should return an empty object if template is empty", () => {
    const template: Config["mapBody"] = {};
    const body: Record<string, any> = {};

    const result = mapBody(template, body);

    expect(result).toEqual({});
  });

  it("should map body keys based on the template", () => {
    const template: Config["mapBody"] = {
      name: { key: "userName" },
      age: { key: "userAge", default: 18 },
    };
    const body: Record<string, any> = {
      name: "John",
    };

    const result = mapBody(template, body);

    expect(result).toHaveProperty("userName");
    expect(result.userName).toEqual("John");

    expect(result).toHaveProperty("userAge");
    expect(result.userAge).toEqual(18);
  });

  it("should sanitize the value if sanitize function is provided", () => {
    const sanitizeFn = jest.fn().mockReturnValue("SANITIZED");
    const template: Config["mapBody"] = {
      password: { key: "securePassword", sanitize: sanitizeFn },
    };
    const body: Record<string, any> = {
      password: "unsanitized_password",
    };

    const result = mapBody(template, body);

    expect(result).toHaveProperty("securePassword");
    expect(result.securePassword).toEqual("SANITIZED");
    expect(sanitizeFn).toHaveBeenCalledWith(body.password, body, {
      securePassword: "SANITIZED",
    });
  });

  it("should not map if providerSpecificKey is not present in template", () => {
    const template: Config["mapBody"] = {
      name: { default: "NoNameProvided" }, // No key provided
    } as any;
    const body: Record<string, any> = {
      name: "John",
    };

    const result = mapBody(template, body);
    expect(result).toEqual({});
  });

  it("should use default value if body value is undefined", () => {
    const template: Config["mapBody"] = {
      name: { key: "userName", default: "DefaultName" },
    };
    const body: Record<string, any> = {}; // name is missing in body

    const result = mapBody(template, body);
    expect(result.userName).toEqual(template.name.default);
  });

  it("should not map key if value is undefined and no default is provided", () => {
    const template: Config["mapBody"] = {
      name: { key: "userName" },
    };
    const body: Record<string, any> = {};

    const result = mapBody(template, body);

    expect(result).toEqual({});
  });
});
