import { defineUserConfig, defaultTheme } from "vuepress";
import { googleAnalyticsPlugin } from "@vuepress/plugin-google-analytics";

export default defineUserConfig({
  lang: "en-US",
  title: "llm-exe",
  description: "",
  head: [
    [
      "link",
      { rel: "icon", href: "/images/favicon.ico" },
      { rel: "canonical", href: "https://llm-exe.com" },
    ],[
      "meta",
      { property: "og:image", content: "/images/llm-exe-featured.jpg" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Typescript LLM Utilities" },
      { property: "og:url", content: "https://llm-exe.com" },
      { property: "og:site_name", content: "llm-exe" },
      {
        property: "og:description",
        content:
          "A package that provides utilities, wrappers, and base abstractions to help make writing applications with llm-powered functions easier.",
      }
    ],
  ],
  theme: defaultTheme({
    logo: "/images/logo.png",
    navbar: [
      {
        text: "Home",
        link: "/",
      },
      {
        text: "Github",
        link: "https://github.com/gregreindel/llm-exe",
      },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/llm-exe",
      },
    ],
    sidebar: [
      {
        text: "Getting Started",
        link: "",
        collapsible: true,
        children: [
          {
            text: "Intro",
            link: "/intro/index.html",
            children: [],
          },
          {
            text: "What's a LLM Function",
            link: "/intro/what_is_llm_function.html",
            children: [],
          },
        ],
      },
      {
        text: "LLM",
        link: "/llm/index.html",
        collapsible: true,
        children: [
          {
            text: "OpenAi",
            link: "/llm/openai.html",
            children: [],
          },
        ],
      },

      {
        text: "Prompt",
        link: "/prompt/index.html",
        collapsible: true,
        children: [
          {
            text: "Text Prompt",
            link: "/prompt/text.html",
            children: [],
          },
          {
            text: "Chat Prompt",
            link: "/prompt/chat.html",
            children: [],
          },
          {
            text: "Advanced Templates",
            link: "/prompt/advanced.html",
            children: [],
          },
        ],
      },
      {
        text: "Parser",
        link: "/parser/index.html",
        collapsible: true,

        children: [
          {
            text: "Included Parsers",
            link: "/parser/included-parsers.html",
            children: [],
          },
          {
            text: "Custom Parsers",
            link: "/parser/custom.html",
            children: [],
          },
        ],
      },
      {
        text: "LLM Executor",
        link: "/executor/index.html",
        collapsible: true,
        children: [
          {
            text: "Hooks",
            link: "/executor/hooks.html",
            children: [],
          },
        ],
      },
      {
        text: "State",
        link: "/state/index.html",
        collapsible: true,
        children: [
          {
            text: "Dialogue",
            link: "/state/dialogue.html",
            children: [],
          },
        ],
      },
      {
        text: "Examples",
        link: "",
        collapsible: true,
        children: [
          {
            text: "Concepts",
            link: "",
            children: [
              {
                text: "Executor Function Syntax",
                link: "/examples/FunctionSyntax.html",
                children: [],
              },
              {
                text: "Simple Combining",
                link: "/examples/combining.html",
                children: [],
              },
              {
                text: "ReAct: Search + Calculator",
                link: "/examples/react.html",
                children: [],
              },
              {},
            ],
          },
          // {
          //   text: "LLM Functions",
          //   link: "/examples/FunctionSyntax",
          //   children: [],
          // },
          // {
          //   text: "Executor Function Syntax",
          //   link: "/examples/FunctionSyntax",
          //   children: [],
          // },
          {
            text: "LLM Functions",
            link: "",
            children: [
              {
                text: "Validator",
                link: "/examples/bots/validator.html",
                children: [],
              },
              {
                text: "Intent",
                link: "/examples/bots/intent.html",
                children: [],
              },
              {
                text: "Extractor",
                link: "/examples/bots/extract.html",
                children: [],
              },
            ],
          },
          {
            text: "Misc",
            link: "",
            children: [
              {
                text: "Working With JSON",
                link: "/examples/concepts/working-with-json.html",
              },
              {
                text: "Replicating Lex",
                link: "/examples/concepts/replicating-lex.html",
              },
            ],
          },
          // {
          //   text: "ReAct: Search + Calculator",
          //   link: "/examples/react",
          //   children: [],
          // },
        ],
      },
      {
        text: "Other",
        link: "",
        collapsible: true,
        children: [
          // SidebarItem
          {
            text: "Comparing to Langchain",
            link: "/misc/comparing-langchain.html",
            children: [],
          },
        ],
      },
    ],
  }),
  plugins: [
    googleAnalyticsPlugin({
      id: process.env.NODE_ENV !== "development" ? "G-5YTJ8HRXNF" : "",
    }),
  ],
});
