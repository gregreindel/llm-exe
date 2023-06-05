## Prompt

The prompt is the instruction for the LLM, usually sent in plain-text. When working with certain models, the prompt is formatted like chat messages, allowing you to control a system message, user message, and assistant message.

llm-exe provides a prompt interface to simplify working with prompts. Ultimately a prompt is a string, but building elaborate prompts can quickly get complicated. The prompt utility provides a foundation for building complex prompts.

- Support for text-based or chat-based prompts.
- Uses Handlebars as template engine, allowing you to use features such as custom templates, partials, functions, etc. See [handlebars documentation](https://handlebarsjs.com/guide/) for everything you can do.
- Infers types when they are provided.

Note: You can use and call methods on prompts directly, but they are usually passed to an LLM executor and then called internally.

There are 2 types of prompts included, along with a `BasePrompt` class that can be extended, if needed.

See:
- [Text Prompt](/prompt/text.html)
- [Chat Prompt](/prompt/chat.html)

### Basic Replacements
The object that you pass to `prompt.format` (or `.execute` when a prompt is part of an LLM executor) gets passed to the template engine, making all those variables available to you in your prompt template.
```typescript
const prompt = createPrompt("text", "You are a customer service agent for SomeCompany. Your name is {{agentName}}.")

const formatted = prompt.format({ agentName: "Greg" })
/**
 * 
 * console.log(formatted)
 * 
 * You are a customer service agent for SomeCompany. Your name is Greg.
 * 
 */
```

For advanced uses and working with custom helpers/partials, [see here](/prompt/advanced.html).

## Using Types with Prompts

```typescript
// You can provide 
interface SomePromptInput {
    agentName: string;
}

const prompt = createChatPrompt<SomePromptInput>("Your name is {{agentName}}");

// Bad. Incorrect input, Typescript error.
// Argument of type '{ name: string; }' is not assignable to parameter of type 'SomePromptInput'.
prompt.format({name: "Greg" })

// Good: No problem, correct inputs
prompt.format({agentName: "Greg"})
```