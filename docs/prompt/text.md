# Text Prompt
The default prompt is a text prompt, and is meant for models such as xx and xx. 

You create a prompt using `createPrompt()`.

<GenericOutput example="prompt.text.exampleCreateTextPrompt">

<<< ../../examples/prompt/text.ts#exampleCreateTextPrompt
</GenericOutput>


When creating a prompt, you can optionally set an initial message.

<GenericOutput example="prompt.text.exampleCreateTextPromptWithInitial">

<<< ../../examples/prompt/text.ts#exampleCreateTextPromptWithInitial
</GenericOutput>


You can also add additional content to the prompt by calling `addToPrompt()` on the prompt.

<GenericOutput example="prompt.text.exampleCreateTextPromptAddToPrompt">

<<< ../../examples/prompt/text.ts#exampleCreateTextPromptAddToPrompt
</GenericOutput>


To use the prompt as input to an LLM, you can call the `format()` method on the prompt. The format method accepts an object, which is used to supply the prompt template with replacement values.

<GenericOutput example="prompt.text.exampleCreateTextPromptFormat">

<<< ../../examples/prompt/text.ts#exampleCreateTextPromptFormat
</GenericOutput>


Prompt methods are chainable
<GenericOutput example="prompt.text.exampleCreateTextPromptChainable">

<<< ../../examples/prompt/text.ts#exampleCreateTextPromptChainable
</GenericOutput>


By default, formatted text prompt messages are separated using 2 line breaks (\\n\\n). You can override this by defining a custom separator.

<GenericOutput example="prompt.text.exampleCreateTextPromptCustomDelimiter">

<<< ../../examples/prompt/text.ts#exampleCreateTextPromptCustomDelimiter
</GenericOutput>

See [prompt templates](/prompt/advanced.html) for more advanced prompt usage.

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