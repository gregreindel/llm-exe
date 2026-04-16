# Default Included Parsers

[[toc]]

## String Parser

`string`
The default parser. Doesn't really parse, it passes through the string response with no modification.
Returns: string

::: code-group

```[Output]
This is an example input message.
```

```[Response]
This is an example input message.
```

:::

## Number Parser

`number`
Extracts a number from the LLM response.
Returns: number

```ts
const parser = createParser("number");
```

::: code-group

```[Output]
42
```

```[Response]
The answer is 42.
```

:::

## Boolean Parser

`boolean`
Parses a boolean value from the LLM response. Recognizes common truthy/falsy patterns like "true", "false", "yes", "no".
Returns: boolean

```ts
const parser = createParser("boolean");
```

::: code-group

```[Output]
true
```

```[Response]
Yes, that is correct.
```

:::

## String Extractor Parser

`stringExtract`
Use this parser to ensure the response is one of many specific strings you define. This parser does not return the LLM's actual response, but works through the `enum` you provide and looks for a match. When it finds one, it returns the `enum` value, ensuring the response is exactly as expected.

Returns: string

> **Example Prompt:** <br>You need to reply with one of three options. Either stop, go forward, turn left, turn right.

```ts
const parser = createParser("stringExtract", {
  enum: ["stop", "go forward", "turn left", "turn right"],
});
```

Options:
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enum` | `string[]` | `[]` | The list of allowed values to match against. |
| `ignoreCase` | `boolean` | `false` | When `true`, matching is case-insensitive. |

::: code-group

```[Output]
go forward
```

```[Response]
Go Forward.
```

:::

## List to Array

`listToArray`
Converts a list (separated by \n) to an array of strings.
Returns: string[]

> **Example Prompt:** <br>You need to reply with a list of test cases that should be written for the code I included below. You must reply in an unordered list.

```ts
const parser = createParser("listToArray");
```

::: code-group

```[Output]
[
 "Should return the default name if the function argument is null or undefined",
 "Should return function's name if function has a name property",
 "Should return the correct name if function is bound to an object",
 "Should return the correct name if function is anonymous",
 "Should return the correct name if the function's source has additional space",
 "Should return empty string if function has no applicable name.",
]
```

```[Response]
- Should return the default name if the function argument is null or undefined
- Should return function's name if function has a name property
- Should return the correct name if function is bound to an object
- Should return the correct name if function is anonymous
- Should return the correct name if the function's source has additional space
- Should return empty string if function has no applicable name.
```

:::

## List to Key/Value[]

`listToKeyValue`
Converts a list of `key: value` pairs (separated by newlines) to an array of key/value objects.
Returns `Array<{ key: string; value: string; }>`

::: code-group

```[Output]
[{
    "key": "Getting Started",
    "value": "To get started, we need to..."
},{
    "key": "Setting Up Your Account",
    "value": "To set up your account, you need to..."
}]
```

```[Response]
Getting Started: To get started, we need to...
Setting Up Your Account: To set up your account, you need to...
```

:::

## Markdown Code Block

`markdownCodeBlock`
Extracts the **first** code block from the LLM response, including the language identifier. If the response contains no code blocks, returns `{ code: "", language: "" }`. For extracting all code blocks, see [`markdownCodeBlocks`](#markdown-code-blocks) below.
Returns: `{ code: string; language: string; }`

```ts
const parser = createParser("markdownCodeBlock");
```

::: code-group

```[Output]
{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
}
```

````[Response]
Below is the generated code:

```typescript
function add(a: number, b: number){
    return a + b;
}
``'
````

:::

## Markdown Code Blocks

`markdownCodeBlocks`
Extracts **all** code blocks from the LLM response, returning them as an array. Use this when the response may contain multiple code blocks. For extracting only the first code block, see [`markdownCodeBlock`](#markdown-code-block) above.
Returns: `Array<{ code: string; language: string; }>`

```ts
const parser = createParser("markdownCodeBlocks");
```

::: code-group

```[Output]
[{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
},
{
    "code": "function subtract(a: number, b: number){\nreturn a - b;\n}",
    "language": "typescript"
}]
```

````[Response]
Below is the generated code:

```typescript
function add(a: number, b: number){
    return a + b;
}
``'

And the next:

```typescript
function subtract(a: number, b: number){
    return a - b;
}
``'
````

:::

## Replace String Template

`replaceStringTemplate`
Runs Handlebars substitution on the LLM output, using the parser's second argument as the data. This is useful when you want the LLM to return a template (e.g. `"Hello {{name}}!"`) that gets filled in with runtime values before being returned to the caller.
Returns: string

```ts
const parser = createParser("replaceStringTemplate");
parser.parse("Hello {{name}}!", { name: "World" });
// => "Hello World!"
```

When used inside an executor, the original input is passed through as the attributes, so the LLM can emit templates that reference the caller's input variables:

```ts
const executor = createLlmExecutor({
  llm,
  prompt: createChatPrompt<{ name: string }>(
    "Respond with a greeting template that uses the handlebars variable {{'{{name}}'}}."
  ),
  parser: createParser("replaceStringTemplate"),
});

// LLM returns "Hello {{name}}!", the parser fills it in with the original input
await executor.execute({ name: "Ada" }); // => "Hello Ada!"
```

## List to JSON

`listToJson`
Converts a list of `key: value` pairs (separated by `\n`) into a **single flat object**. Despite the "list" in the name, this parser does not return an array — it folds all `key: value` lines into one object. Repeated keys overwrite earlier values silently, so this parser is best used when the LLM is asked to return a fixed set of named fields (one value per key).
Returns: `Record<string, string>` (or the shape defined by `schema`)

> **Example Prompt:** <br>You need to extract the following information. Reply only with: Color: the color\nName: the name\nType: the type

```typescript
const parser = createParser("listToJson");
```

Options:
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `keyTransform` | `"camelCase" \| "preserve"` | `"camelCase"` | How to normalize keys. `camelCase` (default) converts `"First Name"` → `firstName`. `preserve` keeps keys as written (trimmed). |
| `schema` | `JSONSchema` | — | Optional JSON schema to coerce and validate the parsed object. |

::: code-group

```[Output]
{
    "color": "red",
    "name": "apple",
    "type": "fruit"
}
```

```[Response]
Color: Red
Name: Apple
Type: Fruit
```

:::

::: warning
If you need a **list of objects** (e.g. `[{ name: "Alice" }, { name: "Bob" }]`), `listToJson` is not the right parser — repeated keys are collapsed. For an array of key/value pairs, use `listToKeyValue` above, or use [`json`](#json) with a schema that expects an array.
:::

## JSON

`json`
Parse an expected stringified json object or array into a valid object. Schema can be passed in to enforce schema and provide default values.

::: code-group

```[Output]
{
    "name": "Greg",
    "age": "89"
}
```

```[Response]
\`\`\`json
{ "name": "Greg", "age": "89" }
\`\`\`

or

{ \"name\": \"Greg\", \"age\": \"89\" }
```

:::

---

::: tip
You still need to instruct the LLM to respond with a certain format, and the parser will turn that response into a data-type useful to your application.
:::
