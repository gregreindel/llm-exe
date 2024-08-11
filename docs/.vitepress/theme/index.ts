import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";

// import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
// import "@shikijs/twoslash/style-rich.css";
// import "floating-vue/dist/style.css";
// import "@shikijs/vitepress-twoslash/style-core.css";

// @ts-ignore
import DialogueOutput from "../components/DialogueOutput.vue";
// @ts-ignore
import PromptOutput from "../components/PromptOutput.vue";
// @ts-ignore
import HomeBeforeIntro from "../components/Layout/HomeBeforeIntro.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // app.use(TwoslashFloatingVue);
    app.component("PromptOutput", PromptOutput);
    app.component("DialogueOutput", DialogueOutput);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "home-hero-info-before": () => h(HomeBeforeIntro),
    });
  },
} satisfies Theme;
