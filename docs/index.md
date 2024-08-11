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
      link: /markdown-examples
    - theme: alt
      text: See Examples
      link: /api-examples
    - theme: text
      text: Github
      link: https://github.com/gregreindel/llm-exe

      
features:
  - title: Feature A
    details: Write functions powered by LLM's with easy to use building blocks.
  - title: Feature B
    details: Pure Javascript and Typescript. Allows you to pass and infer types.
  - title: Feature C
    details: Supercharge your prompts by using handlebars within prompt template.
  - title: Feature C
    details: Not very opinionated. You have control on how you use it.
  - title: Feature A
    details: Support for text-based and chat-based prompts (gpt-3.5-turbo and gpt-4).
  - title: Feature B
    details: Allow LLM's to call functions (or call other LLM executors).
  - title: Feature C
    details: Supercharge your prompts by using handlebars within prompt template.
  - title: 100% test coverage
    details: 100% test coverage


---

<div style="margin-top:60px; margin-left:auto;margin-right:auto; max-width:960px">

# Quick Example
```ts
export const instruction = `You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question below. Do not explain yourself 
  or ask questions. Answer with only yes or no.`;

export const prompt = createChatPrompt(instruction)
    .addUserMessage(input)
    .addSystemMessage(`yes or no:`);

export async function YesOrNoBot<I extends string>(
  input: I
): Promise<{ response: string }> {
  const llm = useLlm("openai.chat.v1", {
    model: "gpt-4o-mini",
  });

  const parser = createParser("stringExtract", { enum: ["yes", "no"]});
  return createLlmExecutor({ llm, prompt, parser }).execute({
    body,
  });
}
```

</div>
