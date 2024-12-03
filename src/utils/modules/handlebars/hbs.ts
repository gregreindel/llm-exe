import Handlebars from "handlebars";
import { makeHandlebarsInstance } from "@/utils/modules/handlebars/utils/makeHandlebarsInstance";
import { makeHandlebarsInstanceAsync } from "@/utils/modules/handlebars/utils/makeHandlebarsInstanceAsync";

export const hbsAsync = makeHandlebarsInstanceAsync(Handlebars);
export const hbs = makeHandlebarsInstance(Handlebars);