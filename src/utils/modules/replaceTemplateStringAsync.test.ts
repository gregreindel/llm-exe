import { replaceTemplateStringAsync } from "@/utils/modules/replaceTemplateStringAsync";

describe("replaceTemplateStringAsync", () => {
  it("replaceTemplateStringAsync replaces template", async () => {
    
    expect(replaceTemplateStringAsync("hello {{var}}", { var: "world" })).resolves.toBe(
      "hello world"
    );
  });
  it("replaceTemplateStringAsync returns if passed nothing", async () => {
    expect(replaceTemplateStringAsync(undefined as any, { var: "world" })).resolves.toBe(
      ""
    );
  });
  it("replaceTemplateStringAsync returns if passed nothing", async () => {
    expect(replaceTemplateStringAsync(null as any)).resolves.toBe("");
  });
  it("replaceTemplateStringAsync replaces template with custom helper", async () => {
    const helpers = [
      {
        handler: () => "from function",
        name: "helperFromConfig",
      },
    ];
    expect(
      replaceTemplateStringAsync("hello {{helperFromConfig}}", {}, { helpers })
    ).resolves.toBe("hello from function");
  });
  it("replaceTemplateStringAsync replaces template with custom partial", async () => {
    const partials = [
      {
        template: "from partial",
        name: "partialFromConfig",
      },
    ];
    expect(
      replaceTemplateStringAsync(
        "hello {{>partialFromConfig}}",
        {},
        { partials }
      )
    ).resolves.toBe("hello from partial");
  });

  describe("validateInput", () => {
    it("warns on missing variables in warn mode", async () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      await replaceTemplateStringAsync("hello {{name}}", {}, {
        validateInput: "warn",
      });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Missing template variable(s): name")
      );
      warnSpy.mockRestore();
    });

    it("throws on missing variables in strict mode", async () => {
      await expect(
        replaceTemplateStringAsync("hello {{name}}", {}, {
          validateInput: "strict",
        })
      ).rejects.toThrow("Missing template variable(s): name");
    });

    it("does not warn when all variables are provided", async () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      await replaceTemplateStringAsync("hello {{name}}", { name: "world" }, {
        validateInput: "warn",
      });
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
