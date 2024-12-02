import Handlebars from "handlebars";
import { useHandlebars } from "@/utils/modules/handlebars";
import { makeHandlebarsInstanceAsync } from "@/utils/modules/handlebars/utils/makeHandlebarsInstanceAsync";

const __hbsAsync = makeHandlebarsInstanceAsync(Handlebars);
const __hbs = Handlebars.create()

export const hbsAsync = useHandlebars(__hbsAsync, true);
export const hbs = useHandlebars(__hbs);