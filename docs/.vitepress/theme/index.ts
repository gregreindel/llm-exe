import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import "./styles.css";

import GenericOutput from "../components/GenericOutput.vue";

import PromptPlayground from "../components/PromptPlayground.vue";
import PromptPlayground2 from "../components/PromptPlayground2.vue";

import PromptMessage from "../components/Prompt/PromptMessage.vue";
import ImportModelNames from "../components/ImportModelNames.vue";

import HomeBeforeIntro from "../components/Layout/HomeBeforeIntro.vue";
import SiteTopBanner from "../components/Layout/SiteTopBanner.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("GenericOutput", GenericOutput);
    app.component("PromptPlayground", PromptPlayground);
    app.component("PromptPlayground2", PromptPlayground2);
    app.component("PromptMessage", PromptMessage);
    app.component("ImportModelNames", ImportModelNames);

    if ((import.meta as any).env.DEV) {
      new EventSource("/esbuild").addEventListener("change", () =>
        location.reload()
      );
    }
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-before": () => h(SiteTopBanner),
      "home-hero-info-before": () => h(HomeBeforeIntro),
    });
  },
} satisfies Theme;
