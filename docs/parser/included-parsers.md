
# Default Included Parsers

[[toc]]
## String Parser
`string`
The default parser. Doesn't really parse, just passes through the string response with no modification.
Returns: string

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```:no-line-numbers
This is an example input message.
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```:no-line-numbers
This is an example input message.
```
  </CodeGroupItem>
</CodeGroup>



## String Extractor Parser
`stringExtract`
USe this parser to ensure the response is one of many specific strings you define. This parser doe not return the LLM's actual response, but works through the `enum` you provide and looks for a match. When it finds one, it returns the `enum` value, ensuring the response is exactly as expected.

Returns: string

> **Example Prompt:** <br>You need to reply with one of three options. Either stop, go forward, turn left, turn right.

```typescript:no-line-numbers
const parser = createParser("stringExtract", { 
    enum: [
        "stop",
        "go forward",
        "turn left",
        "turn right"
    ]
})
```

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```:no-line-numbers
go forward
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```:no-line-numbers
Go Forward.
```
  </CodeGroupItem>
</CodeGroup>

## List to Array
`listToArray`
Converts a list (separated by \n) to an array of strings.
Returns: string[]

> **Example Prompt:** <br>You need to reply with a list of test cases that should be written for the code I included below. You must reply in an unordered list.

```typescript:no-line-numbers
const parser = createParser("listToArray")
```

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers
[
 "Should return the default name if the function argument is null or undefined",
 "Should return function's name if function has a name property",
 "Should return the correct name if function is bound to an object",
 "Should return the correct name if function is anonymous",
 "Should return the correct name if the function's source has additional space",
 "Should return empty string if function has no applicable name.",
]
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```input:no-line-numbers
- Should return the default name if the function argument is null or undefined
- Should return function's name if function has a name property
- Should return the correct name if function is bound to an object
- Should return the correct name if function is anonymous
- Should return the correct name if the function's source has additional space 
- Should return empty string if function has no applicable name.
```
  </CodeGroupItem>
</CodeGroup>


## List to Key/Value[] 
`listToKeyValue`
Converts a 
Returns Array<{ key: string; value: string; }>

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers
[{
    "key": "Getting Started",
    "value": "To get started, we need to..."
},{
    "key": "Setting Up Your Account",
    "value": "To set up your account, you need to..."
}]
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```input:no-line-numbers
Getting Started: To get started, we need to...
Setting Up Your Account: To set up your account, you need to...
```
  </CodeGroupItem>
</CodeGroup>


## Markdown Code Block 
`markdownCodeBlock`
Returns { code: string; language: string; }

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers
{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
}
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```text:no-line-numbers
Below is the generated code:

```typescript
function add(a: number, b: number){
    return a + b;
}
``'
```
  </CodeGroupItem>
</CodeGroup>



## Markdown Code Blocks 
`markdownCodeBlocks`
Returns Array<{ code: string; language: string; }>

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers
[{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
}
{
    "code": "function subtract(a: number, b: number){\nreturn a - b;\n}",
    "language": "typescript"
}]
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```text:no-line-numbers
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
```
  </CodeGroupItem>
</CodeGroup>


## Replace String Template 
`replaceTemplateString`
Uses handlebars to parse the output.
Returns string.
<!-- <CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers

```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```input:no-line-numbers

```
  </CodeGroupItem>
</CodeGroup> -->


## List to JSON 
`listToJson`
Converts a list of key: value pairs (separated by \n) to an object. 

> **Example Prompt:** <br>You need to extract the following information. Reply only with: Color: the color\nName: the name\nType: the type

```typescript:no-line-numbers
const parser = createParser("listToArray")
```

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers
{
    "color": "red",
    "name": "apple"
    "type": "fruit"
}
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```input:no-line-numbers
Color: Red
Name: Apple
Type: Fruit
```
  </CodeGroupItem>
</CodeGroup>


## JSON 
`json`
Parse an expected stringified json object or array into a valid object. Schema can be passed in to enforce schema and provide default values.

<CodeGroup>
  <CodeGroupItem title="Parser Output" active>

```javascript:no-line-numbers
{
    "name": "Greg",
    "age": "89"
}
```
  </CodeGroupItem>
  <CodeGroupItem title="LLM Response">

```text:no-line-numbers
\`\`\`json
{ "name": "Greg", "age": "89" }
\`\`\`

or

{ \"name\": \"Greg\", \"age\": \"89\" }
```
  </CodeGroupItem>
</CodeGroup>
