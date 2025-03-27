import { defineConfig } from "vitepress";
// import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "llm-exe",
  description: "",
  lang: "en-US",
  head: [
    [
      "link",
      { rel: "icon", href: "https://assets.llm-exe.com/favicon.ico" },
      { rel: "canonical", href: "https://llm-exe.com" } as any,
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://assets.llm-exe.com/llm-exe-featured.jpg",
      },
    ],
    ["meta", { property: "og:locale", content: "en_US" } as any],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Typescript LLM Utilities" }],
    ["meta", { property: "og:url", content: "https://llm-exe.com" }],
    ["meta", { property: "og:site_name", content: "llm-exe" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "A package that provides utilities, wrappers, and base abstractions to help make writing applications with llm-powered functions easier.",
      },
    ],
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-5YTJ8HRXNF' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-5YTJ8HRXNF');`
    ],
    ["script", { src: "http://assets.llm-exe.com/llm-exe-browser-utils.js" }],
  ],
  themeConfig: {
    logo: "https://assets.llm-exe.com/logo.png",
    nav: [
      {
        text: "Guide",
        items: [
          {
            text: "Getting Started",
            link: "/intro/install.html",
          },
          {
            text: "Installation",
            link: "/intro/install.html",
          },
          {
            text: "What's a LLM Function",
            link: "/intro/what_is_llm_function.html",
          },
        ],
      },
      {
        text: "References",
        items: [
          {
            text: "Prompt",
            link: "/prompt/index.html",
          },
          {
            text: "Parser",
            link: "/parser/index.html",
          },
          {
            text: "State",
            link: "/state/index.html",
          },
          {
            text: "LLM",
            link: "/llm/index.html",
          },
          {
            text: "LLM Executor",
            link: "/executor/index.html",
          },
          {
            text: "Embeddings",
            link: "/embeddings/index.html",
          },
        ],
      },
      { text: "Examples", link: "/examples" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        link: "",
        collapsed: false,
        items: [
          {
            text: "Installation",
            link: "/intro/install.html",
            items: [],
          },
          {
            text: "Intro",
            link: "/intro/index.html",
            items: [],
          },
          {
            text: "What's a LLM Function",
            link: "/intro/what_is_llm_function.html",
            items: [],
          },
        ],
      },
      {
        text: "LLM",
        link: "/llm/index.html",
        collapsed: false,
        items: [
          {
            text: "Generic Options",
            link: "/llm/generic.html",
            items: [],
          },
          {
            text: "OpenAi",
            link: "/llm/openai.html",
            items: [],
          },
          {
            text: "Anthropic",
            link: "/llm/anthropic.html",
            items: [],
          },
          {
            text: "Google Gemini",
            link: "/llm/gemini.html",
            items: [],
          },
          {
            text: "AWS Bedrock",
            link: "/llm/bedrock/index.html",
            items: [
              {
                text: "Anthropic",
                link: "/llm/bedrock/anthropic.html",
                items: [],
              },
              {
                text: "Meta",
                link: "/llm/bedrock/meta.html",
                items: [],
              },
            ],
          },
          {
            text: "xAI",
            link: "/llm/xai.html",
            items: [],
          },
          {
            text: "Ollama",
            link: "/llm/ollama.html",
            items: [],
          },
        ],
      },
      {
        text: "Prompt",
        collapsed: true,
        items: [
          {
            text: "Getting Started",
            link: "/prompt/index.html",

            items: [],
          },          {
            text: "Chat Prompt",
            link: "/prompt/chat.html",
            items: [],
          },
          {
            text: "Text Prompt",
            link: "/prompt/text.html",
            items: [],
          },

          {
            text: "Advanced Templates",
            link: "/prompt/advanced.html",
            items: [],
          },
          {
            text: "Playground",
            link: "/prompt/playground.html",
            items: [],
          },
        ],
      },
      {
        text: "Parser",
        link: "/parser/index.html",
        collapsed: true,
        items: [
          {
            text: "Getting Started",
            link: "/parser/index.html",
          },{
            text: "Included Parsers",
            link: "/parser/included-parsers.html",
          },
          {
            text: "Custom Parsers",
            link: "/parser/custom.html",
          },
        ],
      },
      {
        text: "State",
        link: "/state/index.html",
        collapsed: true,
        items: [
          {
            text: "Dialogue",
            link: "/state/dialogue.html",
          },
        ],
      },
      {
        text: "LLM Executor",
        collapsed: true,
        items: [
          {
            text: "Getting Started",
            link: "/executor/index.html",
          },
          {
            text: "Functions (tools)",
            link: "/executor/openai-functions.html",
          },
          {
            text: "Hooks",
            link: "/executor/hooks.html",
          },
        ],
      },
      {
        text: "Embeddings",
        collapsed: true,
        items: [
          {
            text: "Getting Started",
            link: "/embeddings/index.html",
          },
          {
            text: "OpenAi",
            link: "/embeddings/openai.html",
          },
          {
            text: "Amazon",
            link: "/embeddings/amazon.html",
          },
        ]
      },
      {
        text: "Examples",
        link: "/examples",
        collapsed: true,
        items: [
          {
            text: "Concepts",
            link: "",
            items: [
              {
                text: "Executor Function Syntax",
                link: "/examples/FunctionSyntax.html",
              },
              {
                text: "Simple Combining",
                link: "/examples/combining.html",
              },
              {
                text: "ReAct: Search + Calculator",
                link: "/examples/react.html",
              },
              {},
            ],
          },
          // {
          //   text: "LLM Functions",
          //   link: "/examples/FunctionSyntax",
          // },
          // {
          //   text: "Executor Function Syntax",
          //   link: "/examples/FunctionSyntax",
          // },
          {
            text: "LLM Functions",
            link: "",
            items: [
              {
                text: "Hello World",
                link: "/examples/bots/hello.html",
              },
              {
                text: "Validator",
                link: "/examples/bots/validator.html",
              },
              {
                text: "Intent",
                link: "/examples/bots/intent.html",
              },
              {
                text: "Extractor",
                link: "/examples/bots/extract.html",
              },
            ],
          },
          {
            text: "Misc",
            link: "",
            items: [
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
          // },
        ],
      },
      // {
      //   text: "Other",
      //   link: "",
      //   collapsed: true,
      //   items: [
      //     // SidebarItem
      //     {
      //       text: "Comparing to Langchain",
      //       link: "/misc/comparing-langchain.html",
      //     },
      //   ],
      // },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/gregreindel/llm-exe" },
      { icon: "npm", link: "https://www.npmjs.com/package/llm-exe" },
    ],
  },
  markdown: {
    // codeTransformers: [transformerTwoslash()],
    theme: { light: "github-light-default", dark: "github-dark-default" },
  },
  vite: {
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import "./theme/style.css";`,
        },
      },
    }
  }
});
