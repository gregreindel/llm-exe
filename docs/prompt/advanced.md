# Prompts with Templates
Handlebars is used as a template engine when generating the prompt, so you can take advantage of advanced template features in the prompt. See full capabilities [here](https://handlebarsjs.com/guide/).

Below is a simple example showing syntax for replacing simple variables in the template.
```typescript:no-line-numbers
const prompt = createPrompt("chat", "Your name is {{agentName}}")
const formatted = prompt.format({agentName: "Greg"})

/**
 * 
 * console.log(formatted) 
 * 
 * [{
 *   role: 'system',
 *   content: 'Your name is Greg' 
 * }]
 * 
 */
 
```

Here is a slightly more advanced example showing a template that uses the `if` and `each` helpers supplies by Handlebars.
```typescript:no-line-numbers
const prompt = createPrompt("chat", "Your name is {{agentName}}")

const template = `{{#if fruits.length}}
Ask about one of these fruits: 
{{#each fruits as | fruit |}}
- {{fruit}}
{{/each}}
{{/if}}`;

prompt.addSystemMessage(template)

console.log(prompt.format({ agentName: "Greg", fruits: ["apple", "banana"] })) 
/**
 * 
 * Outputs: 
 * 
 * [{ 
 *   role: 'system', 
 *    content: 'Your name is Greg' 
 * },
 * { 
 *   role: 'system',
 *   content: 'Ask about one of these fruits: \n- apple\n- banana\n'
 * }]
 * 
 * /
```

Below is a robust example showing multiple variables, and defining types.

```typescript:no-line-numbers

interface PromptTemplate {
  actions: {
    name: string;
    description: string;
  }[];
  previousSteps: {
    thought: string;
    action: string;
    result: string;
  }[];
}

const template = `You are an agent that can only perform the following actions:

# Actions
{{#each actions as | action |}}
{{ action.name }} ({{ action.description }})
{{/each}}

# Previous Steps Taken
{{#each previousSteps as | previousStep |}}
Thought: {{previousStep.thought}}
Action: {{previousStep.action}}
{{/each}}`;

const instruction = `What step should we take? Must be one of: {{#each actions as | action |}}, {{ action.name }}{{/each}}.`;

// some data from state or your application
const history = [
  { role: "user", content: "Hey!" },
  { role: "assistant", content: "Hi, how are you?" },
  { role: "user", content: "Good. What day is it?" }
];
const actions = [
  { name: "say_hi", description: "Provide an initial greeting." },
  { name: "say_bye", description: "Say goodbye at the end of a conversation." },
  { name: "ask_question", description: "Ask the user a question." },
  { name: "provide_answer", description: "Provide an answer to a question" }
];
const previousSteps = [
  { thought: "I should say hi", action: "say_hi", result: "Hi, how are you?" }
];

const prompt = createChatPrompt<PromptTemplate>(template)
  .addFromHistory(history)
  .addSystemMessage(instruction);

// prompt.format is well-typed based on the generic you passed into createChatPrompt
const formatted = prompt.format({ actions, previousSteps });

/**
 * console.log(formatted)
[
  {
    role: `system`,
    content: `You are an agent that can only perform the following actions:
      
      # Actions
      say_hi (Provide an initial greeting.)
      say_bye (Say goodbye at the end of a conversation.)
      ask_question (Ask the user a question.)
      provide_answer (Provide an answer to the user&#x27;s question)
      
      # Previous Steps Taken
      Thought: I should say hi
      Action: say_hi`
  },
  { role: `user`, content: `Hey!` },
  { role: `assistant`, content: `Hi, how are you?` },
  { role: `user`, content: `Good. What day is it?` },
  {
    role: `system`,
    content: `What step should we take? Must be one of: say_hi, say_bye, ask_question, provide_answer.`,
  },
];
*/
/*
```

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