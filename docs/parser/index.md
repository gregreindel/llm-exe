# Parser
When calling LLM's the response is ultimately a string. While you can (and will) instruct the LLM to respond with a number, or formatted as JSON... the response will still be a string.

Parsers are used to take the output from the LLM, and format it into a data type that is usable by your application. 

There are various default parsers included, and the parser class is easily extendable.

When combined with an LLM executor, the parser is responsible for providing type hints to the Typescript compiler on the expected output for the LLM executor.

**Note**: You can use and call methods on parsers directly, but they are usually passed to an [LLM executor](/executor/index.html) and then called internally. 
## Getting Started

### Working with Parsers
When working with output parsers, you have two options:

1. Use a default parser. 
2. Extend the base parser to create a custom output parser

####  Use a Default Parser

```ts
const parser = createParser("listToArray"); // see list of included parsers

// example output string from LLM
const exampleOutputFromLlm = `First, hover the services menu
Wait for the dropdown menu to appear
Click on the development link`;

// listToArray will split a string on line breaks 
const parsed = parser.parse(exampleOutputFromLlm);

/**
 * 
 * console.log(parsed);
 * 
 * [
 *   "First, hover the services menu",
 *   "Wait for the dropdown menu to appear",
 *   "Click on the development link"
 * ]
 * 
 */
```

#### Using a Parser with Schema
When instructing the LLM to respond with json or a format that can be parsed to json, it can be helpful to define schema. This allows you to validate, provide default values, and have a fully-typed response. In fact, the JSON Schema you define can be really useful (and re-used!) in your prompt. [See tips](/examples/concepts/working-with-json) for working with JSON.

```ts
import { utils, createParser } from "unnamed-package";

const schema = utils.defineSchema({
    type: "object",
    properties: {
      statement: { type: "string", default: "" },
      answer: { type: "string", default: "" },
      confidence: { type: "integer", default: 0 },
    },
    required: ["statement", "answer", "confidence"],
});

const parser = createParser("listToJson", schema);

const exampleOutputFromLlm = `Statement: The included document contains PII\nAnswer: No\nConfidence: 90`;

const parsed = parser.parse(exampleOutputFromLlm);
/**
 * 
 * console.log(parsed);
 * 
 * { 
 *   "statement": "The included document contains PII",
 *   "answer": "No",
 *   "confidence": 90
 * }
 * 
 */
```