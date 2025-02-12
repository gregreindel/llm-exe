import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import './styles.css';

// import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
// import "@shikijs/twoslash/style-rich.css";
// import "floating-vue/dist/style.css";
// import "@shikijs/vitepress-twoslash/style-core.css";

// @ts-ignore
import GenericOutput from "../components/GenericOutput.vue";
// @ts-ignore
import PromptPlayground from "../components/PromptPlayground.vue";
// @ts-ignore
import PromptMessage from "../components/Prompt/PromptMessage.vue";


// @ts-ignore
import HomeBeforeIntro from "../components/Layout/HomeBeforeIntro.vue";
import SiteTopBanner from "../components/Layout/SiteTopBanner.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // app.use(TwoslashFloatingVue);
    app.component("GenericOutput", GenericOutput);
    app.component("PromptPlayground", PromptPlayground);
    app.component("PromptMessage", PromptMessage);

    if(import.meta.env.DEV){
      new EventSource('/esbuild').addEventListener('change', () => location.reload())
    }
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-before":  () => h(SiteTopBanner),
      "home-hero-info-before": () => h(HomeBeforeIntro),
    });
  },
} satisfies Theme;
