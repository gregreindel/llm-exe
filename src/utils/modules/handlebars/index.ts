import { _hbs, _hbsAsync } from "./hbs";
import { _registerHelpers } from "./utils/registerHelpers";
import { _registerPartials } from "./utils/registerPartials";

export const hbs = {
  handlebars: _hbs,
  registerHelpers: (helpers: any[]) => {
    _registerHelpers(helpers, _hbs);
  },
  registerPartials: (partials: any[]) => {
    _registerPartials(partials, _hbs);
  },
};

export const hbsAsync = {
  handlebars: _hbsAsync,
  registerHelpers: (helpers: any[]) => {
    _registerHelpers(helpers, _hbsAsync);
  },
  registerPartials: (partials: any[]) => {
    _registerPartials(partials, _hbsAsync);
  },
};
