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
```ts:line-numbers
import * as llmExe from "llm-exe";

/**
 * Define a yes/no llm-powered function
 */
export async function YesOrNoBot<I extends string>(input: I) {
  const llm = llmExe.useLlm("openai.gpt-4o-mini");

  const instruction = `You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question below. Do not explain yourself 
  or ask questions. Answer with only yes or no.`;

  const prompt = llmExe
    .createChatPrompt(instruction)
    .addUserMessage(input)
    .addUserMessage(`yes or no:`);

  const parser = llmExe.createParser("stringExtract", { enum: ["yes", "no"] });
  return llmExe.createLlmExecutor({ llm, prompt, parser }).execute({ input });
}
```
```ts
const isTheSkyBlue = await YesOrNoBot(`Can the sky be blue?`)
// yes

const isGrassRed = await YesOrNoBot(`Is grass usually red?`)
// no

```

# Want to use a different model?
All you need to do is change this one line to use any of the supported models. Make sure you have configured API keys.
```ts:line-numbers
import * as llmExe from "llm-exe";

/**
 * Define a yes/no llm-powered function
 */
export async function YesOrNoBot<I extends string>(input: I) {
  const llm = llmExe.useLlm("openai.gpt-4o-mini"); // [!code focus] 
  // const llm = llmExe.useLlm("openai.gpt-4o"); // or
  // const llm = llmExe.useLlm("google.gemini-2.0-flash"); // or
  // const llm = llmExe.useLlm("xai.grok-2"); // or
  // const llm = llmExe.useLlm("anthropic.claude-3-7-sonnet"); // or
  // const llm = llmExe.useLlm("deepseek.chat"); // or
  // const llm = llmExe.useLlm("anthropic.claude-3-opus"); // or
  // const llm = llmExe.useLlm("google.gemini-1.5-pro"); // or
  // ..and many more!


  const instruction = `You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question below. Do not explain yourself 
  or ask questions. Answer with only yes or no.`;

  const prompt = llmExe
    .createChatPrompt(instruction)
    .addUserMessage(input)
    .addUserMessage(`yes or no:`);

  const parser = llmExe.createParser("stringExtract", { enum: ["yes", "no"] });
  return llmExe.createLlmExecutor({ llm, prompt, parser }).execute({ input });
}
```

<!-- # Want to see more examples?
::: details Click me to toggle the code
```ts:line-numbers


```
::: -->
</div>
