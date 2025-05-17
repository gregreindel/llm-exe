---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: llm-exe
  text: ""
  tagline: A package that provides simplified base components to make building and maintaining LLM-powered applications easier.
  image:
    src: https://assets.llm-exe.com/logo.png
    alt: llm-exe
  actions:
    - theme: brand
      text: Documentation
      link: /intro/install.html
    - theme: alt
      text: See Examples
      link: /examples
    - theme: text
      text: Github
      link: https://github.com/gregreindel/llm-exe

features:
  - title: Modular
    details: Write functions powered by LLM's with easy to use building blocks.
  - title: Few Dependencies
    details: Pure Javascript and Typescript. Allows you to pass and infer types.
  - title: Use {{variables}}
    details: Supercharge your prompts by using handlebars expressions and functions.
  - title: Control
    details: Not very opinionated. You have control on how you use it.
  - title: Chat or Text Prompts
    details: Support for text-based and chat-based prompts.
  - title: Function Calling
    details: Allow LLM's to call functions (or call other LLM executors).
  - title: Prompt Templates
    details: Build reusable prompt template parts.
  - title: Test Coverage
    details: 100% test coverage
---

<div style="margin-top:60px; margin-left:auto;margin-right:auto; max-width:960px">

# Quick Example

<<< ../examples/writeCodeFromSpec.ts#inner

```ts
const code = await writeCodeFromSpec("add two numbers together");
console.log(code.code); // => function add(a: number, b: number) { ... }
```

</div>
