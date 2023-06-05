# Text Prompt
The default prompt is a text prompt, and is meant for models such as xx and xx. 

You create a prompt using `createPrompt()`.

```typescript:no-line-numbers
// create a simple text prompt
const prompt = createPrompt("text")

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

When creating a prompt, you can optionally set an initial message.
```typescript:no-line-numbers
// create a simple text prompt with an initial message
const initial = "You are a customer service agent for SomeCompany.";
const prompt = createPrompt("text", initial)

/**
 * 
 * console.log(prompt)
 * 
 * TextPrompt {
 *   type: 'text',
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

You can also add additional content to the prompt by calling `addToPrompt()` on the prompt.
```typescript:no-line-numbers
// create a simple text prompt with an initial system message
const initial = "You are a customer service agent for SomeCompany.";
const prompt = createPrompt("text", initial)

// add an additional system message to the prompt
prompt.addToPrompt("You should never admit that you are AI.");

/**
 * 
 * console.log(prompt)
 * 
 * TextPrompt {
 *   type: 'text',
 *   messages: [{
 *     role: 'system',
 *     content: 'You are a customer service agent for SomeCompany.'
 *   },{
 *     role: 'system',
 *     content: 'You should never admit that you are AI.'
 *   }],
 *   partials: [],
 *   helpers: []
 * }
 * 
 */
```

To use the prompt as input to an LLM, you can call the `format()` method on the prompt. The format method accepts an object, which is used to supply the prompt template with replacement values.

```typescript:no-line-numbers

// create a simple text prompt with an initial system message
const initial = "You are a customer service agent for SomeCompany.";
const prompt = createPrompt("text", initial)

// add an additional system message to the prompt
prompt.addToPrompt("You should never admit that you are AI.");

// format the prompt with values
const formatted = prompt.format({});

/**
 * 
 * console.log(formatted)
 * 
 * You are a customer service agent for SomeCompany.
 * 
 * You should never admit that you are AI.
 * 
 */

```
Prompt methods are chainable
```typescript:no-line-numbers
const initial = "You are a customer service agent for SomeCompany.";
const prompt = createPrompt("text", initial)

// you can also chain all prompt methods (except format)
prompt
  .addToPrompt("You should never admit that you are AI.")
  .addToPrompt("Begin!")

/**
 * 
 * console.log(prompt.format({}))
 * 
 * You are a customer service agent for SomeCompany.
 * 
 * You should never admit that you are AI.
 * 
 * Begin!
 * 
 */


```

By default, formatted text prompt messages are separated using 2 line breaks (\\n\\n). You can override this by defining a custom separator.
```typescript:no-line-numbers
const initial = "You are a customer service agent for SomeCompany.";
const prompt = createPrompt("text", initial)
  .addToPrompt("You should never admit that you are AI.")
  .addToPrompt("Begin!")

// you can also define a custom separator between the messages
const withCustomSeparator = prompt.format({}, "\n---\n")

/**
 * 
 * console.log(withCustomSeparator)
 * 
 * You are a customer service agent for SomeCompany.
 * ---
 * You should never admit that you are AI.
 * ---
 * Begin!
 * 
 */

```
See [prompt templates](prompt/advanced.html) for more advanced prompt usage.

#### Text Prompt Methods

**.addToPrompt()**
Adds content to the prompt.
@param `content` {string} The content to be added to the prompt.

**.registerPartial()**
`partials` {<{template: string; name: string;}>} Additional partials that can be made available to the template parser.

**.registerHelpers()**
`helpers` {<{handler: function; name: string;}>} Additional helper functions that can be made available to the template parser.

**.format()**
`format`
Processes the prompt template and returns prompt ready for LLM.