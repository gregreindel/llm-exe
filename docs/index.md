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
  - title: Prompt Templates
    details: Supercharge your prompts by using handlebars within prompt template.
  - title: Control
    details: Not very opinionated. You have control on how you use it.
  - title: Chat or Text Prompts
    details: Support for text-based and chat-based prompts (gpt-3.5-turbo and gpt-4).
  - title: Function Calling
    details: Allow LLM's to call functions (or call other LLM executors).
  - title: Use {{variables}}
    details: Supercharge your prompts by using handlebars within prompt template.
  - title: Test Coverage
    details: 100% test coverage


---

<div style="margin-top:60px; margin-left:auto;margin-right:auto; max-width:960px">

# Quick Example
```ts
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
    .addSystemMessage(`yes or no:`);

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
</div>
