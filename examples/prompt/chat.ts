import { createPrompt, createChatPrompt } from "@/prompt";

const exampleCreateChatPrompt = () => {
// create a simple chat prompt
const prompt = createPrompt("chat")
// or const prompt = createChatPrompt()

// exporting for docs
return {
    prompt,
    format: {},
    display: prompt
}
// END example
}
    
const exampleCreateChatPromptWithSystem = () => {
const message = `You are a customer service agent for Some Company.`
const prompt = createPrompt("chat", message)

// exporting for docs
return {
prompt,
format: {},
display: prompt
}
// END example
}

const exampleCreateChatPromptUseFormat = () => {
const message = `You are a customer service agent for Some Company.`
const prompt = createPrompt("chat", message)

// The output of format is an array of chat messages
const formatted = prompt.format({});

console.log(formatted)

// exporting for docs
return {
prompt,
format: {},
display: formatted
}
// END example
}

const exampleCreateChatPromptWithAssistant = () => {
const message = `You are a customer service agent for Some Company.`
const prompt = createChatPrompt(message)
    
// You can add user and assistant messages
prompt.addUserMessage("Hello there")
prompt.addAssistantMessage("Welcome to Some Company, how can I help you?")

console.log(prompt.format({}))
    
// exporting for docs
return {
    prompt,
    format: {},
    display: prompt.format({})

}
// END example
}

// // exporting for docs
export const examples = {
    exampleCreateChatPrompt,
    exampleCreateChatPromptWithSystem,
    exampleCreateChatPromptUseFormat,
    exampleCreateChatPromptWithAssistant
}