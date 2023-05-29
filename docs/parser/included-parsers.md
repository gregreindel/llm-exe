
### Default Included Parsers

#### String Parser - `string`
The default parser. Doesn't really parse, just passes through the string response.

Input:
```:no-line-numbers
This is an example input message.
```
Output:
```:no-line-numbers
This is an example input message.
```

#### List to Array `listToArray`
Converts a list (separated by \n) to an array of strings.
Returns string[]
```input:no-line-numbers
- Should return the default name if the function argument is null or undefined
- Should return function's name if function has a name property
- Should return the correct name if function is bound to an object
- Should return the correct name if function is anonymous
- Should return the correct name if the function's source has additional space 
- Should return empty string if function has no applicable name.
```

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

#### List to Key/Value[] `listToKeyValue`
Converts a 
Returns Array<{ key: string; value: string; }>

Input
```input:no-line-numbers
Getting Started: To get started, we need to...
Setting Up Your Account: To set up your account, you need to...
```
Output
```javascript:no-line-numbers
[{
    "key": "Getting Started",
    "value": "To get started, we need to..."
},{
    "key": "Setting Up Your Account",
    "value": "To set up your account, you need to..."
}]
```


#### Markdown Code Block - `markdownCodeBlock`
Returns { code: string; language: string; }

```text:no-line-numbers
Below is the generated code:

\`\`\`typescript:no-line-numbers
function add(a: number, b: number){
    return a + b;
}
\`\`\`
```
```javascript:no-line-numbers
{
    "code": "function add(a: number, b: number){\nreturn a + b;\n}",
    "language": "typescript"
}
```


#### Markdown Code Blocks - `markdownCodeBlocks`
Returns Array<{ code: string; language: string; }>

```text:no-line-numbers
Below is the generated code:

\`\`\`typescript:no-line-numbers
function add(a: number, b: number){
    return a + b;
}
\`\`\`

And the next:

\`\`\`typescript:no-line-numbers
function subtract(a: number, b: number){
    return a - b;
}
\`\`\`
```
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

#### Replace String Template `replaceTemplateString`
Uses handlebars to parse the output.
Returns string.

#### List to JSON `listToJson`
Converts a 


```input:no-line-numbers
Color: Red
Name: Apple
Type: Fruit
```

```javascript:no-line-numbers
{
    "color": "red",
    "name": "apple"
    "type": "fruit"
}
```


#### JSON - `json`
Parse an expected stringified json object or array into a valid object. Schema can be passed in to enforce schema and provide default values.

Input
```text:no-line-numbers
\`\`\`json
{ "name": "Greg", "age": "89" }
\`\`\`

or

{ \"name\": \"Greg\", \"age\": \"89\" }
```

Input
```javascript:no-line-numbers
{
    "name": "Greg",
    "age": "89"
}
```
