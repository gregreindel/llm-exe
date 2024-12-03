import Handlebars from "handlebars";
import { makeHandlebarsInstance } from "./makeHandlebarsInstance";
import { _registerPartials } from "@/utils/modules/handlebars/utils/registerPartials";
// import { registerHelpers } from "@/utils/modules/handlebars/utils/registerHelpers";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import * as contextPartials from "@/utils/modules/handlebars/templates";
// import * as helpers from "@/utils/modules/handlebars/helpers";

jest.mock("@/utils/modules/handlebars/utils/registerPartials");
// jest.mock("@/utils/modules/handlebars/utils/registerHelpers");
jest.mock("@/utils/modules/getEnvironmentVariable");
jest.mock("@/utils/modules/handlebars/templates");
jest.mock("@/utils/modules/handlebars/helpers");

describe("makeHandlebarsInstance", () => {
    let handlebarsInstance = makeHandlebarsInstance(Handlebars);
    // ReturnType<typeof makeHandlebarsInstance>;

    beforeEach(() => {
        (getEnvironmentVariable as jest.Mock).mockReturnValue(undefined);
        // handlebarsInstance = makeHandlebarsInstance(Handlebars);
    });

    it("should create a new Handlebars instance", () => {
        expect(handlebarsInstance).toBeDefined();
    });

    it("should register 'with' helper", () => {
        expect(handlebarsInstance.helpers.with).toBeDefined();
    });

    it("should register 'cut' helper", () => {
        expect(handlebarsInstance.helpers.cut).toBeDefined();
    });

    it("should register 'substring' helper", () => {
        expect(handlebarsInstance.helpers.substring).toBeDefined();
    });

    it("should register 'unless' helper", () => {
        expect(handlebarsInstance.helpers.unless).toBeDefined();
    });

    it("should register 'hbsInTemplate' helper", () => {
        expect(handlebarsInstance.helpers.hbsInTemplate).toBeDefined();
    });


    it("should register 'hbsInTemplate' helper", () => {
        expect(handlebarsInstance.helpers.hbsInTemplate.call(null, "Hello {{world}}!", {world: "World"})).toBeDefined();
    });


    it("should register custom helpers if CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH is set", () => {
        const mockHelpers = { customHelper: jest.fn() };
        (getEnvironmentVariable as jest.Mock).mockReturnValue("/path/to/helpers");
        jest.mock("/path/to/helpers", () => mockHelpers, { virtual: true });

        handlebarsInstance = makeHandlebarsInstance(Handlebars);
        expect(handlebarsInstance.helpers.customHelper).toBeDefined();

        // expect(registerHelpers).toHaveBeenCalledWith(
        //     expect.arrayContaining([{ handler: mockHelpers.customHelper, name: "customHelper" }]),
        //     handlebarsInstance
        // );
    });

    it("should register context partials", () => {
        (contextPartials as any).partials = { partial1: "<div>Partial 1</div>" };
        handlebarsInstance = makeHandlebarsInstance(Handlebars);

        expect(handlebarsInstance.partials.partial1).toBeDefined();
    });

    it("should register custom partials if CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH is set", () => {
        const mockPartials = { customPartial: "<div>Custom Partial</div>" };
        (getEnvironmentVariable as jest.Mock).mockReturnValue("/path/to/partials");
        jest.mock("/path/to/partials", () => mockPartials, { virtual: true });

        handlebarsInstance = makeHandlebarsInstance(Handlebars);

        expect(_registerPartials).toHaveBeenCalledWith(
            expect.arrayContaining([{ name: "customPartial", template: mockPartials.customPartial }]),
            handlebarsInstance
        );
    });
});