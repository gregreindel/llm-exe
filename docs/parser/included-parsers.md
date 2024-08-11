# Default Included Parsers

[[toc]]

## String Parser

`string`
The default parser. Doesn't really parse, just passes through the string response with no modification.
Returns: string

::: code-group

```[Parser Output]
This is an example input message.
```

```[LLM Response]
This is an example input message.
```

:::

## String Extractor Parser

`stringExtract`
USe this parser to ensure the response is one of many specific strings you define. This parser doe not return the LLM's actual response, but works through the `enum` you provide and looks for a match. When it finds one, it returns the `enum` value, ensuring the response is exactly as expected.

Returns: string

> **Example Prompt:** <br>You need to reply with one of three options. Either stop, go forward, turn left, turn right.

```ts
const parser = createParser("stringExtract", {
    enum: [
        "stop",
        "go forward",
        "turn left",
        "turn right"
    ]
})
```

::: code-group

```[Parser Output]
go forward
```

```[LLM Response]
Go Forward.
```

:::

## List to Array

`listToArray`
Converts a list (separated by \n) to an array of strings.
Returns: string[]

> **Example Prompt:** <br>You need to reply with a list of test cases that should be written for the code I included below. You must reply in an unordered list.

```ts
const parser = createParser("listToArray")
```

::: code-group

```[Parser Output]
[
 "Should return the default name if the function argument is null or undefined",
 "Should return function's name if function has a name property",
 "Should return the correct name if function is bound to an object",
 "Should return the correct name if function is anonymous",
 "Should return the correct name if the function's source has additional space",
 "Should return empty string if function has no applicable name.",
]
```

```[LLM Response]
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
Converts a
Returns Array<{ key: string; value: string; }>

::: code-group

```[Parser Output]
[{
    "key": "Getting Started",
    "value": "To get started, we need to..."
},{
    "key": "Setting Up Your Account",
    "value": "To set up your account, you need to..."
}]
```

```[LLM Response]
Getting Started: To get started, we need to...
Setting Up Your Account: To set up your account, you need to...
```

:::

## Markdown Code Block

`markdownCodeBlock`

::: code-group

```[Parser Output]
{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
}
```

````[LLM Response]
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
Returns Array<{ code: string; language: string; }>

::: code-group

```[Parser Output]
[{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
}
{
    "code": "function subtract(a: number, b: number){\nreturn a - b;\n}",
    "language": "typescript"
}]
```

````[LLM Response]
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

`replaceTemplateString`
Uses handlebars to parse the output.
Returns string.

## List to JSON

`listToJson`
Converts a list of key: value pairs (separated by \n) to an object.

> **Example Prompt:** <br>You need to extract the following information. Reply only with: Color: the color\nName: the name\nType: the type

```typescript
const parser = createParser("listToJson");
```

::: code-group

```[Parser Output]
{
    "color": "red",
    "name": "apple"
    "type": "fruit"
}
```

```[LLM Response]
Color: Red
Name: Apple
Type: Fruit
```

:::

## JSON

`json`
Parse an expected stringified json object or array into a valid object. Schema can be passed in to enforce schema and provide default values.

::: code-group

```[Parser Output]
{
    "name": "Greg",
    "age": "89"
}
```

```[LLM Response]
\`\`\`json
{ "name": "Greg", "age": "89" }
\`\`\`

or

{ \"name\": \"Greg\", \"age\": \"89\" }
```

:::
