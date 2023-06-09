# Chat Prompt
The other type of prompt is a chat prompt. The chat prompt can be used with models such as gpt-3.5.turbo and gpt-4.

You create a chat prompt using `createPrompt("chat")` or `createChatPrompt()`.

<PromptOutput example="prompt.chat.exampleCreateChatPrompt">

@[code{4-7} ts:no-line-numbers](../../examples/prompt/chat.ts)
</PromptOutput>

When creating a chat prompt, you can optionally set an initial system message.

<PromptOutput example="prompt.chat.exampleCreateChatPromptWithSystem">

@[code{18-19} ts:no-line-numbers](../../examples/prompt/chat.ts)
</PromptOutput>



To use the prompt as input to an LLM, you can call the `format()` method on the prompt. The format method accepts an object, which is used to supply the prompt template with replacement values.

<PromptOutput example="prompt.chat.exampleCreateChatPromptUseFormat">

@[code{31-35} ts:no-line-numbers](../../examples/prompt/chat.ts)
</PromptOutput>



Chat prompts support more than just a basic text-based message. You can also add assistant and user content.

<PromptOutput example="prompt.chat.exampleCreateChatPromptWithAssistant">

@[code{49-54} ts:no-line-numbers](../../examples/prompt/chat.ts)
</PromptOutput>


See [prompt templates](/prompt/advanced.html) for more advanced prompt usage.

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