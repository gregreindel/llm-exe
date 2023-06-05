# Chat Prompt
The other type of prompt is a chat prompt. The chat prompt can be used with models such as gpt-3.5.turbo and gpt-4.

You create a chat prompt using `createPrompt("chat")` or `createChatPrompt()`.
```typescript:no-line-numbers
// create a simple text prompt
const prompt = createPrompt("chat")
// or const prompt = createChatPrompt()

/**
 * 
 * console.log(prompt)
 * 
 * TextPrompt {
 *   type: 'text',
 *   messages: [],
 *   partials: [],
 *   helpers: []
 * }
 * 
 */
```

When creating a chat prompt, you can optionally set an initial system message.
```typescript:no-line-numbers
const prompt = createChatPrompt("You are a customer service agent for SomeCompany.");
/**
 * 
 * console.log(prompt)
 * 
 * ChatPrompt {
 *   type: 'chat',
 *   messages: [{
 *     role: 'system',
 *     content: 'You are a customer service agent for SomeCompany.'
 *   }],
 *   partials: [],
 *   helpers: []
 * }
 * 
 */
```

To use the prompt as input to an LLM, you can call the `format()` method on the prompt. The format method accepts an object, which is used to supply the prompt template with replacement values.
```typescript:no-line-numbers
const prompt = createChatPrompt("You are a customer service agent for SomeCompany.");

// The output of format is an array of chat messages
const formatted = prompt.format({})
/**
 * 
 * console.log(formatted)
 * 
 * [{
 *   role: 'system',
 *   content: 'You are a customer service agent for SomeCompany.'
 * }]
 * 
 */
```

Chat prompts support more than just a basic text-based message. You can also add assistant and user content.
```typescript:no-line-numbers
const prompt = createChatPrompt("You are a customer service agent for SomeCompany.");

// You can add user and assistant messages
prompt.setUserMessage("Hello there")
prompt.setAssistantMessage("Welcome to SomeCompany, how can I help you?")

console.log(prompt.format({}))
/**
 * 
 * console.log(formatted)
 * 
 * [{
 *   role: 'system',
 *   content: 'You are a customer service agent for SomeCompany.'
 * },{
 *   role: 'user',
 *   content: 'Hello there'
 * },{
 *   role: 'assistant',
 *   content: 'Welcome to SomeCompany, how can I help you?'
 * }]
 * 
 */
```

See [prompt templates](prompt/advanced.html) for more advanced prompt usage.

## Chat Prompt Methods
`addUserMessage`
Appends a user message to the prompt.

`addAssistantMessage`
Appends an assistant message to the prompt.

`addSystemMessage`
Appends a system message to the prompt.

`addFromHistory`
Appends an array of existing chat history messages to the prompt.

`format`
Format the prompt for LLM. This processes the template as a handlebars template.

`validate`
Validate the prompt. Makes sure there are no unresolved tokens.