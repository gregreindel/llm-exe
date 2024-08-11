# Prompts with Templates
Handlebars is used as a template engine when generating the prompt, so you can take advantage of advanced template features in the prompt. See full capabilities [here](https://handlebarsjs.com/guide/).

Below is a simple example showing syntax for replacing simple variables in the template.

<PromptOutput example="prompt.advanced.withReplacements">

<<< ../../examples/prompt/advanced.ts#withReplacements
</PromptOutput>


Here is a slightly more advanced example showing a template that uses the `if` and `each` helpers supplies by Handlebars.
<PromptOutput example="prompt.advanced.withReplacementsTwo">

<<< ../../examples/prompt/advanced.ts#withReplacementsTwo
</PromptOutput>




Below is a robust example showing multiple variables, and defining types.

<PromptOutput example="prompt.advanced.withReplacementsAndTypes">

<<< ../../examples/prompt/advanced.ts#withReplacementsAndTypes
</PromptOutput>


## Prompt Template Default Helpers
Prompts are powered by handlebars, and you are able to register your own custom helpers, adding super powers to your prompt templates. Some core helpers are included by default.
- pluralize
- eq
- neq
- ifCond


## Prompt Template Default Partials
Some core partials are included by default:

### MarkdownCode
<CodeGroup>
  <CodeGroupItem title="Raw Template" active>

```:no-line-numbers
{{> MarkdownCode code='const name="Greg";' language='typescript' }}
```
  </CodeGroupItem>
  <CodeGroupItem title="Parsed">

```:no-line-numbers
'''typescript
const name="Greg";
'''
```
  </CodeGroupItem>
</CodeGroup>

### DialogueHistory

<CodeGroup>
  <CodeGroupItem title="Raw Template" active>

```:no-line-numbers
// Basic example
{{> DialogueHistory key='keyOfTheChatHistory' }}

//  With title
{{> DialogueHistory title='The conversation is below:' key='keyOfTheChatHistory' }}

// Setting user name
{{> DialogueHistory key='keyOfTheChatHistory' user='Greg' }}

// Setting user and assistant - be creative!
{{> DialogueHistory key='keyOfTheChatHistory' assistant='Thought' user='Observation' }}


// Assuming you passed the following:
{
  keyOfTheChatHistory: [{
    role: "user",
    content: "Hello?",
  },{
    role: "user",
    content: "Hi! How can I help you?",
  },{
    role: "user",
    content: "I was wondering if you were open",
  },{
    role: "user",
    content: "We sure are!",
  }]
}
```
  </CodeGroupItem>
  <CodeGroupItem title="Parsed">

```:no-line-numbers
// Basic example
User: Hello?
Assistant: Hi! How can I help you?
User: I was wondering if you were open
Assistant: We sure are!

//  With title
The conversation is below:
User: Hello?
Assistant: Hi! How can I help you?
User: I was wondering if you were open
Assistant: We sure are!

// Setting user name
Greg: Hello?
Assistant: Hi! How can I help you?
Greg: I was wondering if you were open
Assistant: We sure are!

// Setting user and assistant - be creative!
Thought: Hello?
Observation: Hi! How can I help you?
Thought: I was wondering if you were open
Observation: We sure are!

```
  </CodeGroupItem>
</CodeGroup>

<!-- ### JsonSchema
```:no-line-numbers
```
### JsonSchemaExampleJson
```:no-line-numbers
``` -->


## Template Custom Partials & Helpers
You can load custom Handlebars partials and helpers a few different ways:


### 1. Pass them in when initializing the prompt

```typescript:no-line-numbers

// these could be managed elsewhere and imported here
const helpers = [{
  handler: (date: Date) => "morning", name: "getTimeOfDay"
}]


const partials = [{
  template: `Phone: 1-800-000-0000
Support Email: support@example.com
Website: www.example.com`, name: "partialContactInformation"
}]

// pass in `{ helpers, partials }` when creating prompt.
const prompt = createPrompt("text", "You are a cowboy.", { helpers, partials })
```

### 2. Set environment variable pointing to a file that exports them (optional)

```env:no-line-numbers
# .env
# Custom helpers: Set this as a path to a file that exports custom helpers.
CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH=/var/app/build/prompt-template-helpers.js
```

```env:no-line-numbers
# .env
# Custom partials: Set this as a path to a file that exports custom partials.
CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH=/var/app/build/prompt-template-partials.js
```

Example files
```typescript:no-line-numbers
// prompt-template-helpers.js
export function getTimeOfDay(date: Date): string {
  // implementation
  return "morning"
}

// prompt-template-helpers.js
export const partialContactInformation = `Phone: 1-800-000-0000
Support Email: support@example.com
Website: www.example.com`;


// some other file
// Then can be used in prompts anywhere like:
const prompt = createPrompt("chat", "Your name is {{agentName}}.\n\nBelow is our contact information: \n{{> partialContactInformation}}\n\nThe time of day is {{getTimeOfDay}}")

const format = prompt.format({ agentName: "Greg" })

/**
 * 
 * console.log(format) 
 * (line breaks for readability)
 * 
 * [{ 
 *   role: 'system', 
 *    content: 'Your name is Greg.
 * 
 *              Below is our contact information:
 *              Phone: 1-800-000-0000
 *              Support Email: support@example.com
 *              Website: www.example.com
 * 
 *              The time of day is morning' 
 * }
 * 
 * /
```

## Extending `BasePrompt`
// TODO: elaborate. Until then check the source, it should have comments.