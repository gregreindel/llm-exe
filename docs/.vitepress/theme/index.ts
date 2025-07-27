import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import "./styles.css";
import "./custom-shiki-theme.css";
import "./mobile-fix.css";

import GenericOutput from "../components/GenericOutput.vue";

// import PromptPlayground from "../components/PromptPlayground.vue";
// import PromptPlayground2 from "../components/PromptPlayground2.vue";

import PromptMessage from "../components/Prompt/PromptMessage.vue";
import ImportModelNames from "../components/ImportModelNames.vue";
import ExamplesBlock from "../components/ExamplesBlock.vue";
import ExamplesBlocks from "../components/ExamplesBlocks.vue";
import ExamplesFilters from "../components/ExamplesFilters.vue";

import HomeBeforeIntro from "../components/Layout/HomeBeforeIntro.vue";
import SiteTopBanner from "../components/Layout/SiteTopBanner.vue";
import ExampleSingleBefore from "../components/ExampleSingleBefore.vue";
import HomeAfterIntro from "../components/Layout/HomeAfterIntro.vue";
import HeroImageCode from "../components/Layout/HeroImageCode.vue";
import ModelCodeSwitcher from "../components/ModelCodeSwitcher.vue";

const packageId = (import.meta as any).env.VITE_PACKAGE_ID || "";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("HomeAfterIntro", HomeAfterIntro);
    app.component("GenericOutput", GenericOutput);
    // app.component("PromptPlayground", PromptPlayground);
    // app.component("PromptPlayground2", PromptPlayground2);
    app.component("PromptMessage", PromptMessage);
    app.component("ImportModelNames", ImportModelNames);
    app.component("ExamplesBlock", ExamplesBlock);
    app.component("ExamplesBlocks", ExamplesBlocks);
    app.component("ExamplesFilters", ExamplesFilters);
    app.component("ModelCodeSwitcher", ModelCodeSwitcher);
    if ((import.meta as any).env.DEV) {
      new EventSource("/esbuild").addEventListener("change", () =>
        location.reload()
      );
    }
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-before": () => h(SiteTopBanner, { packageId }),
      "home-hero-info-before": () => h(HomeBeforeIntro),
      "home-hero-image": () => h(HeroImageCode),
      "doc-before": () => h(ExampleSingleBefore),
    });
  },
} satisfies Theme;
