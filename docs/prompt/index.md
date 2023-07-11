# Prompt

The prompt is the instruction for the LLM, usually sent in plain-text or an array of chat-style messages. When working with certain models, the prompt is formatted like chat messages, allowing you to control a system message, user message, and assistant message.

llm-exe provides a prompt interface to simplify working with prompts. Ultimately a prompt is a string, but building elaborate prompts can quickly get complicated. The prompt utility provides a foundation for building complex prompts.

- Support for text-based or chat-based prompts.
- Uses Handlebars as template engine, allowing you to use features such as custom templates, partials, functions, etc. See [handlebars documentation](https://handlebarsjs.com/guide/) for everything you can do.
- Infers types when they are provided.

Note: You can use and call methods on prompts directly, but they are usually passed to an LLM executor and then called internally.

There are 2 types of prompts included, along with a `BasePrompt` class that can be extended, if needed.

See:
- [Text Prompt](/prompt/text.html)
- [Chat Prompt](/prompt/chat.html)

## Basic Replacements
The object that you pass to `prompt.format` (or `.execute` when a prompt is part of an LLM executor) gets passed to the template engine, making all those variables available to you in your prompt template.

<PromptOutput example="prompt.basic.example1">

@[code{5-11} ts:no-line-numbers](../../examples/prompt/basic.ts)
</PromptOutput>

For advanced uses and working with custom helpers/partials, [see here](/prompt/advanced.html).

## Using Types with Prompts

<PromptOutput example="prompt.basic.example2">

@[code{27-40} ts:no-line-numbers](../../examples/prompt/basic.ts)
</PromptOutput>