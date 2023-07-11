import { createPrompt, createChatPrompt } from "@/prompt"

const exampleOne = () => {
// START example
const instruction = `You are a customer service agent for Some Company.

Your name is {{agentName}}.`

const prompt = createPrompt("text", instruction)

const formatted = prompt.format({ agentName: "Greg" })

console.log(formatted)

// exporting for docs
return {
    prompt,
    format: { agentName: "Greg" },
    display: formatted
}
// END example
}


const exampleTwo = () => {

// Example 2
interface SomePromptInput {
    agentName: string;
}

const prompt = createChatPrompt<SomePromptInput>("Your name is {{agentName}}");

// @ts-ignore (for example)
// Bad. Incorrect input, Typescript error.
// Argument of type '{ name: string; }' is not assignable to parameter of type 'SomePromptInput'.
prompt.format({name: "Greg" })

// Good: No problem, correct inputs
prompt.format({agentName: "Greg"})


// exporting for docs
return {
    prompt,
    format: { agentName: "Greg" },
    display: prompt
}
// END example
}


// // exporting for docs
export const examples = {
    example1: exampleOne,
    example2: exampleTwo,
}