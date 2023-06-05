import { defineUserConfig, defaultTheme } from "vuepress";
import { googleAnalyticsPlugin } from "@vuepress/plugin-google-analytics";

export default defineUserConfig({
  lang: "en-US",
  title: "llm-exe",
  description: "",
  theme: defaultTheme({
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
            link: "/intro",
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
        link: "/llm/",
        collapsible: true,
        children: [
          {
            text: "OpenAi",
            link: "/llm/openai",
            children: [],
          },
          

        ],
      },

      {
        text: "Prompt",
        link: "/prompt",
        collapsible: true,
        children: [
          {
            text: "Text Prompt",
            link: "/prompt/text",
            children: [],
          },
          {
            text: "Chat Prompt",
            link: "/prompt/chat",
            children: [],
          },
          {
            text: "Advanced Templates",
            link: "/prompt/advanced",
            children: [],
          },
        ],
      },
      {
        text: "Parser",
        link: "/parser",
        collapsible: true,

        children: [
          {
            text: "Included Parsers",
            link: "/parser/included-parsers",
            children: [],
          },
          {
            text: "Custom Parsers",
            link: "/parser/custom",
            children: [],
          },
        ],
      },
      {
        text: "LLM Executor",
        link: "/executor/",
        collapsible: true,
        children: [
          {
            text: "Hooks",
            link: "/executor/hooks",
            children: [],
          },
        ],
      },
      {
        text: "State",
        link: "/state/",
        collapsible: true,
        children: [
          {
            text: "Dialogue",
            link: "/state/dialogue",
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
            children: [{
              text: "Executor Function Syntax",
              link: "/examples/FunctionSyntax",
              children: [],
            }, 
            {
              text: "Simple Combining",
              link: "/examples/combining",
              children: [],
            },
            {
              text: "ReAct: Search + Calculator",
              link: "/examples/react",
              children: [],
            },],
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
            children: [          {
              text: "Validator",
              link: "/examples/bots/validator",
              children: [],
            },{
              text: "Intent",
              link: "/examples/bots/intent",
              children: [],
            }],
          },
          {
            text: "Misc",
            link: "",
            children: [{
              text: "Working With JSON",
              link: "/examples/concepts/working-with-json.html"
            }],
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
            link: "/misc/comparing-langchain.md",
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
