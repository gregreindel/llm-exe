import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

describe("replaceTemplateString", () => {
  it("replaceTemplateString replaces template", async () => {
    expect(replaceTemplateString("hello {{var}}", { var: "world" })).toBe(
      "hello world"
    );
  });
  it("replaceTemplateString returns if passed nothing", async () => {
    expect(replaceTemplateString(undefined as any, { var: "world" })).toBe("");
  });
  it("replaceTemplateString returns if passed nothing", async () => {
    expect(replaceTemplateString(null as any)).toBe("");
  });
  it("replaceTemplateString replaces template with custom helper", async () => {
    const helpers = [
      {
        handler: () => "from function",
        name: "helperFromConfig",
      },
    ];
    expect(
      replaceTemplateString("hello {{helperFromConfig}}", {}, { helpers })
    ).toBe("hello from function");
  });
  it("replaceTemplateString replaces template with custom partial", async () => {
    const partials = [
      {
        template: "from partial",
        name: "partialFromConfig",
      },
    ];
    expect(
      replaceTemplateString("hello {{>partialFromConfig}}", {}, { partials })
    ).toBe("hello from partial");
  });

  describe("validateInput", () => {
    it("does not warn or throw by default", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      const result = replaceTemplateString("hello {{name}}", {});
      expect(result).toBe("hello ");
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("warns on missing variables in warn mode", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      const result = replaceTemplateString("hello {{name}}", {}, {
        validateInput: "warn",
      });
      expect(result).toBe("hello ");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Missing template variable(s): name")
      );
      warnSpy.mockRestore();
    });

    it("throws on missing variables in strict mode", () => {
      expect(() =>
        replaceTemplateString("hello {{name}}", {}, {
          validateInput: "strict",
        })
      ).toThrow("Missing template variable(s): name");
    });

    it("does not warn when all variables are provided", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      replaceTemplateString("hello {{name}}", { name: "world" }, {
        validateInput: "warn",
      });
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("does not throw when all variables are provided", () => {
      expect(() =>
        replaceTemplateString("hello {{name}}", { name: "world" }, {
          validateInput: "strict",
        })
      ).not.toThrow();
    });

    it("excludes registered helpers from missing variable check", () => {
      const helpers = [
        { handler: () => "val", name: "myHelper" },
      ];
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      replaceTemplateString("{{myHelper}}", {}, {
        validateInput: "warn",
        helpers,
      });
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("reports multiple missing variables", () => {
      expect(() =>
        replaceTemplateString("{{a}} {{b}} {{c}}", { b: "ok" }, {
          validateInput: "strict",
        })
      ).toThrow("Missing template variable(s): a, c");
    });
  });
});
