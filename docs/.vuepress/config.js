import { defineUserConfig, defaultTheme } from 'vuepress'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'

export default defineUserConfig({
  lang: 'en-US',
  title: 'llm-exe',
  description: '',
  theme: defaultTheme({
    navbar: [
        {
          text: 'Home',
          link: '/',
        },
        {
            text: 'Github',
            link: 'https://github.com/gregreindel/llm-exe',
          },
          {
            text: 'npm',
            link: 'https://www.npmjs.com/package/llm-exe',
          },
      ],
      sidebar: [
        {
          text: 'Getting Started',
          link: '',
          children: [
            // SidebarItem
            {
              text: 'What\'s a LLM Function',
              link: '/misc/what_is',
              children: [],
            },
            // string - page file path
            // '/foo/bar.md',
          ],
        },
        // SidebarItem
        {
          text: 'LLM',
          link: '/llm/',
          children: [
            // SidebarItem
            // {
            //   text: 'github',
            //   link: 'https://github.com',
            //   children: [],
            // },
            // string - page file path
            // '/foo/bar.md',
          ],
        },
  
        {
            text: 'Prompt',
            link: '/prompt/',
            children: [
              {
                text: 'Text Prompt',
                link: '/prompt/text',
                children: [],
              },
              {
                text: 'Chat Prompt',
                link: '/prompt/chat',
                children: [],
              },
              {
                text: 'Advanced Templates',
                link: '/prompt/advanced',
                children: [],
              },
            ],
          },
                  {
          text: 'Parser',
          link: '/parser',
          children: [
            // SidebarItem
            {
              text: 'Included Parsers',
              link: '/parser/included-parsers',
              children: [],
            },
            {
              text: 'Custom Parsers',
              link: '/parser/custom',
              children: [],
            },
            // string - page file path
            // '/foo/bar.md',
          ],
        },
        {
          text: 'LLM Executor',
          link: '/executor/',
          children: [
            // SidebarItem
            // {
            //   text: 'github',
            //   link: 'https://github.com',
            //   children: [],
            // },
            // string - page file path
            // '/foo/bar.md',
          ],
        },
        {
          text: 'State',
          link: '/state/',
          children: [],
        },
        {
          text: 'Examples',
          link: '',
          children: [
            // SidebarItem
            {
              text: 'Validator',
              link: '/examples/validator',
              children: [],
            },
            {
              text: 'Simple Combining',
              link: '/examples/combining',
              children: [],
            },
            
            // string - page file path
            // '/foo/bar.md',
          ],
        },
        {
          text: 'Other',
          link: '/misc',
          children: [
            // SidebarItem
            {
              text: 'Comparing to Langchain',
              link: '/misc/comparing-langchain.md',
              children: [],
            },
            // string - page file path
            // '/foo/bar.md',
          ],
        },
        // string - page file path
        // 'Comparing to Langchain',
      ],
  }),
  plugins: [
    googleAnalyticsPlugin({
      id: process.env.NODE_ENV !== "development" ? 'G-5YTJ8HRXNF' : '',
    }),
  ],
})